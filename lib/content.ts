import path from 'node:path';
import { uploadImage } from './cloudinary';
import { collections, type PageDoc, type PageVersion, type SettingsDoc } from './db';

/*
 * Content store on MongoDB (see lib/db.ts for the collections).
 *
 * Every page document holds two copies: `live` (what readers see) and `draft`
 * (the editors' working copy). Publishing moves the draft over the live copy,
 * so editing a live page never changes the public site until it is approved.
 */

export type Doc = { id: string; title: string; description: string; order: number };
export type Status = 'draft' | 'review' | 'published';
export type PageMeta = {
  doc: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  updated: string | null;
  updatedBy: string | null;
};
export type BodyFormat = 'md' | 'html';
export type Page = PageMeta & { body: string; format: BodyFormat };
export type WorkingPage = Page & { status: Status; hasLive: boolean };
export type AdminPage = PageMeta & { status: Status; hasLive: boolean };
export type Activity = { t: number; who: string; what: string };
export type SiteSettings = Required<Omit<SettingsDoc, '_id'>>;

const ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
/** Top-level URL segments a documentation id may not use. */
const RESERVED = new Set(['admin', 'api', 'share', 'sitemap', 'robots', 'favicon']);
/** Page slugs taken by routes inside a documentation. */
const RESERVED_SLUGS = new Set(['print']);

export class ContentError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function isValidId(id: unknown): id is string {
  return typeof id === 'string' && ID_RE.test(id);
}
function assertIds(doc: unknown, slug: unknown): asserts doc is string {
  if (!isValidId(doc)) throw new ContentError('Invalid documentation.');
  if (!isValidId(slug)) throw new ContentError('Invalid page.');
}

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48)
      .replace(/-+$/, '') || 'page'
  );
}

const pageId = (doc: string, slug: string) => `${doc}/${slug}`;
const clean = (s: string, max: number) => s.trim().slice(0, max);

function toPage(p: PageDoc, v: PageVersion): Page {
  return {
    doc: p.doc,
    slug: p.slug,
    order: p.order,
    title: v.title,
    description: v.description,
    body: v.body,
    format: v.format === 'html' ? 'html' : 'md',
    updated: v.updated ? new Date(v.updated).toISOString() : null,
    updatedBy: v.updatedBy,
  };
}
function toWorking(p: PageDoc): WorkingPage | null {
  if (p.draft) return { ...toPage(p, p.draft), status: p.draft.status, hasLive: !!p.live };
  if (p.live) return { ...toPage(p, p.live), status: 'published', hasLive: true };
  return null;
}
const byOrder = <T extends PageMeta>(a: T, b: T) => a.order - b.order || a.title.localeCompare(b.title);

/* ---------- documentations ---------- */

export async function listDocs(): Promise<Doc[]> {
  const { documentations } = await collections();
  const rows = await documentations.find().sort({ order: 1, title: 1 }).toArray();
  return rows.map(({ _id, ...d }) => ({ id: _id, ...d }));
}

/** Documentations readers can see: those with at least one live page. */
export async function listPublicDocs(): Promise<Doc[]> {
  const { pages } = await collections();
  const [docs, withLive] = await Promise.all([listDocs(), pages.distinct('doc', { live: { $ne: null } })]);
  const visible = new Set(withLive);
  return docs.filter((d) => visible.has(d.id));
}

export async function getDoc(id: string): Promise<Doc | null> {
  if (!isValidId(id)) return null;
  const { documentations } = await collections();
  const row = await documentations.findOne({ _id: id });
  if (!row) return null;
  const { _id, ...d } = row;
  return { id: _id, ...d };
}

export async function createDoc(title: string, description: string): Promise<Doc> {
  title = clean(title, 80);
  if (!title) throw new ContentError('Give the documentation a name.');
  const { documentations } = await collections();
  const docs = await listDocs();
  const base = slugify(title);
  let id = base;
  for (let n = 2; RESERVED.has(id) || docs.some((d) => d.id === id); n++) id = `${base}-${n}`;
  const doc: Doc = {
    id,
    title,
    description: clean(description, 240) || `Guides for ${title}.`,
    order: docs.reduce((m, d) => Math.max(m, d.order), 0) + 1,
  };
  await documentations.insertOne({ _id: id, title: doc.title, description: doc.description, order: doc.order });
  return doc;
}

