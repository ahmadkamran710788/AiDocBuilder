/** Tidies stored page HTML so every picture becomes its own block in the editor. */
export function prepareHtml(html: string): string {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  // A figure holding several pictures becomes one figure per picture; the caption stays with the last.
  for (const figure of Array.from(doc.querySelectorAll('figure'))) {
    const imgs = Array.from(figure.querySelectorAll('img'));
    for (const img of imgs.slice(0, -1)) {
      const single = doc.createElement('figure');
      single.className = figure.className;
      single.append(img);
      figure.before(single);
    }
  }
  return doc.body.innerHTML;
}
