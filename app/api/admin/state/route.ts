import { NextResponse } from 'next/server';
import { handle, requireUser } from '@/lib/api';
import { getSettings, listActivity, listAdminPages, listDocs } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req) => {
  const user = await requireUser(req);
  const [docs, pages, activity, settings] = await Promise.all([listDocs(), listAdminPages(), listActivity(), getSettings()]);
  return NextResponse.json({ user, docs, pages, activity, settings });
});
