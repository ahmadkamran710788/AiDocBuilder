import { Node } from '@tiptap/core';

/** A small picture inside a line of text, such as a button icon. */
export const Icon = Node.create({
  name: 'icon',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return { src: { default: '' }, alt: { default: '' } };
  },

  parseHTML() {
    return [{ tag: 'img.icon', priority: 60 }];
  },

  renderHTML({ node }) {
    return ['img', { class: 'icon', src: node.attrs.src, alt: node.attrs.alt }];
  },
});
