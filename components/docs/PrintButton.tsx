'use client';

export function PrintButton() {
  return (
    <button className="btn primary sm" type="button" onClick={() => window.print()}>
      Save as PDF / Print
    </button>
  );
}
