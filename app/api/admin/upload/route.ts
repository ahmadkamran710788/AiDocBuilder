import { NextResponse } from 'next/server';
import { handle, HttpError, requireUser } from '@/lib/api';
import { saveMedia } from '@/lib/content';
import { toWebp } from '@/lib/importDocx';

export const dynamic = 'force-dynamic';
const MAX = 15 * 1024 * 1024;

export const POST = handle(async (req) => {
  await requireUser(req);
  const form = await req.formData();
  const file = form.get('file');
  const doc = String(form.get('doc') ?? '');
  if (!(file instanceof File)) throw new HttpError(400, 'Choose an image to upload.');
  if (file.size > MAX) throw new HttpError(413, 'That image is larger than 15 MB.');
  let webp: Buffer;
  try {
    webp = await toWebp(Buffer.from(await file.arrayBuffer()));
  } catch {
    throw new HttpError(400, 'That file could not be read as an image. Try a PNG, JPG or WebP.');
  }
  const base = file.name.replace(/\.[^.]+$/, '') || 'screenshot';
  const url = await saveMedia(doc, `${base}.webp`, webp);
  return NextResponse.json({ url, alt: base.replace(/[-_]+/g, ' ') });
});
