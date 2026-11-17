'use client';

import { useState } from 'react';

export function Feedback({ doc, slug }: { doc: string; slug: string }) {
  const [sent, setSent] = useState(false);
  const vote = (helpful: boolean) => {
    setSent(true);
    void fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ doc, slug, helpful }) }).catch(() => {});
  };
  return (
    <div className="feedback">
      {sent ? (
        <span>Thanks for the feedback.</span>
      ) : (
        <>
          <span>Was this page helpful?</span>
          <button className="btn sm" type="button" onClick={() => vote(true)}>
            Yes
          </button>
          <button className="btn sm" type="button" onClick={() => vote(false)}>
            No
          </button>
        </>
      )}
    </div>
  );
}
