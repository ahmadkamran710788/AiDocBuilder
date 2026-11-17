import mammoth from 'mammoth';
import sharp from 'sharp';
import TurndownService from 'turndown';
import { saveMedia } from './content';

export type ImportedPage = { title: string; md: string };
export type ImportReport = { pages: ImportedPage[]; images: number; notes: string[] };

/** Screenshots are stored as WebP, at most 1600 px wide. */
export async function toWebp(data: Buffer): Promise<Buffer> {
  return sharp(data, { animated: false }).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
}

function turndown(): TurndownService {
  const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced', emDelimiter: '*' });
  const cellMd = (cell: HTMLElement) =>
    new TurndownService({ emDelimiter: '*' })
      .turndown(cell.innerHTML)
      .replace(/\n+/g, ' ')
      .replace(/\|/g, '\\|')
      .trim();
  td.addRule('tables', {
    filter: 'table',
    replacement: (_content, node) => {
      const table = node as HTMLElement;
      const rows = Array.from(table.querySelectorAll('tr')).map((tr) => Array.from(tr.querySelectorAll('th,td')).map((c) => cellMd(c as HTMLElement)));
      if (!rows.length) return '';
      // A one-cell table is how the Word guides draw note boxes.
      if (rows.length === 1 && rows[0].length === 1) {
        const text = rows[0][0];
        const kind = /important|warning|mistake|caution/i.test(text) ? 'warning' : 'note';
        return `\n\n:::${kind}\n${text}\n:::\n\n`;
      }
      const n = Math.max(...rows.map((r) => r.length));
      const line = (r: string[]) => `| ${[...r, ...Array(n - r.length).fill('')].join(' | ')} |`;
      return `\n\n${[line(rows[0]), `|${Array(n).fill('---').join('|')}|`, ...rows.slice(1).map(line)].join('\n')}\n\n`;
    },
  });
  return td;
}

const cleanTitle = (t: string) =>
  t
    .replace(/\\([.\-_*#()[\]])/g, '$1')
    .replace(/\*\*|__/g, '')
    .replace(/^\d+(\.\d+)*[.)]?\s+/, '')
    .trim();

/** Splits Markdown into pages on "# " headings (or keeps one page). */
export function mdToPages(md: string, fallbackTitle: string, split: boolean): ImportedPage[] {
  md = md.replace(/\r/g, '').replace(/^---\n[\s\S]*?\n---\n/, '');
  const tidy = (s: string) =>
    s
      .replace(/^(#{2,3}) (.+)$/gm, (_m, h: string, t: string) => `${h} ${cleanTitle(t)}`)
      .replace(/^(\s*)([-*]|\d+\.) {2,}/gm, '$1$2 ')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n';
  if (!split) {
    const m = md.match(/^# (.+)$/m);
    const rest = m ? md.replace(/^# .+$/m, '') : md;
    return [{ title: m ? cleanTitle(m[1]) : fallbackTitle, md: tidy(rest.replace(/^# (.+)$/gm, '## $1')) }].filter((p) => p.md.trim());
  }
  const parts = md.split(/^# (.+)$/m);
  const pages: ImportedPage[] = [];
  if (parts[0].trim()) pages.push({ title: fallbackTitle, md: tidy(parts[0]) });
  for (let i = 1; i < parts.length; i += 2) pages.push({ title: cleanTitle(parts[i]), md: tidy(parts[i + 1] ?? '') });
  return pages.filter((p) => p.md.trim());
}

/** Word (.docx) -> Markdown pages. Screenshots are saved into the documentation's media folder. */
export async function docxToPages(buffer: Buffer, docId: string, fileName: string, split: boolean): Promise<ImportReport> {
  const notes: string[] = [];
  const stamp = Date.now().toString(36);
  let images = 0;
  const result = await mammoth.convertToHtml(
    { buffer },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        try {
          const webp = await toWebp(await image.read());
          images++;
          return { src: await saveMedia(docId, `import-${stamp}-${images}.webp`, webp), alt: 'Screenshot' };
        } catch {
          notes.push(`One image (${image.contentType}) could not be converted and was skipped.`);
          return { src: '' };
        }
      }),
    },
  );
  for (const m of result.messages) if (m.type === 'warning' && notes.length < 8) notes.push(m.message);

  const html = result.value
    .replace(/<a id="[^"]*"><\/a>/g, '') // Word bookmarks
    .replace(/<p>(\s*<a href="#_Toc[^"]*">[\s\S]*?<\/a>\s*)+<\/p>/g, '') // Word table of contents
    .replace(/<img src=""[^>]*>/g, '')
    .replace(/<h([1-6])>\s*<\/h\1>/g, '') // empty headings
    // put each screenshot in its own paragraph so it becomes a figure
    .replace(/<p>((?:(?!<\/p>)[\s\S])*?)(<img [^>]*>)/g, (_m, before: string, img: string) => (before.trim() ? `<p>${before}</p><p>${img}` : `<p>${img}`));

  const md = turndown().turndown(html);
  const fallback = fileName.replace(/\.docx$/i, '').replace(/[_-]+/g, ' ').trim() || 'Imported page';
  const pages = mdToPages(md, split ? 'Introduction' : fallback, split);
  if (/\|.*\|/.test(md)) notes.push('Tables were converted. Check wide or merged-cell tables by eye.');
  return { pages, images, notes };
}
