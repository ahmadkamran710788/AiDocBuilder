import { collections } from '@/lib/db';
import { CLOUDINARY_FOLDER } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

/** Old /media/<doc>/<file> links: screenshots now live in Cloudinary, so redirect there. */
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const parts = (await ctx.params).path;
  if (parts.length === 2 && parts.every((p) => /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(p))) {
    const { media } = await collections();
    const row = await media.findOne({ _id: `${CLOUDINARY_FOLDER}/${parts[0]}/${parts[1].replace(/\.[a-z]+$/i, '')}` });
    if (row?.url) return Response.redirect(row.url, 302);
  }
  return new Response('Not found', { status: 404 });
}
