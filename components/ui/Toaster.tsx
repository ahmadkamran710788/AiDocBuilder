'use client';

import { useEffect, useState } from 'react';

type ToastDetail = { message: string; href?: string; linkLabel?: string };

/** Shows a short message at the bottom of the screen, from any client component. */
export function toast(message: string, href?: string, linkLabel?: string) {
  window.dispatchEvent(new CustomEvent<ToastDetail>('adb-toast', { detail: { message, href, linkLabel } }));
}

export function Toaster() {
  const [t, setT] = useState<ToastDetail | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      setT((e as CustomEvent<ToastDetail>).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setT(null), 4500);
    };
    window.addEventListener('adb-toast', on);
    return () => {
      window.removeEventListener('adb-toast', on);
      clearTimeout(timer);
    };
  }, []);
  if (!t) return null;
  return (
    <div className="toast" role="status">
      <span>{t.message}</span>
      {t.href && <a href={t.href}>{t.linkLabel ?? 'View'}</a>}
    </div>
  );
}
