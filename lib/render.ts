import { marked, type Token, type Tokens } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { slugify } from './content';

/*
 * Markdown -> docs HTML, with the AIDocBuilder conventions on top of GFM:
 *   :::note / :::tip / :::warning / :::danger ... :::   callout boxes
 *   **1.** text                                         numbered step
 *   image paragraph, then an *italic* paragraph         figure with caption
 * Output is sanitised, so pasted Markdown or Word imports cannot inject scripts.
 */

export type Heading = { id: string; text: string; depth: 2 | 3 };
export type Rendered = { html: string; headings: Heading[]; text: string };

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const inline = (s: string) => marked.parseInline(s, { async: false, gfm: true }) as string;
const plain = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

type Ctx = { headings: Heading[]; used: Map<string, number> };

function headingId(text: string, ctx: Ctx): string {
  const base = slugify(text);
  const n = ctx.used.get(base) ?? 0;
  ctx.used.set(base, n + 1);
  return n ? `${base}-${n + 1}` : base;
}

function isImageOnly(t: Tokens.Paragraph): boolean {
  const kids = t.tokens ?? [];
  return kids.some((k) => k.type === 'image') && kids.every((k) => k.type === 'image' || ((k.type === 'text' || k.type === 'br') && !k.raw.trim()));
}
function isItalicOnly(t: Tokens.Paragraph): boolean {
  const kids = (t.tokens ?? []).filter((k) => k.raw.trim());
  return kids.length === 1 && kids[0].type === 'em';
}

function renderBlocks(md: string, ctx: Ctx): string {
  const out: string[] = [];
  const tokens = marked.lexer(md, { gfm: true });
  for (const tok of tokens as Token[]) {
    if (tok.type === 'space') continue;
    if (tok.type === 'heading') {
      const h = tok as Tokens.Heading;
      const body = inline(h.text);
      if (h.depth <= 3) {
        const depth = h.depth === 3 ? 3 : 2; // a "# " inside a page is shown as a section
        const text = plain(body);
        const id = headingId(text, ctx);
        ctx.headings.push({ id, text, depth });
        out.push(
          `<h${depth} id="${id}">${body}<a class="h-link" href="#${id}" data-copy-hash="${id}" aria-label="Copy link to section ${esc(text)}" title="Copy link to this section">#</a></h${depth}>`,
        );
      } else out.push(`<h4>${body}</h4>`);
      continue;
    }
    if (tok.type === 'paragraph') {
      const p = tok as Tokens.Paragraph;
      if (isImageOnly(p)) {
        const imgs = (p.tokens ?? [])
          .filter((k): k is Tokens.Image => k.type === 'image')
          .map((k) => `<img src="${esc(k.href)}" alt="${esc(k.text || 'Screenshot')}" loading="lazy">`)
          .join('');
        out.push(`<figure>${imgs}</figure>`);
        continue;
      }
      const last = out[out.length - 1];
      if (isItalicOnly(p) && last?.endsWith('</figure>') && !last.includes('<figcaption>')) {
        const em = (p.tokens ?? []).find((k) => k.type === 'em') as Tokens.Em;
        out[out.length - 1] = last.slice(0, -'</figure>'.length) + `<figcaption>${inline(em.text)}</figcaption></figure>`;
        continue;
      }
      const step = p.text.match(/^\*\*(\d+)\.\*\*\s*([\s\S]*)$/);
      if (step) {
        out.push(`<p class="step"><span class="num">${step[1]}</span><span class="txt">${inline(step[2])}</span></p>`);
        continue;
      }
      out.push(marked.parser([tok]));
      continue;
    }
    if (tok.type === 'table') {
      out.push(`<div class="table-wrap">${marked.parser([tok])}</div>`);
      continue;
    }
    if (tok.type === 'html') {
      const raw = (tok as Tokens.HTML).text.trim();
      if (/^<table[\s>]/i.test(raw)) out.push(`<div class="table-wrap">${raw}</div>`);
      else if (/^<img\b[^>]*>$/i.test(raw) && !/class="icon"/.test(raw)) out.push(`<figure>${raw}</figure>`);
      else out.push(raw);
      continue;
    }
    out.push(marked.parser([tok]));
  }
  return out.join('\n');
}

const CALLOUT_OPEN = /^:::(note|tip|warning|danger)\s*$/;

