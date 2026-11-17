/*
 * Loads the starter content in ./seed into the portal:
 * screenshots go to Cloudinary, documentations and pages go to MongoDB.
 * Safe to run again: it only adds what is missing, and points any page that
 * still uses an old /media/... image path at the Cloudinary copy.
 *
 *   npm run seed
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { v2 as cloudinary } from 'cloudinary';
import matter from 'gray-matter';
import { MongoClient } from 'mongodb';

const ROOT = path.join(import.meta.dirname, '..', 'seed');
const FOLDER = process.env.CLOUDINARY_FOLDER || 'aidocbuilder-docs';

for (const key of ['MONGODB_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']) {
  if (!process.env[key]) {
    console.error(`${key} is not set. Add it to .env.local.`);
    process.exit(1);
  }
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
  api_key: process.env.CLOUDINARY_API_KEY.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
  secure: true,
});
const client = await new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 }).connect();
const db = client.db();
const count = { documentations: 0, pages: 0, media: 0, repointed: 0 };

/** Inserts a document unless one with the same _id is already there. */
async function add(name, doc) {
  const r = await db.collection(name).updateOne({ _id: doc._id }, { $setOnInsert: doc }, { upsert: true });
  if (r.upsertedCount) count[name]++;
}

/** Uploads seed/media/<doc>/<file> once and returns its Cloudinary URL (null if the file is not in ./seed). */
async function imageUrl(docId, file) {
  const publicId = `${FOLDER}/${docId}/${path.basename(file, path.extname(file))}`;
  const known = await db.collection('media').findOne({ _id: publicId });
  if (known?.url) return known.url;
  const local = path.join(ROOT, 'media', docId, file);
  if (!(await fs.stat(local).catch(() => null))) return null;
  const r = await cloudinary.uploader.upload(local, { public_id: publicId, overwrite: true, resource_type: 'image' });
  await add('media', { _id: publicId, doc: docId, name: file, url: r.secure_url, size: r.bytes, width: r.width, height: r.height, createdAt: new Date() });
  return r.secure_url;
}

/** Replaces every /media/<doc>/<file> reference in a page body with its Cloudinary URL. */
async function withCloudImages(body) {
  const refs = [...new Set(body.match(/\/media\/[a-z0-9-]+\/[A-Za-z0-9._-]+/g) ?? [])];
  for (const ref of refs) {
    const [, , docId, file] = ref.split('/');
    const url = await imageUrl(docId, file);
    if (url) body = body.split(ref).join(url);
  }
  return body;
}

try {
  const docs = JSON.parse(await fs.readFile(path.join(ROOT, 'documentations.json'), 'utf8'));
  for (const d of docs) {
    await add('documentations', { _id: d.id, title: d.title, description: d.description ?? '', order: d.order ?? 99 });
    const pageDir = path.join(ROOT, 'docs', d.id);
    for (const file of (await fs.readdir(pageDir).catch(() => [])).filter((f) => f.endsWith('.md'))) {
      const slug = file.slice(0, -3);
      if (await db.collection('pages').findOne({ _id: `${d.id}/${slug}` }, { projection: { _id: 1 } })) continue;
      const { data, content } = matter(await fs.readFile(path.join(pageDir, file), 'utf8'));
      await add('pages', {
        _id: `${d.id}/${slug}`,
        doc: d.id,
        slug,
        order: typeof data.order === 'number' ? data.order : 99,
        live: {
          title: data.title ?? slug,
          description: data.description ?? '',
          body: await withCloudImages(content.replace(/^\n+/, '')),
          updated: data.updated ? new Date(data.updated) : new Date(),
          updatedBy: data.updatedBy ?? null,
        },
        draft: null,
      });
      console.log(`  added ${d.id}/${slug}`);
    }
  }

  // Pages already in the database that still point at /media/...: switch them to Cloudinary.
  const old = await db.collection('pages').find({ $or: [{ 'live.body': /\/media\// }, { 'draft.body': /\/media\// }] }).toArray();
  for (const p of old) {
    const set = {};
    if (p.live?.body.includes('/media/')) set['live.body'] = await withCloudImages(p.live.body);
    if (p.draft?.body.includes('/media/')) set['draft.body'] = await withCloudImages(p.draft.body);
    await db.collection('pages').updateOne({ _id: p._id }, { $set: set });
    count.repointed++;
    console.log(`  images moved to Cloudinary: ${p._id}`);
  }

  if (count.pages) await db.collection('activity').insertOne({ t: new Date(), who: 'System', what: `imported ${count.pages} pages from the Word guide into ${docs.length} documentations` });
  console.log(`Done for "${db.databaseName}": +${count.documentations} documentations, +${count.pages} pages, +${count.media} screenshots uploaded to Cloudinary, ${count.repointed} pages re-pointed.`);
} finally {
  await client.close();
}
