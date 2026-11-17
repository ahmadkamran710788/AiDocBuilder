import Link from 'next/link';
import type { Doc, SiteSettings } from '@/lib/content';
import { SearchBox } from '../search/SearchBox';
import { Logo } from './Logo';
import { MenuButton } from './MenuButton';
import { ThemeToggle } from './ThemeToggle';

export function TopBar({ docs, doc, settings }: { docs: Doc[]; doc?: string; settings: SiteSettings }) {
  return (
    <header className="topbar">
      <div className="topbar-in">
        <MenuButton />
        <Logo />
        <SearchBox docs={docs} currentDoc={doc} />
        <Link className="top-link back-link" href="/share">
          Share links
        </Link>
        {settings.siteLinkUrl && (
          <a className="top-link back-link" href={settings.siteLinkUrl} target="_blank" rel="noopener noreferrer">
            {settings.siteLinkLabel} ↗
          </a>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
