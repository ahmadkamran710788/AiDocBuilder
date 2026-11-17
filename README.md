# AIDocBuilder Docs Portal (Next.js)

The documentation portal for AIDocBuilder: a reading site with several separate documentations, shareable links for every guide, page and section, and an editor panel with a Draft → In review → Live workflow.

It is the real build of the clickable prototype, written in Next.js (App Router) instead of the Docusaurus + Decap CMS stack named in the original spec.

## Run it

Requires Node 20 or newer, a MongoDB database and a Cloudinary account.

```bash
npm install
cp .env.example .env.local   # add MONGODB_URI and the Cloudinary keys
npm run seed                 # first time only: loads the starter guides
npm run dev                  # http://localhost:3000, editor at /admin
```

Production: `npm run build`, then `npm start`.

| Variable | What it does |
|---|---|
| `MONGODB_URI` | Database for documentations, pages, drafts, activity, feedback and settings. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image storage for screenshots. |
| `SITE_URL` | Public address, used in the sitemap and link previews. |
| `SESSION_SECRET` | Signs the session cookie. Generate with `openssl rand -hex 32`. Without it nobody can sign in. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | The first account, created as a reviewer on its first sign-in while there are no users. |

**Sign-in.** `/admin` always asks for an email and password. Accounts live in the `users` collection with a scrypt password hash. Writers create, edit and submit pages; reviewers can also publish, change site settings and add or remove users (**Users** in the editor's top bar).

## What is in it

**Reading site**

- `/` lists the documentations as cards.
- `/<doc-id>` is one documentation with only its own sidebar, a "Share this guide" box and a PDF link.
- `/<doc-id>/<page>` is a page, and `/<doc-id>/<page>#<heading>` jumps to a section.
- `/share` is the support link picker: copy the link of any guide, page or section.
- `/<doc-id>/print` puts a whole documentation on one page for "Save as PDF".
- Search across all documentations with a filter per documentation (press `/`).
- Copy-link buttons on pages and headings, click-to-zoom screenshots, previous/next, "On this page", light and dark mode, mobile layout, "Was this page helpful?", last-updated line, 404 page with search, sitemap and robots.txt.

**Editor panel (`/admin`)**

- Page list with status pills, counts per status, a documentation filter and an activity log.
- A workflow bar on every page: the three steps (Draft, In review, Live), one sentence on what to do next, and only the buttons that apply.
- A visual editor: the page looks the way readers will see it while you write. No Markdown or tags. Toolbar: headings, bold, italic, link, numbered steps (they number themselves), lists, note and warning boxes, tables. Ctrl/⌘ S saves.
- **Pictures**: paste a screenshot, drop a picture, or use **＋ Picture**. It shows at once in the page while it uploads to Cloudinary (WebP, max 1600 px wide). Click a picture to set its position (left, centre, right) and size, drag its corner to resize, move it up or down, or remove it. Captions are typed under the picture.
- **Tables** are edited as tables: add or delete rows and columns, toggle the header row.
- **Import…**: upload a Word file (`.docx`) or a Markdown file (`.md`), or paste Markdown. Each main heading can become its own page; Word screenshots are uploaded to Cloudinary.
- **New documentation**: gets its own sidebar and link. Reviewers can delete a documentation (with all its pages) by choosing it in the Documentation filter.
- Move a page up or down in its documentation's menu.
- **Site settings** (reviewers): product version and home page texts.
- Save draft → Submit for review → Approve and publish. Only reviewers can publish, request changes or unpublish. Editing a live page never changes what readers see until the new version is published.

## Where data lives

Nothing is stored on the server's disk, so the app can run on any Node host, including serverless ones.

**MongoDB** (collections in the database named in `MONGODB_URI`)

| Collection | Holds |
|---|---|
| `documentations` | One document per documentation: id, title, description, order. |
| `pages` | One document per page, with two copies inside: `live` (what readers see) and `draft` (the editors' working copy, status `draft` or `review`). |
| `media` | A record of each image uploaded to Cloudinary (URL, size). |
| `activity` | The editor activity log. |
| `feedback` | "Was this page helpful?" votes. |
| `settings` | Product version and home page texts, edited under **Site settings**. |
| `users` | Editor accounts: name, email, role, password hash. |

**Cloudinary** holds the image files, under `aidocbuilder-docs/<doc-id>/`. Pages reference them by their `https://res.cloudinary.com/...` URL.

Publishing copies a page's `draft` over its `live` copy, so editing a live page never changes the public site until a reviewer approves it. A documentation appears publicly once it has at least one live page.

`seed/` holds the starter guides as Markdown and WebP files. `npm run seed` loads them once; running it again adds only what is missing.

## Page format

Pages saved from the visual editor are stored as HTML (`format: "html"`) and sanitised every time they are shown. Imported pages and the starter content are Markdown until they are first saved in the editor. In Markdown: `**1.** text` is a numbered step, an italic line under an image is its caption, and `:::note`, `:::tip`, `:::warning`, `:::danger` are callout boxes. A page's address comes from its first title and does not change when the title is edited.

## Code map

```
app/                      routes only: each page fetches data and composes components
  page.tsx                portal home
  [doc]/page.tsx          one documentation
  [doc]/[page]/page.tsx   one page
  [doc]/print/page.tsx    printable guide
  share/page.tsx          support link picker
  admin/                  editor panel and sign-in
  api/                    search, feedback, and the editor's API (api/admin/*)
components/
  layout/                 Shell, TopBar, Sidebar, Footer, Logo, DocSwitch, MenuButton, ThemeToggle
  docs/                   DocCard, ShareBox, PageList, Article, Toc, Pager, Breadcrumb, Feedback, ...
  search/                 SearchBox, Highlight
  ui/                     CopyButton, Modal, StatusPill, Toaster
  editor/                 Editor, EditorTopBar, PagesPanel, PageEditor, PageHeader,
                          WorkflowSteps, WorkflowActions, StatusHint, PageMeta, ActivityLog,
                          useEditor (state and actions)
  editor/rich/            RichEditor, RichToolbar, FigureView (picture controls),
                          extensions/ (Step, Callout, Figure, Icon)
  editor/modals/          ImportModal, NewDocModal, SettingsModal, UsersModal
  auth/                   LoginForm
lib/
  db.ts                   MongoDB connection and collection types
  cloudinary.ts           image upload
  content.ts              all reads and writes: documentations, pages, drafts, publish, settings
  render.ts               Markdown to sanitised HTML (steps, captions, callouts)
  importDocx.ts           Word and Markdown import
  auth.ts                 accounts, password hashing, sessions
  search.ts               search
scripts/seed.mjs          loads seed/ into MongoDB and Cloudinary
```

## Not built yet

- Real PDF files at `/downloads/<doc-id>.pdf`. The print page covers this through the browser's "Save as PDF".
- Company SSO, password reset by email, and changing your own password. A reviewer replaces an account to change its password.
- Redirects for pages that move, a branded Open Graph image, and analytics.
- Moving a page to another documentation, and renaming a documentation, from the editor.
