import { NextResponse } from 'next/server';
import { handle, HttpError, requireUser } from '@/lib/api';
import { createDoc, createPage, getDoc, logActivity } from '@/lib/content';
import { renderMarkdown } from '@/lib/render';
import { docxToPages, mdToPages, type ImportedPage } from '@/lib/importDocx';

export const dynamic = 'force-dynamic';
const MAX = 60 * 1024 * 1024;

/** Page description = the first sentence of the page. */
function firstSentence(md: string): string {
  const intro = md.split(/^#{1,6} /m)[0];
  return (renderMarkdown(intro).text.split(/(?<=[.!?])\s/)[0] ?? '').slice(0, 200);
}

/** Imports a Word file, a Markdown file or pasted Markdown as draft pages. */
export const POST = handle(async (req) => {
  const user = await requireUser(req);
  const form = await req.formData();
  const file = form.get('file');
  const split = form.get('split') === '1';
  let markdown = form.get('markdown');
  let mdName = '';
  const isFile = file instanceof File;
  const isDocx = isFile && /\.docx$/i.test(file.name);
  if (isFile && !isDocx) {
    // A Markdown file is handled exactly like pasted Markdown.
    if (!/\.(md|markdown|txt)$/i.test(file.name)) throw new HttpError(400, 'Choose a Word file (.docx) or a Markdown file (.md).');
    if (file.size > 2 * 1024 * 1024) throw new HttpError(413, 'That Markdown file is larger than 2 MB.');
    markdown = await file.text();
    mdName = file.name;
  }
  if (isDocx && file.size > MAX) throw new HttpError(413, 'That Word file is larger than 60 MB.');
  if (!isDocx && (typeof markdown !== 'string' || !markdown.trim())) throw new HttpError(400, 'Nothing to import.');

  let docId = String(form.get('doc') ?? '');
  const newTitle = String(form.get('newDocTitle') ?? '').trim();
  if (docId === '__new') {
    const fallback = isFile ? file.name.replace(/\.[a-z]+$/i, '').replace(/[_-]+/g, ' ') : 'New documentation';
    docId = (await createDoc(newTitle || fallback, '')).id;
  }
  const doc = await getDoc(docId);
  if (!doc) throw new HttpError(404, 'That documentation does not exist.');

  let pages: ImportedPage[];
  let images = 0;
  let notes: string[] = [];
  let source = mdName || 'pasted Markdown';
  if (isDocx) {
    source = file.name;
    try {
      ({ pages, images, notes } = await docxToPages(Buffer.from(await file.arrayBuffer()), doc.id, file.name, split));
    } catch (e) {
      console.error(e);
      throw new HttpError(400, 'This file could not be converted. Open it in Word, save it again as .docx, and retry.');
    }
  } else {
    pages = mdToPages(markdown as string, mdName.replace(/\.[a-z]+$/i, '').replace(/[_-]+/g, ' ') || 'Untitled page', split);
  }
  if (!pages.length) throw new HttpError(400, 'No content was found to import.');

  const created: { doc: string; slug: string; title: string }[] = [];
  for (const p of pages) {
    const page = await createPage(doc.id, { title: p.title, description: firstSentence(p.md), body: p.md }, user.name);
    created.push({ doc: doc.id, slug: page.slug, title: page.title });
  }
  await logActivity(user.name, `imported ${created.length} page${created.length === 1 ? '' : 's'} from ${source} into ${doc.title}`);
  return NextResponse.json({ doc: doc.id, pages: created, images, notes });
});