/** Deletes a documentation together with all of its pages (live and draft). Pictures stay in Cloudinary. */
export async function deleteDoc(id: string): Promise<{ doc: Doc; pages: number }> {
  const doc = await requireDoc(id);
  const { documentations, pages } = await collections();
  const removed = await pages.deleteMany({ doc: doc.id });
  await documentations.deleteOne({ _id: doc.id });
  return { doc, pages: removed.deletedCount };
}

async function requireDoc(doc: unknown): Promise<Doc> {
  const d = isValidId(doc) ? await getDoc(doc) : null;
  if (!d) throw new ContentError('That documentation does not exist.', 404);
  return d;
}

/* ---------- pages: reading ---------- */

export async function getLivePage(doc: string, slug: string): Promise<Page | null> {
  if (!isValidId(doc) || !isValidId(slug)) return null;
  const { pages } = await collections();
  const p = await pages.findOne({ _id: pageId(doc, slug), live: { $ne: null } });
  return p?.live ? toPage(p, p.live) : null;
}

export async function listLivePages(doc: string): Promise<Page[]> {
  if (!isValidId(doc)) return [];
  const { pages } = await collections();
  const rows = await pages.find({ doc, live: { $ne: null } }, { projection: { draft: 0 } }).toArray();
  return rows.map((p) => toPage(p, p.live!)).sort(byOrder);
}

/** Live pages of every public documentation, in one query. */
export async function listAllLivePages(): Promise<Map<string, Page[]>> {
  const { pages } = await collections();
  const rows = await pages.find({ live: { $ne: null } }, { projection: { draft: 0 } }).toArray();
  const out = new Map<string, Page[]>();
  for (const p of rows) out.set(p.doc, [...(out.get(p.doc) ?? []), toPage(p, p.live!)]);
  for (const list of out.values()) list.sort(byOrder);
  return out;
}

/* ---------- pages: editing ---------- */

/** The copy an editor works on: the draft when there is one, otherwise the live page. */
export async function getWorkingPage(doc: string, slug: string): Promise<WorkingPage | null> {
  if (!isValidId(doc) || !isValidId(slug)) return null;
  const { pages } = await collections();
  const p = await pages.findOne({ _id: pageId(doc, slug) });
  return p ? toWorking(p) : null;
}

export async function listAdminPages(): Promise<AdminPage[]> {
  const { pages } = await collections();
  const [docs, rows] = await Promise.all([
    listDocs(),
    pages.find({}, { projection: { 'live.body': 0, 'draft.body': 0 } }).toArray(),
  ]);
  const rank = new Map(docs.map((d, i) => [d.id, i]));
  return rows
    .map((p) => toWorking(p))
    .filter((p): p is WorkingPage => !!p && rank.has(p.doc))
    .map(({ body: _body, format: _format, ...meta }) => meta)
    .sort((a, b) => rank.get(a.doc)! - rank.get(b.doc)! || byOrder(a, b));
}

type PageInput = { title: string; description?: string; body: string; format?: BodyFormat };

function version(input: PageInput, who: string): PageVersion {
  if (input.body.length > 2_000_000) throw new ContentError('This page is too long to save.', 413);
  return {
    format: input.format === 'html' ? 'html' : 'md',
    title: clean(input.title, 120) || 'Untitled page',
    description: clean(input.description ?? '', 240),
    body: input.body.replace(/\r/g, ''),
    updated: new Date(),
    updatedBy: who,
  };
}

export async function createPage(docId: string, input: PageInput, who: string): Promise<Page> {
  await requireDoc(docId);
  const { pages } = await collections();
  const draft = { ...version(input, who), status: 'draft' as const };
  const siblings = await pages.find({ doc: docId }, { projection: { slug: 1, order: 1 } }).toArray();
  const taken = new Set(siblings.map((p) => p.slug));
  const order = siblings.reduce((m, p) => Math.max(m, p.order), 0) + 1;
  const base = slugify(draft.title);
  for (let n = 1; n < 500; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    if (taken.has(slug) || RESERVED_SLUGS.has(slug)) continue;
    const row: PageDoc = { _id: pageId(docId, slug), doc: docId, slug, order, live: null, draft };
    try {
      await pages.insertOne(row);
      return toPage(row, draft);
    } catch (e) {
      if ((e as { code?: number }).code !== 11000) throw e; // someone else just took this slug: try the next
    }
  }
  throw new ContentError('Could not find a free address for this page. Change its title and try again.', 409);
}

