type Props = { onClose: () => void; onConfirm: () => void; confirmLabel: string; busyLabel: string; busy: boolean; disabled?: boolean };

/** Cancel + confirm buttons at the bottom of a modal. */
export function ModalActions({ onClose, onConfirm, confirmLabel, busyLabel, busy, disabled }: Props) {
  return (
    <div className="row">
      <button className="btn" type="button" onClick={onClose} disabled={busy}>
        Cancel
      </button>
      <button className="btn primary" type="button" onClick={onConfirm} disabled={disabled || busy}>
        {busy ? busyLabel : confirmLabel}
      </button>
    </div>
  );
}
