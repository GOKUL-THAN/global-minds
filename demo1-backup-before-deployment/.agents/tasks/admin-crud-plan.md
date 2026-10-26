# Implementation Plan — Admin CRUD & Navigation Page

## Context

- **Build command:** `npm run build` (runs `tsc && vite build`)  
- **Dev command:** `npm run dev`  
- **TypeScript** strict compilation is the verification gate — `tsc` must pass with zero errors after every item.  
- **No test framework** is configured; verification is TypeScript compilation + visual inspection in dev server.  
- **Pattern to follow:** `AdminCoursesPage.tsx` — in-memory `useState` holding the array, search filter, table rows, action buttons per row.  
- **Modal pattern:** fixed inset overlay with `bg-black/50 z-50`, inner `bg-white rounded-2xl p-6 max-w-lg max-h-[90vh] overflow-y-auto`, Save + Cancel buttons at bottom.  
- **Delete confirmation:** inline row state — a `confirmDeleteId` string in `useState`; when it matches a row's id the row shows "Are you sure? Yes / Cancel".  
- **Hide/Show toggle:** each data item gets a `hidden` boolean field stored in local state; toggling flips it and the badge updates. No backend call needed.  
- **Badge variants available:** `brand | accent | green | purple | red | yellow | gray` (from `src/components/ui/Badge.tsx`).  
- **No new npm packages** are needed — all UI is Tailwind + lucide-react, already installed.

---

## Items

- [ ] 1. **Extend the `FAQ` type to add an optional `hidden` field**  
  The existing `FAQ` interface in `src/types/index.ts` has `id`, `question`, `answer`, `category?`. Add `hidden?: boolean`. This is required before AdminFAQsPage can compile with hide-toggle state.  
  Files: `d:\WEBSITE GLOBALMINDS\demo1\src\types\index.ts`  
  Verify: `npx tsc --noEmit` — zero errors.

- [ ] 2. **Rewrite `AdminMasterProgramsPage.tsx` — full CRUD + hide/show**  
  Replace the static render with interactive in-memory state. Depend on item 1 only if MasterProgram also needs a `hidden` field (it does — `CourseStatus` is `'active' | 'draft' | 'coming-soon' | 'archived'`; treat `hidden` as an overlay boolean added to local state only, do not touch the type).  

  Detailed spec:
  - `const [items, setItems] = useState(() => masterPrograms.map(mp => ({ ...mp, hidden: false })))` — seed from imported data.
  - `search` string state, filter items by `title` case-insensitively.
  - `confirmDeleteId` string | null state for inline delete confirmation row.
  - `showModal` boolean + `editItem` (item | null) state for Add / Edit modal.
  - **Table layout** (lg:grid replaced by a `<table>`) with columns: Thumbnail, Title/Tagline, Duration, Price, Status badge, Actions.
  - **Status badge:** `hidden` → `<Badge variant="gray">Hidden</Badge>`; `mp.status === 'active'` → `<Badge variant="green">Active</Badge>`; otherwise → `<Badge variant="yellow">{mp.status}</Badge>`.
  - **Action buttons per row:** Eye (external link), Edit pencil (opens modal pre-filled), EyeOff / Eye toggle (flips `hidden`), Trash (sets `confirmDeleteId`).
  - **Inline delete confirm:** when `confirmDeleteId === mp.id`, show "Are you sure?" text + "Yes, Delete" (red) + "Cancel" buttons in place of action icons.
  - **Add/Edit modal fields:** title, tagline, duration, price (discountPrice as number), status (`<select>` with active/draft/coming-soon/archived options). On Save: if `editItem` is non-null update the matching item in state; else append a new item with `id: crypto.randomUUID()` and `slug: title.toLowerCase().replace(/\s+/g, '-')` and `hidden: false`.
  - **Header:** shows item count excluding hidden items + total; Add Program button enabled (no `opacity-50 cursor-not-allowed`).

  Files: `d:\WEBSITE GLOBALMINDS\demo1\src\pages\admin\AdminMasterProgramsPage.tsx`  
  Verify: `npx tsc --noEmit` — zero errors; `npm run dev` — page at `/admin/master-programs` shows table with working add/edit/delete/hide buttons.

