import type { Activity } from '@/lib/content';

function ago(t: number): string {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(t).toLocaleDateString();
}

export function ActivityLog({ entries }: { entries: Activity[] }) {
  return (
    <>
      <h3 className="ed-sub">Activity</h3>
      <ol className="ed-log">
        {entries.slice(0, 8).map((l, i) => (
          <li key={i}>
            <b>{l.who}</b> {l.what} · {ago(l.t)}
          </li>
        ))}
      </ol>
    </>
  );
}
