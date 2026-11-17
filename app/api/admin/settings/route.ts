import { NextResponse } from 'next/server';
import { handle, readJson, requireUser } from '@/lib/api';
import { logActivity, saveSettings, type SiteSettings } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req) => {
  const user = await requireUser(req, 'reviewer');
  const settings = await saveSettings(await readJson<Partial<SiteSettings>>(req));
  await logActivity(user.name, 'updated the site settings');
  return NextResponse.json({ settings });
});
