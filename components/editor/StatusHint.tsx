import type { PillStatus } from '../ui/StatusPill';

/** One sentence on where the page stands and what to do next. */
export function StatusHint({ status, hasLive, isReviewer }: { status: PillStatus; hasLive: boolean; isReviewer: boolean }) {
  const live = hasLive ? ' Readers still see the last published version.' : '';
  const text: Record<PillStatus, string> = {
    unsaved: `You have unsaved changes.${live} Save a draft to keep them, or submit them for review.`,
    draft: `Draft: only editors can see this.${live} Submit it for review when it is ready.`,
    review: isReviewer
      ? `Waiting for your review.${live} Check the preview, then approve it or send it back.`
      : `Waiting for a reviewer to approve it.${live}`,
    published: 'Live: readers see this version. Change anything to start a new draft; the live page stays as it is until the draft is published.',
  };
  return <p className={`ed-hint ${status}`}>{text[status]}</p>;
}
