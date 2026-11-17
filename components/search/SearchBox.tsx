'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { Doc } from '@/lib/content';
import type { SearchHit } from '@/lib/search';
import { Highlight } from './Highlight';

type Props = { docs: Doc[]; currentDoc?: string; /** Focus the box when the reader presses "/". */ slashFocus?: boolean };

export function SearchBox({ docs, currentDoc, slashFocus = true }: Props) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [scope, setScope] = useState(currentDoc ?? '');
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => setScope(currentDoc ?? ''), [currentDoc]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setHits(null);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}${scope ? `&doc=${scope}` : ''}`, { signal: ctrl.signal });
        setHits(((await res.json()) as { hits: SearchHit[] }).hits);
        setSel(-1);
      } catch {
        /* superseded by a newer search */
      }
    }, 160);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q, scope]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (slashFocus && e.key === '/' && !(el && /INPUT|TEXTAREA|SELECT/.test(el.tagName))) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [slashFocus]);

  const go = (h: SearchHit) => {
    setOpen(false);
    setQ('');
    router.push(h.href);
  };
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);

  return (
    <div className="search" ref={box}>
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        ref={input}
        type="search"
        value={q}
        placeholder="Search all documentation  ( / )"
        autoComplete="off"
        aria-label="Search the docs"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false);
            input.current?.blur();
          }
          if (!hits?.length) return;
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setSel((s) => (s + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length);
          }
          if (e.key === 'Enter') go(hits[sel] ?? hits[0]);
        }}
      />
      {open && hits && (
        <div className="results">
          <label className="search-filter">
            Search in
            <select value={scope} onChange={(e) => setScope(e.target.value)}>
              <option value="">All documentation</option>
              {docs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </label>
          {hits.length ? (
            hits.map((h, i) => (
              <a
                key={h.href + i}
                href={h.href}
                className={i === sel ? 'sel' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  go(h);
                }}
              >
                <div className="rt">
                  <Highlight text={h.title} words={words} />
                </div>
                <div className="rs">{h.snippet ? <>…<Highlight text={h.snippet} words={words} />…</> : h.context}</div>
                {h.snippet && <div className="rc">{h.context}</div>}
              </a>
            ))
          ) : (
            <div className="empty">No results for “{q}”. Try another word, such as “party” or “dictionary”.</div>
          )}
        </div>
      )}
    </div>
  );
}
