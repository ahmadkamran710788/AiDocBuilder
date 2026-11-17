import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { collections, type UserDoc } from './db';

/*
 * Editor sign-in. Every editor has an account in the `users` collection:
 * email, a scrypt password hash, and a role.
 *   writer    create, edit, upload, submit for review
 *   reviewer  everything a writer can do, plus approve and publish, site
 *             settings, and managing editor accounts
 * The session is an HMAC-signed, http-only cookie; each request re-checks the
 * account, so removing a user or changing a role takes effect at once.
 *
 * The first account comes from ADMIN_EMAIL / ADMIN_PASSWORD: it is created
 * the first time someone signs in with them while there are no users yet.
 */

export type Role = 'writer' | 'reviewer';
export type User = { id: string; name: string; email: string; role: Role };

export const SESSION_COOKIE = 'adb_session';
const MAX_AGE = 60 * 60 * 12; // 12 hours

export class AuthError extends Error {}

const secret = () => process.env.SESSION_SECRET || '';
/** Sign-in needs SESSION_SECRET; without it the panel stays locked. */
export const authConfigured = () => secret().length >= 16;

const sign = (payload: string) => crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
function safeEqual(a: string, b: string): boolean {
  return crypto.timingSafeEqual(crypto.createHash('sha256').update(a).digest(), crypto.createHash('sha256').update(b).digest());
}

/* ---------- passwords ---------- */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  return `scrypt$${salt.toString('base64url')}$${crypto.scryptSync(password, salt, 64).toString('base64url')}`;
}
function verifyPassword(password: string, stored: string): boolean {
  const [kind, salt, hash] = stored.split('$');
  if (kind !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64url');
  const actual = crypto.scryptSync(password, Buffer.from(salt, 'base64url'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}
// Compared against when the email is unknown, so both cases take the same time.
const DUMMY_HASH = hashPassword(crypto.randomBytes(12).toString('hex'));

/* ---------- accounts ---------- */

const normalEmail = (email: string) => email.trim().toLowerCase();
const toUser = (u: UserDoc): User => ({ id: u._id, name: u.name, email: u.email, role: u.role });

function validate(input: { name: string; email: string; password: string; role: string }) {
  const email = normalEmail(input.email);
  const name = input.name.trim().slice(0, 60);
  if (!name) throw new AuthError('Enter the person’s name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) throw new AuthError('Enter a valid email address.');
  if (input.password.length < 10) throw new AuthError('Use a password of at least 10 characters.');
  if (input.password.length > 200) throw new AuthError('That password is too long.');
  if (input.role !== 'writer' && input.role !== 'reviewer') throw new AuthError('Choose a role.');
  return { email, name, role: input.role as Role };
}

export async function createUser(input: { name: string; email: string; password: string; role: string }): Promise<User> {
  const { email, name, role } = validate(input);
  const { users } = await collections();
  const doc: UserDoc = { _id: crypto.randomUUID(), email, name, role, passwordHash: hashPassword(input.password), createdAt: new Date() };
  try {
    await users.insertOne(doc);
  } catch (e) {
    if ((e as { code?: number }).code === 11000) throw new AuthError('There is already an account with that email.');
    throw e;
  }
  return toUser(doc);
}

export async function listUsers(): Promise<User[]> {
  const { users } = await collections();
  return (await users.find().sort({ createdAt: 1 }).toArray()).map(toUser);
}

export async function removeUser(id: string, actingUserId: string): Promise<User> {
  if (id === actingUserId) throw new AuthError('You cannot remove your own account.');
  const { users } = await collections();
  const target = await users.findOne({ _id: id });
  if (!target) throw new AuthError('That account no longer exists.');
  await users.deleteOne({ _id: id });
  return toUser(target);
}

/** Creates the first reviewer from ADMIN_EMAIL / ADMIN_PASSWORD while the users collection is empty. */
async function ensureFirstAdmin(email: string, password: string) {
  const adminEmail = normalEmail(process.env.ADMIN_EMAIL || '');
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  if (!adminEmail || adminPassword.length < 10 || email !== adminEmail || !safeEqual(password, adminPassword)) return;
  const { users } = await collections();
  if ((await users.estimatedDocumentCount()) > 0) return;
  await createUser({ name: process.env.ADMIN_NAME || 'Admin', email: adminEmail, password: adminPassword, role: 'reviewer' }).catch(() => {});
}

/** Checks an email and password. Returns the user, or null when they do not match. */
export async function authenticate(emailInput: string, password: string): Promise<User | null> {
  const email = normalEmail(emailInput);
  await ensureFirstAdmin(email, password);
  const { users } = await collections();
  const user = await users.findOne({ email });
  const ok = verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  return user && ok ? toUser(user) : null;
}

/* ---------- sessions ---------- */

export function createSessionToken(user: User): string {
  const payload = Buffer.from(JSON.stringify({ id: user.id, exp: Math.floor(Date.now() / 1000) + MAX_AGE })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string | undefined): string | null {
  if (!token || !authConfigured()) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { id?: unknown; exp?: unknown };
    if (typeof data.exp !== 'number' || data.exp < Date.now() / 1000 || typeof data.id !== 'string') return null;
    return data.id;
  } catch {
    return null;
  }
}

/** The signed-in editor for this request, or null. */
export async function getUser(): Promise<User | null> {
  const id = readToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!id) return null;
  const { users } = await collections();
  const user = await users.findOne({ _id: id });
  return user ? toUser(user) : null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: MAX_AGE,
};
