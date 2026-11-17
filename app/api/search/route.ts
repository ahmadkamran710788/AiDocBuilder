import { NextResponse } from 'next/server';
import { search } from '@/lib/search';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').slice(0, 100);
  return NextResponse.json({ hits: await search(q, url.searchParams.get('doc') || undefined) });
}
