import { NextResponse } from 'next/server';
import { handle, HttpError, readJson } from '@/lib/api';
import { authConfigured, authenticate, createSessionToken, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req) => {
  if (!authConfigured()) throw new HttpError(503, 'Sign-in is not set up on this server.');
  const b = await readJson<{ email?: string; password?: string }>(req);
  const user = await authenticate(String(b.email ?? ''), String(b.password ?? ''));
  if (!user) {
    await new Promise((r) => setTimeout(r, 700)); // slow down guessing
    throw new HttpError(401, 'That email and password do not match an account.');
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(user), sessionCookieOptions);
  return res;
});
