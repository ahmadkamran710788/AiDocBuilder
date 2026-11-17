'use client';

import { useCallback, useState } from 'react';
import { copyLink } from '../ui/CopyButton';
import { Lightbox } from './Lightbox';

/** Rendered page body: "#" section links copy their URL, screenshots zoom on click. */
export function Article({ html }: { html: string }) {
  const [zoom, setZoom] = useState<string | null>(null);
  const onClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const link = target.closest<HTMLAnchorElement>('a[data-copy-hash]');
    if (link) {
      e.preventDefault();
      const hash = `#${link.dataset.copyHash}`;
      history.replaceState(null, '', hash);
      void copyLink(window.location.pathname + hash, 'this section');
      return;
    }
    const img = target.closest<HTMLImageElement>('figure img');
    if (img) setZoom(img.currentSrc || img.src);
  }, []);
  return (
    <>
      <div onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
      {zoom && <Lightbox src={zoom} onClose={() => setZoom(null)} />}
    </>
  );
}