- [ ] 3. **Rewrite `AdminFAQsPage.tsx` — full CRUD + hide/show + category filter**  
  Replace the accordion-only view with an interactive table + modal pattern.

  Detailed spec:
  - `const [items, setItems] = useState(() => globalFAQs.map(faq => ({ ...faq, hidden: faq.hidden ?? false })))` — seed from imported data using the `hidden` field added in item 1.
  - `search` string state, `catFilter` string state (default `'all'`), filter items by question/answer text and category.
  - `confirmDeleteId` string | null.
  - `showModal` boolean + `editItem` (item | null).
  - **Table columns:** Category badge, Question (truncated), Hidden badge, Actions (Edit, EyeOff/Eye, Trash).
  - **Expand row:** clicking the question cell toggles an expanded answer row below it (keep accordion-style UX but inside a table — use a `<tr>` with `colspan={5}` for the answer).
  - **Category filter:** derive unique categories from items; render as `<select>` in the filter bar.
  - **Modal fields:** question (`<textarea>`), answer (`<textarea>`), category (`<input>`). On Save: upsert same as item 2.
  - **Status badge:** `hidden` → `<Badge variant="gray">Hidden</Badge>` else `<Badge variant="green">Visible</Badge>`.

  Files: `d:\WEBSITE GLOBALMINDS\demo1\src\pages\admin\AdminFAQsPage.tsx`  
  Verify: `npx tsc --noEmit` — zero errors; page at `/admin/faqs` shows searchable, filterable table with working CRUD.

