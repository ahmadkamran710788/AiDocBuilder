import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { FigureView } from '../FigureView';

export type FigureAlign = 'left' | 'center' | 'right';
export type FigureAttrs = { src: string; alt: string; width: number | null; align: FigureAlign; uploadId: string | null };

const emptyCaption = () => document.createElement('figcaption');

function readFigure(el: HTMLElement): Partial<FigureAttrs> | false {
  const img = el.tagName === 'IMG' ? (el as HTMLImageElement) : el.querySelector('img');
  const src = img?.getAttribute('src');
  if (!img || !src) return false;
  const width = parseFloat(el.style.width);
  return {
    src,
    alt: img.getAttribute('alt') ?? '',
    width: el.tagName === 'FIGURE' && width > 0 && el.style.width.endsWith('%') ? Math.min(100, Math.round(width)) : null,
    align: el.classList.contains('align-center') ? 'center' : el.classList.contains('align-right') ? 'right' : 'left',
  };
}

/**
 * A picture with an optional caption. Its width (percent of the page) and its
 * position (left, centre, right) are set in the editor: see FigureView.
 */
export const Figure = Node.create({
  name: 'figure',
  group: 'block',
  content: 'inline*',
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      src: { default: '' },
      alt: { default: '' },
      width: { default: null },
      align: { default: 'left' },
      // Set while the picture is still uploading; never saved.
      uploadId: { default: null, rendered: false },
    };
  },

  parseHTML() {
    return [
      { tag: 'figure', getAttrs: (el) => readFigure(el as HTMLElement), contentElement: (el) => (el as HTMLElement).querySelector<HTMLElement>('figcaption') ?? emptyCaption() },
      { tag: 'img:not(.icon)', getAttrs: (el) => readFigure(el as HTMLElement), contentElement: emptyCaption },
    ];
  },

  renderHTML({ node }) {
    const { src, alt, width, align } = node.attrs as FigureAttrs;
    const attrs: Record<string, string> = { class: `align-${align}` };
    if (width) attrs.style = `width: ${width}%`;
    return ['figure', attrs, ['img', { src, alt }], ['figcaption', 0]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FigureView);
  },
});
