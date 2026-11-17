import { MongoClient, type Collection, type Db } from 'mongodb';

/*
 * MongoDB connection and collections.
 *
 *   documentations  one per documentation            _id = documentation id
 *   pages           live copy + working copy (draft) _id = "<doc>/<slug>"
 *   media           screenshots stored in Cloudinary _id = Cloudinary public id
 *   activity        editor activity log
 *   feedback        "Was this page helpful?" votes
 *   settings        site texts (single document, _id = "site")
 *   users           editor accounts (email, password hash, role)
 */

export type PageVersion = {
  /** How `body` is written: Markdown (imports, starter content) or HTML (saved from the visual editor). */
  format?: 'md' | 'html';
  title: string;
  description: string;
  body: string;
  updated: Date;
  updatedBy: string | null;
};
export type DocumentationDoc = { _id: string; title: string; description: string; order: number };
export type PageDoc = {
  _id: string;
  doc: string;
  slug: string;
  order: number;
  /** What readers see. null = never published (or unpublished). */
  live: PageVersion | null;
  /** The editors' working copy. null = no changes since the last publish. */
  draft: (PageVersion & { status: 'draft' | 'review' }) | null;
};
/** A record of an image stored in Cloudinary. The bytes are not kept in MongoDB. */
export type MediaDoc = { _id: string; doc: string; name: string; url: string; size: number; width: number; height: number; createdAt: Date };
export type ActivityDoc = { t: Date; who: string; what: string };
export type FeedbackDoc = { t: Date; doc: string; slug: string; helpful: boolean };
export type UserDoc = { _id: string; email: string; name: string; role: 'writer' | 'reviewer'; passwordHash: string; createdAt: Date };
export type SettingsDoc = {
  _id: 'site';
  productVersion: string;
  heroTitle: string;
  heroLead: string;
  /** The link to the main website in the top bar. An empty address hides it. */
  siteLinkLabel?: string;
  siteLinkUrl?: string;
};

// One client per server process; survives hot reloads in `next dev`.
const globalForMongo = globalThis as unknown as { _adbMongo?: Promise<MongoClient>; _adbIndexes?: Promise<unknown> };

function client(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set. Add it to .env.local (see .env.example).');
  if (!globalForMongo._adbMongo) {
    const pending = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000, maxPoolSize: 10 }).connect();
    // A failed first connection must not be cached forever.
    pending.catch(() => {
      if (globalForMongo._adbMongo === pending) globalForMongo._adbMongo = undefined;
    });
    globalForMongo._adbMongo = pending;
  }
  return globalForMongo._adbMongo;
}

export async function db(): Promise<Db> {
  const database = (await client()).db(); // database name comes from the connection string
  globalForMongo._adbIndexes ??= Promise.all([
    database.collection('pages').createIndex({ doc: 1, order: 1 }),
    database.collection('activity').createIndex({ t: -1 }),
    database.collection('media').createIndex({ doc: 1 }),
    database.collection('users').createIndex({ email: 1 }, { unique: true }),
  ]).catch((e) => console.error('Could not create MongoDB indexes', e));
  return database;
}

export type Collections = {
  documentations: Collection<DocumentationDoc>;
  pages: Collection<PageDoc>;
  media: Collection<MediaDoc>;
  activity: Collection<ActivityDoc>;
  feedback: Collection<FeedbackDoc>;
  settings: Collection<SettingsDoc>;
  users: Collection<UserDoc>;
};

export async function collections(): Promise<Collections> {
  const d = await db();
  return {
    documentations: d.collection<DocumentationDoc>('documentations'),
    pages: d.collection<PageDoc>('pages'),
    media: d.collection<MediaDoc>('media'),
    activity: d.collection<ActivityDoc>('activity'),
    feedback: d.collection<FeedbackDoc>('feedback'),
    settings: d.collection<SettingsDoc>('settings'),
    users: d.collection<UserDoc>('users'),
  };
}