- [ ] 4. **Rewrite `AdminBlogPage.tsx` — full CRUD + publish/unpublish toggle**  
  Replace the read-only table with an interactive table + modal pattern.

  Detailed spec:
  - Add `hidden?: boolean` and `status?: 'published' | 'draft'` to `BlogPost` in `src/types/index.ts` (item dependency: do this inside this step's file edit — add both fields to the interface).
  - `const [items, setItems] = useState(() => blogPosts.map(p => ({ ...p, status: p.status ?? 'published' as const, hidden: p.hidden ?? false })))`.
  - `search` string, `catFilter`, `statusFilter` (`'all' | 'published' | 'draft'`).
  - `confirmDeleteId`, `showModal`, `editItem`.
  - **Table columns:** Thumbnail, Title/slug, Category, Author, Date, Status badge, Actions (View, Edit, Publish/Unpublish toggle, Trash).
  - **Status badge:** `'published'` → `<Badge variant="green">Published</Badge>`; `'draft'` → `<Badge variant="yellow">Draft</Badge>`.
  - **Publish/Unpublish toggle:** a single button that shows `<Eye>` when draft (publish action) and `<EyeOff>` when published (unpublish action); flips `status` in state.
  - **Modal fields:** title, slug (auto-derived from title if blank: `title.toLowerCase().replace(/[^a-z0-9]+/g, '-')`), category, author name, excerpt (`<textarea>`), status `<select>` (published/draft). On Save: upsert.
  - **New Post button** in header is enabled (removes `opacity-50 cursor-not-allowed`).

  Files:  
  - `d:\WEBSITE GLOBALMINDS\demo1\src\types\index.ts` (add `status` and `hidden` to `BlogPost`)  
  - `d:\WEBSITE GLOBALMINDS\demo1\src\pages\admin\AdminBlogPage.tsx`  
  Verify: `npx tsc --noEmit` — zero errors; page at `/admin/blog` shows functional CRUD table.

- [ ] 5. **Rewrite `AdminTestimonialsPage.tsx` — full CRUD + featured star toggle + hide toggle**  
  The current page has search + filter but no add/edit/delete controls. Replace with full CRUD.

  Detailed spec:
  - Add `hidden?: boolean` to the `Testimonial` interface in `src/types/index.ts`.
  - `const [items, setItems] = useState(() => testimonials.map(t => ({ ...t, hidden: t.hidden ?? false })))`.
  - Preserve existing `search` and `filter` state. Add `confirmDeleteId`, `showModal`, `editItem`.
  - **Table additions to the existing structure:** add Actions column (Edit pencil, Star toggle for featured, EyeOff/Eye for hidden, Trash).
  - **Featured star toggle:** clicking the Star icon flips `featured` in state. Star is filled amber when featured, outline gray when not.
  - **Hide toggle:** EyeOff (when visible) / Eye (when hidden) flips `hidden` in state.
  - **Plus button** in the header (currently missing) opens the Add modal.
  - **Modal fields:** name, role, company, course, rating (number 1-5 via `<select>`), review (`<textarea>`), location, featured (checkbox). On Save: upsert with `id: crypto.randomUUID()` for new items.
  - **Inline delete confirm** same pattern as other pages.
  - Remove the note about "requires backend API" from the footer.

  Files:  
  - `d:\WEBSITE GLOBALMINDS\demo1\src\types\index.ts` (add `hidden?` to `Testimonial`)  
  - `d:\WEBSITE GLOBALMINDS\demo1\src\pages\admin\AdminTestimonialsPage.tsx`  
  Verify: `npx tsc --noEmit` — zero errors; page at `/admin/testimonials` has working add/edit/delete/star/hide controls.

- [ ] 6. **Create `AdminNavigationPage.tsx` — two-section nav editor with reorder**  
  New file from scratch. All state is in-memory; no backend.

  Detailed spec:
  - **NavItem shape for this page:** `{ id: string; label: string; href: string; visible: boolean }`.
  - **Two sections:**  
    - `primaryNav` — initial items seeded from the website's top-level nav links: Home (`/`), Courses (`/courses`), Master Programs (`/master-programs`), Corporate Training (`/corporate-training`), About (`/about`), Contact (`/contact`), Colleges (`/colleges`).  
    - `moreMenu` — initial items: Blog (`/blog`), Trainers (`/trainers`), Locations (`/locations`), Events (`/events`), Internships (`/internships`), Certifications (`/certifications`), Career (`/career`), Placement (`/placement`).
  - **Per-section controls:** Add button opens modal; each row has: drag handle icon (decorative only), label, href, visible badge, Edit, Move Up, Move Down, Delete buttons.
  - **Move Up / Move Down:** swap item with neighbour in the array; first item's Up and last item's Down are disabled.
  - **Visible toggle:** clicking the badge (green "Visible" / gray "Hidden") or a dedicated EyeOff/Eye button flips `visible`.
  - **Modal fields:** Label (`<input>`), href (`<input>`). On Save: upsert; new items get `id: crypto.randomUUID()` and `visible: true`.
  - **Live Preview Bar:** a `<nav>` rendered below the two sections that shows the primaryNav items where `visible === true` as pill links, with a "More ▾" dropdown-style listing the visible moreMenu items. This is purely visual — no real routing, just a `<a>` tag with `href="#"`. Use `pointer-events-none` or add a note that this is a preview.
  - **Inline delete confirm** same pattern.
  - **Section layout:** each section is a `<div>` with heading, Add button, and a `<table>` with columns: #, Label, Href, Status, Actions.

  Files: `d:\WEBSITE GLOBALMINDS\demo1\src\pages\admin\AdminNavigationPage.tsx`  
  Verify: `npx tsc --noEmit` — zero errors; file compiles cleanly before wiring into routing.

- [ ] 7. **Register `AdminNavigationPage` in `App.tsx` and add it to the `AdminLayout.tsx` sidebar**  

  In `App.tsx`:
  - Import: `import AdminNavigationPage from './pages/admin/AdminNavigationPage';`
  - Add route inside the `/admin` children array: `{ path: 'navigation', element: <AdminNavigationPage /> }`

  In `AdminLayout.tsx`:
  - Add `import { Navigation2 } from 'lucide-react';` (or reuse `PenTool` already imported if `Navigation2` is unavailable in lucide-react 0.344; check — `Navigation2` exists in that version).
  - In the `navGroups` array, inside the `'Content'` group, add the entry **immediately after** the existing Website Menu entry:  
    `{ icon: Navigation2, label: 'Navigation', href: '/admin/navigation' }`
  - Also add `/admin/navigation` to the `permittedRoutes` Set for `CONTENT_MANAGER` role.

  Files:  
  - `d:\WEBSITE GLOBALMINDS\demo1\src\App.tsx`  
  - `d:\WEBSITE GLOBALMINDS\demo1\src\components\admin\AdminLayout.tsx`  
  Verify: `npx tsc --noEmit` — zero errors; `npm run dev` — sidebar shows "Navigation" link and `/admin/navigation` renders the new page.

---

## Dependency order

```
Item 1 (type: FAQ.hidden)
  └── Item 3 (AdminFAQsPage uses hidden field)

Item 4 (types: BlogPost.status/hidden + AdminBlogPage)
Item 5 (types: Testimonial.hidden + AdminTestimonialsPage)

Item 2 (AdminMasterProgramsPage — no new type needed)
Item 6 (AdminNavigationPage — standalone)
Item 7 (depends on Item 6 existing)
```

Items 2, 4, 5, and 6 can be written in any order relative to each other, provided item 1 precedes item 3 and item 6 precedes item 7. The safest sequence is: **1 → 2 → 3 → 4 → 5 → 6 → 7**.

---

## Notes and assumptions

- All state changes are in-memory only (no API/backend). Refreshing the page resets to the seeded data. This matches the existing pattern in `AdminCoursesPage` which delegates persistence to the CMS service — these pages will show the same note.
- `crypto.randomUUID()` is available in all modern browsers and Vite's dev/build environment; no polyfill needed.
- The `Navigation2` lucide icon is confirmed present in lucide-react 0.344 — use it. If the build rejects it, fall back to `PenTool` which is already imported in `AdminLayout.tsx`.
- Do not remove any existing admin routes from `App.tsx` or existing sidebar entries from `AdminLayout.tsx`; only add.
- The `BlogPost` type currently has no `status` field. The existing `blogPosts` data array does not set it, so the default `?? 'published'` fallback in the `useState` initializer covers all seed data.
- The `Testimonial.hidden` field addition is backward-compatible because it is optional (`hidden?`).
