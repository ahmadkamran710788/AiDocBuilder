export function LastUpdated({ updated, by }: { updated: string | null; by: string | null }) {
  const date = updated ? new Date(updated) : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return (
    <p className="updated">
      Last updated on{' '}
      <time dateTime={date.toISOString()}>{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time>
      {by ? ` by ${by}` : ''}
    </p>
  );
}
