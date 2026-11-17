'use client';

import { useState } from 'react';

export function LoginForm() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      });
      if (res.ok) {
        window.location.assign('/admin');
        return;
      }
      setError(((await res.json()) as { error?: string }).error ?? 'Sign-in failed.');
    } catch {
      setError('The server could not be reached. Try again.');
    }
    setBusy(false);
  }
  return (
    <form onSubmit={onSubmit}>
      <h1>Sign in to the editor</h1>
      <p>Use the email and password of your editor account.</p>
      <div className="field">
        <label htmlFor="loginEmail">Email</label>
        <input id="loginEmail" className="input" name="email" type="email" autoComplete="username" required autoFocus />
      </div>
      <div className="field">
        <label htmlFor="loginPassword">Password</label>
        <input id="loginPassword" className="input" name="password" type="password" autoComplete="current-password" required />
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <button className="btn primary" type="submit" disabled={busy} style={{ justifyContent: 'center', padding: '12px 14px' }}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
