'use client';

import { toast } from './Toaster';

/** Copies the full URL of a site path (with optional #section) to the clipboard. */
export async function copyLink(path: string, label?: string) {
  const url = new URL(path, window.location.href).toString();
  try {
    await navigator.clipboard.writeText(url);
    toast(`Link copied${label ? ` to ${label}` : ''}.`);
  } catch {
    window.prompt('Your browser blocked automatic copying. Copy this link:', url);
  }
}

type Props = { path: string; label?: string; className?: string; children: React.ReactNode };

export function CopyButton({ path, label, className = 'btn sm', children }: Props) {
  return (
    <button type="button" className={className} onClick={() => copyLink(path, label)}>
      {children}
    </button>
  );
}
