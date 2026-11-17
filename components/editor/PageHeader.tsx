'use client';

import type { PillStatus } from '../ui/StatusPill';
import { PageMeta } from './PageMeta';
import { StatusHint } from './StatusHint';
import type { EditorController } from './useEditor';
import { WorkflowActions } from './WorkflowActions';
import { WorkflowSteps } from './WorkflowSteps';

const DESCRIPTION_MAX = 240;

/** Workflow bar, then the page's title, description and location. */
export function PageHeader({ editor, isReviewer }: { editor: EditorController; isReviewer: boolean }) {
  const { cur, form, setForm, dirty } = editor;
  if (!cur) return null;
  const status: PillStatus = dirty ? 'unsaved' : cur.status;
  return (
    <div className="ed-head">
      <div className="ed-flow">
        <WorkflowSteps status={status} />
        <WorkflowActions editor={editor} isReviewer={isReviewer} />
      </div>
      <StatusHint status={status} hasLive={cur.hasLive} isReviewer={isReviewer} />
      <div className="field">
        <label htmlFor="edTitle">Page title</label>
        <input
          id="edTitle"
          className="input title"
          type="text"
          autoComplete="off"
          placeholder="For example: Create a process"
          maxLength={120}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div className="field">
        <label htmlFor="edDesc">
          Short description <span className="opt">shown in page lists and search results</span>
          <span className="count">
            {form.description.length}/{DESCRIPTION_MAX}
          </span>
        </label>
        <input
          id="edDesc"
          className="input"
          type="text"
          autoComplete="off"
          placeholder="One sentence on what this page helps the reader do"
          maxLength={DESCRIPTION_MAX}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <PageMeta editor={editor} />
    </div>
  );
}
