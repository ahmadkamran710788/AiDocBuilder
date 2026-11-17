import type { Activity, AdminPage, Doc, SiteSettings, Status } from '@/lib/content';

/** `body` is HTML: the visual editor's content. */
export type PageForm = { title: string; description: string; body: string };
export type LoadedPage = PageForm & { doc: string; slug: string; status: Status; hasLive: boolean };
export type EditorState = { docs: Doc[]; pages: AdminPage[]; activity: Activity[]; settings: SiteSettings };
export type StatusFilter = 'all' | Status;
export type ModalKind = 'import' | 'doc' | 'settings' | 'users' | null;
export type ImportResult = { doc: string; pages: { slug: string }[]; images: number; notes: string[] };
/** Called after an import or a new documentation: show that documentation and open the page. */
export type OnCreated = (doc: string, slug: string) => Promise<void>;
