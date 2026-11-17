import { NextResponse } from 'next/server';
import { handle, readJson, requireUser } from '@/lib/api';
import { createUser, listUsers, removeUser } from '@/lib/auth';
import { logActivity } from '@/lib/content';

export const dynamic = 'force-dynamic';

/** Editor accounts. Reviewers only. */
export const GET = handle(async (req) => {
  await requireUser(req, 'reviewer');
  return NextResponse.json({ users: await listUsers() });
});

export const POST = handle(async (req) => {
  const me = await requireUser(req, 'reviewer');
  const b = await readJson<{ name?: string; email?: string; password?: string; role?: string }>(req);
  const user = await createUser({ name: String(b.name ?? ''), email: String(b.email ?? ''), password: String(b.password ?? ''), role: String(b.role ?? '') });
  await logActivity(me.name, `added ${user.name} as a ${user.role}`);
  return NextResponse.json({ user });
});

export const DELETE = handle(async (req) => {
  const me = await requireUser(req, 'reviewer');
  const { id } = await readJson<{ id?: string }>(req);
  const user = await removeUser(String(id ?? ''), me.id);
  await logActivity(me.name, `removed ${user.name}’s account`);
  return NextResponse.json({ ok: true });
});
