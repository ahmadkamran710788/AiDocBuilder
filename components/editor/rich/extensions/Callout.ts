import { Node } from '@tiptap/core';

export type CalloutKind = 'note' | 'warn';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: { /** Puts the selection in a note or warning box; again on the same kind removes the box. */ toggleCallout: (kind: CalloutKind) => ReturnType };
  }
}

/** A note or warning box. */
export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      kind: {
        default: 'note' as CalloutKind,
        parseHTML: (el) => (el.classList.contains('warn') ? 'warn' : 'note'),
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div.callout' }];
  },

  renderHTML({ node }) {
    return ['div', { class: `callout ${node.attrs.kind}` }, 0];
  },

  addCommands() {
    return {
      toggleCallout:
        (kind) =>
        ({ editor, commands }) => {
          if (!editor.isActive(this.name)) return commands.wrapIn(this.name, { kind });
          if (editor.isActive(this.name, { kind })) return commands.lift(this.name);
          return commands.updateAttributes(this.name, { kind });
        },
    };
  },
});
