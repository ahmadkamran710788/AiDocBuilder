import type { Status } from '@/lib/content';

export type PillStatus = Status | 'unsaved';

export const STATUS_LABEL: Record<PillStatus, string> = { published: 'Live', draft: 'Draft', review: 'In review', unsaved: 'Unsaved' };

export function StatusPill({ status, style }: { status: PillStatus; style?: React.CSSProperties }) {
  return (
    <span className={`pill ${status}`} style={style}>
      {STATUS_LABEL[status]}
    </span>
  );
}
