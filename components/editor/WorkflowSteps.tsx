import type { PillStatus } from '../ui/StatusPill';

const STEPS = ['Draft', 'In review', 'Live'];
const INDEX: Record<PillStatus, number> = { unsaved: 0, draft: 0, review: 1, published: 2 };

/** Draft → In review → Live, with the current step highlighted. */
export function WorkflowSteps({ status }: { status: PillStatus }) {
  const at = INDEX[status];
  return (
    <ol className="steps" aria-label="Publishing steps">
      {STEPS.map((name, i) => (
        <li key={name} className={i < at ? 'done' : i === at ? 'cur' : ''} aria-current={i === at ? 'step' : undefined}>
          <span className="dot">{i < at ? '✓' : i + 1}</span>
          {name}
        </li>
      ))}
    </ol>
  );
}
