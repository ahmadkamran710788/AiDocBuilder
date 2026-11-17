import { NextResponse } from 'next/server';
import { getLivePage, recordFeedback } from '@/lib/content';

export const dynamic = 'force-dynamic';

/** "Was this page helpful?" votes, appended to content/data/feedback.jsonl. */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as { doc?: string; slug?: string; helpful?: boolean } | null;
  if (!b || typeof b.helpful !== 'boolean' || !(await getLivePage(String(b.doc), String(b.slug)))) {
    return NextResponse.json({ error: 'Invalid feedback.' }, { status: 400 });
  }
  await recordFeedback({ doc: String(b.doc), slug: String(b.slug), helpful: b.helpful });
  return NextResponse.json({ ok: true });
}
