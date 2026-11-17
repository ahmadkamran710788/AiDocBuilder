'use client';

import Link from 'next/link';
import type { User } from '@/lib/auth';
import { Logo } from '../layout/Logo';
import { ThemeToggle } from '../layout/ThemeToggle';

type Props = { user: User; dirty: boolean; onSettings: () => void; onUsers: () => void };

/** Editor app bar: who is signed in, users and site settings (reviewers), and sign-out. */
export function EditorTopBar({ user, dirty, onSettings, onUsers }: Props) {
  const isReviewer = user.role === 'reviewer';
  const signOut = async () => {
    if (dirty && !window.confirm('You have unsaved changes. Sign out anyway?')) return;
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    window.location.assign('/admin/login');
  };
  return (
    <header className="topbar">
      <div className="topbar-in ed-topbar">
        <Logo tag="Editor" />
        <span className="spacer" />
        <Link className="top-link" href="/" target="_blank">
          View site ↗
        </Link>
        {isReviewer && (
          <>
            <button className="top-link as-btn" type="button" onClick={onUsers}>
              Users
            </button>
            <button className="top-link as-btn" type="button" onClick={onSettings}>
              Site settings
            </button>
          </>
        )}
        <span className="user-chip" title={`${user.email} · ${isReviewer ? 'Reviewers can approve and publish' : 'Writers can edit and submit for review'}`}>
          <b>{user.name}</b>
          <i>{isReviewer ? 'Reviewer' : 'Writer'}</i>
        </span>
        <button className="top-link as-btn" type="button" onClick={signOut}>
          Sign out
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
