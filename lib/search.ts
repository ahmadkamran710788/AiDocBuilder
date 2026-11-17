import { listAllLivePages, listPublicDocs } from './content';
import { renderContent } from './render';

export type SearchHit = { href: string; title: string; context: string; snippet?: string; doc: string };

/** All-words search over live pages: titles first, then section headings, then body text. */
export async function search(query: string, docFilter?: string): Promise<SearchHit[]> {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8);
  if (!words.length || query.trim().length < 2) return [];
  const has = (s: string) => {
    const l = s.toLowerCase();
    return words.every((w) => l.includes(w));
  };
  const [docs, pagesByDoc] = await Promise.all([listPublicDocs(), listAllLivePages()]);
  const hits: (SearchHit & { score: number })[] = [];
  for (const d of docs) {
    if (docFilter && d.id !== docFilter) continue;
    for (const p of pagesByDoc.get(d.id) ?? []) {
      const { headings, text } = renderContent(p);
      const href = `/${d.id}/${p.slug}`;
      const context = `${d.title} › ${p.title}`;
      const titleHit = has(p.title);
      if (titleHit) hits.push({ href, title: p.title, context: d.title, doc: d.id, score: 3 });
      for (const h of headings) if (has(h.text)) hits.push({ href: `${href}#${h.id}`, title: h.text, context, doc: d.id, score: 2 });
      if (!titleHit && has(text)) {
        const at = Math.max(0, text.toLowerCase().indexOf(words[0]));
        hits.push({ href, title: p.title, context, doc: d.id, score: 1, snippet: text.slice(Math.max(0, at - 60), at + 120) });
      }
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 12).map(({ score: _s, ...h }) => h);
}
