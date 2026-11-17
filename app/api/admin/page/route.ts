import { NextResponse } from 'next/server';
import { handle, HttpError, readJson, requireUser } from '@/lib/api';
import { editorHtml } from '@/lib/render';
import {
  createPage, discardDraft, getDoc, getWorkingPage, logActivity, movePage, publishPage, saveDraft, setDraftStatus, unpublishPage,
} from '@/lib/content';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  await requireUser(req);
  const url = new URL(req.url);
  const page = await getWorkingPage(url.searchParams.get('doc') ?? '', url.searchParams.get('slug') ?? '');
  if (!page) throw new HttpError(404, 'That page does not exist.');
  // The visual editor works on HTML, whatever format the page was stored in.
  const { body: _body, format: _format, ...meta } = page;
  return NextResponse.json({ page: { ...meta, body: editorHtml(page) } });
});

type Body = {
  action: 'create' | 'save' | 'move-up' | 'move-down' | 'submit' | 'request-changes' | 'publish' | 'discard' | 'unpublish';
  doc: string;
  slug?: string;
  title?: string;
  description?: string;
  body?: string;
  /** 'html' when the body comes from the visual editor. */
  format?: 'md' | 'html';
};

export const POST = handle(async (req) => {
  const b = await readJson<Body>(req);
  const user = await requireUser(req, b.action === 'publish' || b.action === 'request-changes' || b.action === 'unpublish' ? 'reviewer' : undefined);
  const doc = String(b.doc ?? '');
  const slug = String(b.slug ?? '');
  const docTitle = (await getDoc(doc))?.title ?? doc;
  const content = () => {
    if (typeof b.body !== 'string') throw new HttpError(400, 'Page content is missing.');
    return { title: String(b.title ?? ''), description: String(b.description ?? ''), body: b.body, format: b.format === 'html' ? ('html' as const) : ('md' as const) };
  };

  switch (b.action) {
    case 'create': {
      const p = await createPage(doc, content(), user.name);
      await logActivity(user.name, `created “${p.title}” in ${docTitle}`);
      return NextResponse.json({ doc, slug: p.slug });
    }
    case 'save': {
      const p = await saveDraft(doc, slug, content(), user.name);
      await logActivity(user.name, `saved a draft of “${p.title}”`);
      return NextResponse.json({ doc, slug });
    }
    case 'submit': {
      // Saves what is in the editor (if sent) and moves it to "In review".
      const p = typeof b.body === 'string' ? await saveDraft(doc, slug, content(), user.name, 'review') : await setDraftStatus(doc, slug, 'review');
      await logActivity(user.name, `sent “${p.title}” for review`);
      return NextResponse.json({ doc, slug });
    }
    case 'request-changes': {
      const p = await setDraftStatus(doc, slug, 'draft');
      await logActivity(user.name, `asked for changes on “${p.title}”`);
      return NextResponse.json({ doc, slug });
    }
    case 'publish': {
      const p = await publishPage(doc, slug, user.name);
      await logActivity(user.name, `published “${p.title}” in ${docTitle}`);
      return NextResponse.json({ doc, slug });
    }
    case 'discard': {
      const p = await discardDraft(doc, slug);
      await logActivity(user.name, `discarded the draft of “${p.title}”`);
      return NextResponse.json({ doc, slug });
    }
    case 'move-up':
    case 'move-down': {
      await movePage(doc, slug, b.action === 'move-up' ? 'up' : 'down');
      return NextResponse.json({ doc, slug });
    }
    case 'unpublish': {
      const p = await unpublishPage(doc, slug);
      await logActivity(user.name, `unpublished “${p.title}”`);
      return NextResponse.json({ doc, slug });
    }
    default:
      throw new HttpError(400, 'Unknown action.');
  }
});