export async function saveDraft(doc: string, slug: string, input: PageInput, who: string, status: 'draft' | 'review' = 'draft'): Promise<Page> {
  assertIds(doc, slug);
  const { pages } = await collections();
  const draft = { ...version(input, who), status };
  const p = await pages.findOneAndUpdate({ _id: pageId(doc, slug) }, { $set: { draft } }, { returnDocument: 'after' });
  if (!p) throw new ContentError('That page does not exist.', 404);
  return toPage(p, draft);
}

export async function setDraftStatus(doc: string, slug: string, status: 'draft' | 'review'): Promise<Page> {
  assertIds(doc, slug);
  const { pages } = await collections();
  const p = await pages.findOneAndUpdate({ _id: pageId(doc, slug), draft: { $ne: null } }, { $set: { 'draft.status': status } }, { returnDocument: 'after' });
  if (!p?.draft) throw new ContentError('There is no draft of this page to move.', 409);
  return toPage(p, p.draft);
}

export async function publishPage(doc: string, slug: string, who: string): Promise<Page> {
  assertIds(doc, slug);
  const { pages } = await collections();
  const cur = await pages.findOne({ _id: pageId(doc, slug) });
  if (!cur?.draft) throw new ContentError('There is nothing new to publish for this page.', 409);
  if (cur.draft.status !== 'review') throw new ContentError('Submit the page for review before publishing it.', 409);
  const { status: _status, ...rest } = cur.draft;
  const live: PageVersion = { ...rest, updated: new Date(), updatedBy: rest.updatedBy ?? who };
  // The filter repeats the draft timestamp so a version edited after review is never published unseen.
  const res = await pages.updateOne({ _id: cur._id, 'draft.status': 'review', 'draft.updated': cur.draft.updated }, { $set: { live, draft: null } });
  if (!res.modifiedCount) throw new ContentError('This page changed while you were reviewing it. Reload and check it again.', 409);
  return toPage(cur, live);
}

/** Moves a page one place up or down in its documentation's menu. */
export async function movePage(doc: string, slug: string, direction: 'up' | 'down'): Promise<void> {
  assertIds(doc, slug);
  const { pages } = await collections();
  const rows = await pages.find({ doc }, { projection: { 'live.body': 0, 'draft.body': 0 } }).toArray();
  const list = rows
    .map((p) => toWorking(p))
    .filter((p): p is WorkingPage => !!p)
    .sort(byOrder);
  const from = list.findIndex((p) => p.slug === slug);
  if (from < 0) throw new ContentError('That page does not exist.', 404);
  const to = from + (direction === 'up' ? -1 : 1);
  if (to < 0 || to >= list.length) return;
  [list[from], list[to]] = [list[to], list[from]];
  // Renumber the whole menu so the order is always 1, 2, 3…
  await pages.bulkWrite(list.map((p, i) => ({ updateOne: { filter: { _id: pageId(doc, p.slug) }, update: { $set: { order: i + 1 } } } })));
}

/** Throws away the working copy. A page that was never published disappears. */
export async function discardDraft(doc: string, slug: string): Promise<Page> {
  assertIds(doc, slug);
  const { pages } = await collections();
  const cur = await pages.findOne({ _id: pageId(doc, slug) });
  if (!cur?.draft) throw new ContentError('This page has no draft to discard.', 409);
  if (cur.live) await pages.updateOne({ _id: cur._id }, { $set: { draft: null } });
  else await pages.deleteOne({ _id: cur._id });
  return toPage(cur, cur.draft);
}