function renderWithCallouts(md: string, ctx: Ctx): string {
  const lines = md.replace(/\r/g, '').split('\n');
  let html = '';
  let buf: string[] = [];
  let fence: string | null = null;
  const flush = () => {
    if (buf.join('').trim()) html += renderBlocks(buf.join('\n'), ctx) + '\n';
    buf = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const f = line.match(/^\s*(```+|~~~+)/);
    if (f) fence = fence ? (line.trim().startsWith(fence) ? null : fence) : f[1];
    const open = !fence && line.match(CALLOUT_OPEN);
    if (!open) {
      buf.push(line);
      continue;
    }
    flush();
    const inner: string[] = [];
    i++;
    while (i < lines.length && lines[i].trim() !== ':::') inner.push(lines[i++]);
    const kind = open[1] === 'warning' || open[1] === 'danger' ? 'warn' : 'note';
    html += `<div class="callout ${kind}">${renderBlocks(inner.join('\n'), ctx)}</div>\n`;
  }
  flush();
  return html;
}

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'code', 'pre', 'blockquote',
    'hr', 'br', 'div', 'span', 'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'sup', 'sub', 'kbd', 'input',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'class', 'data-copy-hash', 'aria-label', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'loading', 'class'],
    figure: ['class', 'style'],
    h2: ['id'],
    h3: ['id'],
    div: ['class'],
    p: ['class', 'data-step'],
    span: ['class'],
    code: ['class'],
    th: ['colspan', 'rowspan', 'align'],
    td: ['colspan', 'rowspan', 'align'],
    ol: ['start'],
    input: ['type', 'checked', 'disabled'],
  },
  allowedClasses: {
    a: ['h-link'],
    img: ['icon'],
    figure: ['align-left', 'align-center', 'align-right'],
    div: ['callout', 'note', 'warn', 'table-wrap'],
    p: ['step'],
    span: ['num', 'txt'],
    code: [/^language-[\w-]+$/],
  },
  // A picture's size, set by dragging it in the editor.
  allowedStyles: { figure: { width: [/^\d{1,3}(\.\d+)?%$/] } },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  exclusiveFilter: (frame) => (frame.tag === 'input' && frame.attribs.type !== 'checkbox') || (frame.tag === 'img' && !frame.attribs.src),
  transformTags: {
    h1: 'h2',
    a: (tagName, attribs) => {
      if (/^https?:\/\//i.test(attribs.href ?? '')) return { tagName, attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' } };
      const { target: _t, rel: _r, ...rest } = attribs;
      return { tagName, attribs: rest };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy' } }),
    input: (tagName, attribs) => ({ tagName, attribs: { ...attribs, disabled: 'disabled' } }),
  },
};

const H_LINK = /<a class="h-link"[^>]*>#<\/a>/g;

export function renderMarkdown(md: string): Rendered {
  const ctx: Ctx = { headings: [], used: new Map() };
  const html = sanitizeHtml(renderWithCallouts(md, ctx), sanitizeOptions);
  const text = plain(html.replace(H_LINK, ''));
  return { html, headings: ctx.headings, text };
}

/**
 * A page written in the visual editor is stored as HTML. It is sanitised the
 * same way, then section headings get their link anchors and tables their
 * scroll wrapper, so it looks exactly like a Markdown page on the site.
 */
export function renderHtml(source: string): Rendered {
  const ctx: Ctx = { headings: [], used: new Map() };
  const html = sanitizeHtml(source.replace(H_LINK, ''), sanitizeOptions)
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/<figcaption>\s*<\/figcaption>/g, '')
    .replace(/<figure[^>]*>\s*<\/figure>/g, '')
    .replace(/<div class="table-wrap">\s*(<table[\s\S]*?<\/table>)\s*<\/div>/g, '$1')
    .replace(/<table/g, '<div class="table-wrap"><table')
    .replace(/<\/table>/g, '</table></div>')
    .replace(/<h([23])(?: id="[^"]*")?>([\s\S]*?)<\/h\1>/g, (_m, level: string, inner: string) => {
      const text = plain(inner);
      if (!text) return '';
      const id = headingId(text, ctx);
      ctx.headings.push({ id, text, depth: level === '3' ? 3 : 2 });
      return `<h${level} id="${id}">${inner}<a class="h-link" href="#${id}" data-copy-hash="${id}" aria-label="Copy link to section ${esc(text)}" title="Copy link to this section">#</a></h${level}>`;
    });
  return { html, headings: ctx.headings, text: plain(html.replace(H_LINK, '')) };
}

/** Renders a page body in whichever format it was saved. */
export function renderContent(page: { body: string; format?: 'md' | 'html' }): Rendered {
  return page.format === 'html' ? renderHtml(page.body) : renderMarkdown(page.body);
}

/** The same HTML without site-only extras, as the starting content of the visual editor. */
export function editorHtml(page: { body: string; format?: 'md' | 'html' }): string {
  return renderContent(page).html.replace(H_LINK, '');
}

/** First sentence of a page, for descriptions and list previews. */
export function excerpt(text: string, max = 150): string {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}
