'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** Opens the sidebar on small screens; closes it again after navigating. */
export function MenuButton() {
  const pathname = usePathname();
  useEffect(() => {
    document.body.classList.remove('nav-open');
  }, [pathname]);
  return (
    <>
      <button className="menu-btn" aria-label="Open menu" onClick={() => document.body.classList.toggle('nav-open')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button className="side-backdrop" aria-label="Close menu" onClick={() => document.body.classList.remove('nav-open')} />
    </>
  );
}
