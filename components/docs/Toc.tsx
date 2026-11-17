'use client';

import { useEffect, useState } from 'react';
import type { Heading } from '@/lib/render';

/** "On this page": section links, with the section being read highlighted. */
export function Toc({ headings }: { headings: Heading[] }) {
  const [on, setOn] = useState(headings[0]?.id);
  useEffect(() => {
    const spy = () => {
      let cur = headings[0]?.id;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top < 140) cur = h.id;
      }
      setOn(cur);
    };
    spy();
    window.addEventListener('scroll', spy, { passive: true });
    return () => window.removeEventListener('scroll', spy);
  }, [headings]);
  if (!headings.length) return null;
  return (
    <>
      <h4>On this page</h4>
      {headings.map((h) => (
        <a key={h.id} href={`#${h.id}`} className={h.id === on ? 'on' : ''}>
          {h.text}
        </a>
      ))}
    </>
  );
}
