import { NextResponse } from 'next/server';
import { AuthError, getUser, type Role, type User } from './auth';
import { ContentError } from './content';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Signed-in editor for an /api/admin route. Also rejects cross-site writes. */
export async function requireUser(req: Request, role?: Role): Promise<User> {
  if (req.method !== 'GET') {
    const origin = req.headers.get('origin');
    const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
    if (origin && host && new URL(origin).host !== host) throw new HttpError(403, 'Cross-site request blocked.');
  }
  const user = await getUser();
  if (!user) throw new HttpError(401, 'Sign in to use the editor.');
  if (role === 'reviewer' && user.role !== 'reviewer') throw new HttpError(403, 'Only a reviewer can do this.');
  return user;
}

export function handle<A extends unknown[]>(fn: (req: Request, ...rest: A) => Promise<Response>) {
  return async (req: Request, ...rest: A): Promise<Response> => {
    try {
      return await fn(req, ...rest);
    } catch (e) {
      if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 400 });
      if (e instanceof HttpError || e instanceof ContentError) return NextResponse.json({ error: e.message }, { status: e.status });
      console.error(e);
      return NextResponse.json({ error: 'Something went wrong on the server.' }, { status: 500 });
    }
  };
}

export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new HttpError(400, 'Invalid request body.');
  }
}