/** Takes a live page off the public site and keeps its text as a draft. */
export async function unpublishPage(doc: string, slug: string): Promise<Page> {
  assertIds(doc, slug);
  const { pages } = await collections();
  const cur = await pages.findOne({ _id: pageId(doc, slug) });
  if (!cur?.live) throw new ContentError('This page is not live.', 409);
  const draft = cur.draft ?? { ...cur.live, status: 'draft' as const };
  await pages.updateOne({ _id: cur._id }, { $set: { live: null, draft } });
  return toPage(cur, cur.live);
}

/* ---------- media ---------- */

/** Uploads a screenshot to Cloudinary, records it, and returns its public URL. */
export async function saveMedia(doc: string, fileName: string, data: Buffer): Promise<string> {
  await requireDoc(doc);
  if (data.length > 10 * 1024 * 1024) throw new ContentError('That image is too large to store.', 413);
  const base = slugify(path.basename(fileName, path.extname(fileName))) || 'image';
  const name = `${base}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  let img;
  try {
    img = await uploadImage(data, doc, name);
  } catch (e) {
    console.error(e);
    throw new ContentError('The image could not be uploaded to Cloudinary. Try again.', 502);
  }
  const { media } = await collections();
  await media.insertOne({ _id: img.publicId, doc, name: `${base}.webp`, url: img.url, size: img.bytes, width: img.width, height: img.height, createdAt: new Date() });
  return img.url;
}

/* ---------- activity log and feedback ---------- */

export async function listActivity(limit = 12): Promise<Activity[]> {
  const { activity } = await collections();
  const rows = await activity.find().sort({ t: -1 }).limit(limit).toArray();
  return rows.map((a) => ({ t: new Date(a.t).getTime(), who: a.who, what: a.what }));
}
export async function logActivity(who: string, what: string) {
  const { activity } = await collections();
  await activity.insertOne({ t: new Date(), who, what });
}
export async function recordFeedback(entry: { doc: string; slug: string; helpful: boolean }) {
  const { feedback } = await collections();
  await feedback.insertOne({ t: new Date(), ...entry });
}

/* ---------- site settings ---------- */

export const DEFAULT_SETTINGS: SiteSettings = {
  productVersion: 'Data Definitions Editor 7.2.0',
  heroTitle: 'AIDocBuilder documentation',
  heroLead:
    'Guides for setting up processes, keys, parties and agents, uploading transactions, and fixing common problems. Pick a documentation to start, or search everything above.',
  siteLinkLabel: 'aidocbuilder.com',
  siteLinkUrl: 'https://aidocbuilder.com',
};

export async function getSettings(): Promise<SiteSettings> {
  const { settings } = await collections();
  const row = await settings.findOne({ _id: 'site' });
  return {
    productVersion: row?.productVersion || DEFAULT_SETTINGS.productVersion,
    heroTitle: row?.heroTitle || DEFAULT_SETTINGS.heroTitle,
    heroLead: row?.heroLead || DEFAULT_SETTINGS.heroLead,
    // These two may be saved empty on purpose (no link), so only a missing value falls back.
    siteLinkLabel: row?.siteLinkLabel ?? DEFAULT_SETTINGS.siteLinkLabel,
    siteLinkUrl: row?.siteLinkUrl ?? DEFAULT_SETTINGS.siteLinkUrl,
  };
}
export async function saveSettings(input: Partial<SiteSettings>): Promise<SiteSettings> {
  const siteLinkUrl = clean(String(input.siteLinkUrl ?? ''), 300);
  if (siteLinkUrl && !/^https?:\/\/[^\s/]+\.[^\s]+$/i.test(siteLinkUrl)) throw new ContentError('The website address must start with https:// (or leave it empty to hide the link).');
  const next: SiteSettings = {
    productVersion: clean(String(input.productVersion ?? ''), 80) || DEFAULT_SETTINGS.productVersion,
    heroTitle: clean(String(input.heroTitle ?? ''), 120) || DEFAULT_SETTINGS.heroTitle,
    heroLead: clean(String(input.heroLead ?? ''), 400) || DEFAULT_SETTINGS.heroLead,
    siteLinkLabel: clean(String(input.siteLinkLabel ?? ''), 40) || siteLinkUrl.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/.*$/, ''),
    siteLinkUrl,
  };
  const { settings } = await collections();
  await settings.updateOne({ _id: 'site' }, { $set: next }, { upsert: true });
  return next;
}
