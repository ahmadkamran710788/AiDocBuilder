'use client';

import { NodeSelection } from '@tiptap/pm/state';
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';
import { useRef } from 'react';
import type { FigureAlign, FigureAttrs } from './extensions/Figure';

const SIZES: { label: string; width: number | null }[] = [
  { label: 'Small', width: 35 },
  { label: 'Medium', width: 60 },
  { label: 'Large', width: 85 },
  { label: 'Full', width: 100 },
  { label: 'Original', width: null },
];
const ALIGNS: { label: string; align: FigureAlign }[] = [
  { label: 'Left', align: 'left' },
  { label: 'Centre', align: 'center' },
  { label: 'Right', align: 'right' },
];

/** A picture in the editor: click it for size and position controls, drag its corner to resize. */
export function FigureView({ node, editor, getPos, updateAttributes, deleteNode, selected }: ReactNodeViewProps) {
  const { src, alt, width, align, uploadId } = node.attrs as FigureAttrs;
  const box = useRef<HTMLDivElement>(null);

  const select = () => {
    const pos = getPos();
    if (typeof pos === 'number') editor.commands.setNodeSelection(pos);
  };

  /** Drag the corner handle: the width follows the pointer, as a percentage of the page width. */
  const startResize = (e: React.PointerEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const figure = box.current?.closest('figure');
    const container = figure?.parentElement;
    if (!figure || !container) return;
    const startX = e.clientX;
    const startWidth = figure.getBoundingClientRect().width;
    const full = container.getBoundingClientRect().width;
    // A centred picture grows on both sides, a right-aligned one grows to the left.
    const factor = align === 'center' ? 2 : align === 'right' ? -1 : 1;
    const onMove = (ev: PointerEvent) => {
      const px = startWidth + (ev.clientX - startX) * factor;
      updateAttributes({ width: Math.max(10, Math.min(100, Math.round((px / full) * 100))) });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      select(); // keep the controls open after resizing
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  /** Moves the picture above the block before it, or below the block after it. */
  const move = (direction: -1 | 1) => {
    const pos = getPos();
    if (typeof pos !== 'number') return;
    const { state, view } = editor;
    const $pos = state.doc.resolve(pos);
    const index = $pos.index();
    const sibling = direction < 0 ? (index > 0 ? $pos.parent.child(index - 1) : null) : index < $pos.parent.childCount - 1 ? $pos.parent.child(index + 1) : null;
    if (!sibling) return;
    const target = direction < 0 ? pos - sibling.nodeSize : pos + sibling.nodeSize;
    const tr = state.tr.delete(pos, pos + node.nodeSize).insert(target, node);
    view.dispatch(tr.setSelection(NodeSelection.create(tr.doc, target)).scrollIntoView());
  };

  return (
    <NodeViewWrapper as="figure" className={`align-${align}${selected ? ' selected' : ''}`} style={width ? { width: `${width}%` } : undefined}>
      <div className="fig-img" ref={box} contentEditable={false} onClick={select} data-drag-handle>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} draggable={false} />
        {uploadId && <span className="fig-uploading">Uploading…</span>}
        {selected && !uploadId && (
          <>
            <div className="fig-bar" onMouseDown={(e) => e.preventDefault()}>
              <span className="grp" role="group" aria-label="Position">
                {ALIGNS.map((a) => (
                  <button key={a.align} type="button" className={align === a.align ? 'on' : ''} onClick={() => updateAttributes({ align: a.align })}>
                    {a.label}
                  </button>
                ))}
              </span>
              <span className="grp" role="group" aria-label="Size">
                {SIZES.map((s) => (
                  <button key={s.label} type="button" className={width === s.width ? 'on' : ''} onClick={() => updateAttributes({ width: s.width })}>
                    {s.label}
                  </button>
                ))}
              </span>
              <span className="grp" role="group" aria-label="Move">
                <button type="button" title="Move up" aria-label="Move picture up" onClick={() => move(-1)}>
                  ↑
                </button>
                <button type="button" title="Move down" aria-label="Move picture down" onClick={() => move(1)}>
                  ↓
                </button>
              </span>
              <span className="grp">
                <button type="button" className="danger" onClick={deleteNode}>
                  Remove
                </button>
              </span>
            </div>
            <span className={`fig-handle ${align === 'right' ? 'at-left' : ''}`} onPointerDown={startResize} title="Drag to resize" />
            {width && <span className="fig-size">{width}%</span>}
          </>
        )}
      </div>
      <NodeViewContent<'figcaption'> as="figcaption" data-placeholder="Add a caption (optional)" />
    </NodeViewWrapper>
  );
}
