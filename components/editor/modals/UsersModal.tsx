'use client';

import { useCallback, useEffect, useState } from 'react';
import type { User } from '@/lib/auth';
import { toast } from '../../ui/Toaster';
import { api, errorMessage, postJson } from '../api';

const EMPTY = { name: '', email: '', password: '', role: 'writer' };

/** Editor accounts: who can sign in, and as what. Reviewers only. */
export function UsersModal({ me, onClose }: { me: User; onClose: () => void }) {
  const [users, setUsers] = useState<User[] | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setUsers((await api<{ users: User[] }>('/api/admin/users')).users);
    } catch (e) {
      setError(errorMessage(e, 'The accounts could not be loaded.'));
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { user } = await postJson<{ user: User }>('/api/admin/users', form);
      setForm(EMPTY);
      await load();
      toast(`${user.name} can now sign in. Send them their password yourself.`);
    } catch (err) {
      setError(errorMessage(err, 'The account could not be created.'));
    }
    setBusy(false);
  };

  const remove = async (u: User) => {
    if (!window.confirm(`Remove ${u.name}’s account? They will be signed out and can no longer sign in.`)) return;
    try {
      await api('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id }) });
      await load();
      toast(`${u.name}’s account was removed.`);
    } catch (err) {
      setError(errorMessage(err, 'The account could not be removed.'));
    }
  };

  return (
    <>
      <h2>Users</h2>
      <p className="help">Writers create and edit pages and submit them for review. Reviewers can also publish, change site settings and manage users.</p>
      <ul className="user-list">
        {users === null && <li className="muted">Loading…</li>}
        {users?.map((u) => (
          <li key={u.id}>
            <span>
              <b>{u.name}</b> {u.id === me.id && <i>(you)</i>}
              <small>{u.email}</small>
            </span>
            <span className={`pill ${u.role === 'reviewer' ? 'published' : 'draft'}`}>{u.role}</span>
            <button className="btn sm ghost" type="button" onClick={() => remove(u)} disabled={u.id === me.id}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form className="user-add" onSubmit={add}>
        <b>Add a user</b>
        <div className="two">
          <label className="fld">
            <span>Name</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={60} />
          </label>
          <label className="fld">
            <span>Role</span>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="writer">Writer</option>
              <option value="reviewer">Reviewer</option>
            </select>
          </label>
        </div>
        <label className="fld">
          <span>Email</span>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="off" />
        </label>
        <label className="fld">
          <span>Password (at least 10 characters)</span>
          <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={10} autoComplete="off" />
        </label>
        {error && <div className="form-error">{error}</div>}
        <div className="row">
          <button className="btn" type="button" onClick={onClose}>
            Close
          </button>
          <button className="btn primary" type="submit" disabled={busy}>
            {busy ? 'Adding…' : 'Add user'}
          </button>
        </div>
      </form>
    </>
  );
}
