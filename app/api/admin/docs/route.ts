import { NextResponse } from 'next/server';
import { handle, readJson, requireUser } from '@/lib/api';
import { createDoc, createPage, deleteDoc, logActivity } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req) => {
  const user = await requireUser(req);
  const b = await readJson<{ title?: string; description?: string }>(req);
  const doc = await createDoc(String(b.title ?? ''), String(b.description ?? ''));
  const page = await createPage(
    doc.id,
    { title: 'Introduction', body: `What ${doc.title} covers and who it is for.\n\n## In this guide\n\n- First topic\n- Second topic\n` },
    user.name,
  );
  await logActivity(user.name, `created the documentation “${doc.title}”`);
  return NextResponse.json({ doc, slug: page.slug });
});

/** Deletes a documentation and every page in it. Reviewers only. */
export const DELETE = handle(async (req) => {
  const user = await requireUser(req, 'reviewer');
  const { id } = await readJson<{ id?: string }>(req);
  const { doc, pages } = await deleteDoc(String(id ?? ''));
  await logActivity(user.name, `deleted the documentation “${doc.title}” (${pages} page${pages === 1 ? '' : 's'})`);
  return NextResponse.json({ ok: true, pages });
});
