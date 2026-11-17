'use client';

import { useState } from 'react';
import type { SiteSettings } from '@/lib/content';
import { toast } from '../../ui/Toaster';
import { errorMessage, postJson } from '../api';
import { ModalActions } from './ModalActions';

type Props = { settings: SiteSettings; onClose: () => void; onSaved: () => Promise<unknown> };

/** Texts shown on the public site that are not part of any page. Reviewers only. */
export function SettingsModal({ settings, onClose, onSaved }: Props) {
  const [form, setForm] = useState(settings);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try {
      await postJson('/api/admin/settings', form);
      await onSaved();
      onClose();
      toast('Site settings saved. The public site shows them now.');
    } catch (e) {
      setError(errorMessage(e, 'The settings could not be saved.'));
      setBusy(false);
    }
  };
  return (
    <>
      <h2>Site settings</h2>
      <p className="help">These appear on the public site: the top bar, the home page, the sidebar and the footer.</p>
      <label className="fld">
        <span>Product version</span>
        <input value={form.productVersion} onChange={(e) => setForm({ ...form, productVersion: e.target.value })} maxLength={80} />
      </label>
      <label className="fld">
        <span>Home page title</span>
        <input value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} maxLength={120} />
      </label>
      <label className="fld">
        <span>Home page introduction</span>
        <textarea style={{ minHeight: 110, fontFamily: 'var(--font-body)', fontSize: 14 }} value={form.heroLead} onChange={(e) => setForm({ ...form, heroLead: e.target.value })} maxLength={400} />
      </label>
      <div className="two-fields">
        <label className="fld">
          <span>Top bar link: text</span>
          <input value={form.siteLinkLabel} onChange={(e) => setForm({ ...form, siteLinkLabel: e.target.value })} placeholder="aidocbuilder.com" maxLength={40} />
        </label>
        <label className="fld">
          <span>Top bar link: address (empty hides it)</span>
          <input type="url" value={form.siteLinkUrl} onChange={(e) => setForm({ ...form, siteLinkUrl: e.target.value })} placeholder="https://aidocbuilder.com" maxLength={300} />
        </label>
      </div>
      {error && <div className="form-error">{error}</div>}
      <ModalActions onClose={onClose} onConfirm={go} confirmLabel="Save" busyLabel="Saving…" busy={busy} />
    </>
  );
}
