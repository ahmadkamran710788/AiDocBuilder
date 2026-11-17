'use client';

import type { Doc } from '@/lib/content';

type Props = { docs: Doc[]; value: string; onChange: (v: string) => void; newTitle: string; onNewTitle: (v: string) => void };

/** "Add to documentation": an existing one, or the name of a new one. */
export function TargetPicker({ docs, value, onChange, newTitle, onNewTitle }: Props) {
  return (
    <>
      <label className="fld">
        <span>Add to documentation</span>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {docs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
          <option value="__new">+ New documentation…</option>
        </select>
      </label>
      {value === '__new' && (
        <label className="fld">
          <span>Name of the new documentation</span>
          <input value={newTitle} onChange={(e) => onNewTitle(e.target.value)} placeholder="Exports & Integrations" maxLength={80} />
        </label>
      )}
    </>
  );
}
