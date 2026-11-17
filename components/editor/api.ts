/** Small fetch helpers for the editor's calls to /api/admin. */

export class ApiError extends Error {}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new ApiError('The server could not be reached. Check your connection and try again.');
  }
  if (res.status === 401) {
    window.location.assign('/admin/login');
    throw new ApiError('Your session ended. Sign in again.');
  }
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new ApiError(data.error ?? 'Something went wrong.');
  return data;
}

export const postJson = <T,>(url: string, body: unknown) =>
  api<T>(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export const errorMessage = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);
