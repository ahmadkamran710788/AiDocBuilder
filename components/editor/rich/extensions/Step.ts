import { mergeAttributes, Node } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    step: { /** Turns the current paragraph into a numbered step, or back. */ toggleStep: () => ReturnType };
  }
}

/**
 * A numbered step: one action, with a round number in front.
 * Steps number themselves; the count starts again after each heading.
 */
export const Step = Node.create({
  name: 'step',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      number: {
        default: 1,
        parseHTML: (el) => Number(el.getAttribute('data-step') || el.querySelector('.num')?.textContent || 1) || 1,
        renderHTML: (attrs) => ({ 'data-step': String(attrs.number) }),
      },
    };
  },

  parseHTML() {
    // Pages written in Markdown render a step as <p class="step"><span class="num">1</span><span class="txt">…</span></p>.
    // The rule's priority puts it ahead of the plain-paragraph rule; the node itself must not outrank
    // the paragraph, or new empty blocks would start life as steps.
    return [{ tag: 'p.step', priority: 60, contentElement: (el) => (el as HTMLElement).querySelector<HTMLElement>('.txt') ?? (el as HTMLElement) }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes, { class: 'step' }), 0];
  },

  addCommands() {
    return { toggleStep: () => ({ commands }) => commands.toggleNode(this.name, 'paragraph') };
  },

  addKeyboardShortcuts() {
    return {
      // Enter on an empty step leaves the list of steps.
      Enter: ({ editor }) => {
        const { $from, empty } = editor.state.selection;
        if (!empty || $from.parent.type !== this.type || $from.parent.content.size > 0) return false;
        return editor.commands.setNode('paragraph');
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('stepNumbers'),
        appendTransaction: (transactions, _old, state) => {
          if (!transactions.some((t) => t.docChanged)) return null;
          const tr = state.tr;
          let n = 0;
          let changed = false;
          state.doc.descendants((node, pos) => {
            if (node.type.name === 'heading') n = 0;
            if (node.type !== this.type) return true;
            n += 1;
            if (node.attrs.number !== n) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, number: n });
              changed = true;
            }
            return false;
          });
          return changed ? tr : null;
        },
      }),
    ];
  },
});
