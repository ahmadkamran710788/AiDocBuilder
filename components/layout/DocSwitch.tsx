'use client';

import { useRouter } from 'next/navigation';
import type { Doc } from '@/lib/content';

/** Dropdown at the top of the sidebar for jumping to another documentation. */
export function DocSwitch({ docs, current }: { docs: Doc[]; current?: string }) {
  const router = useRouter();
  return (
    <div className="doc-switch">
      <label htmlFor="docSel">Documentation</label>
      <select id="docSel" value={current ?? ''} onChange={(e) => router.push(e.target.value ? `/${e.target.value}` : '/')}>
        <option value="">All documentation</option>
        {docs.map((d) => (
          <option key={d.id} value={d.id}>
            {d.title}
          </option>
        ))}
      </select>
    </div>
  );
}
