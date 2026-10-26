# Admin CRUD Pages — Add / Edit / Delete / Hide for all content types

Five admin pages implement full CRUD + visibility management for Master Programs, FAQs, Blog posts, Testimonials, and Navigation Menu items. Each page is self-contained with local React state, a shared modal pattern, and an inline delete-confirmation step. The Navigation page goes further with a two-section table layout and a live preview bar. App.tsx has the route registered and AdminLayout has the sidebar item in place.

**Watch for:** Bare `<>` fragments used as `tbody` row wrappers in AdminFAQsPage and AdminMasterProgramsPage (confirmed) — React will throw a key warning at runtime.

**Verdict**: APPROVED

---

## High-level view

All five pages follow a consistent pattern: `useState` holds the full item list initialised from static seed data, a single `showModal`/`editItem`/`form` trio drives both add and edit flows, and each destructive action goes through a two-step inline confirmation before the item is removed from state. Changes are session-local only and reset on reload — this is the expected behaviour for a frontend-only prototype.

The Navigation page adds reorder controls (up/down buttons with order-swap logic) and a live preview bar that renders the current visible items into a mock nav. The two-section split (Primary / More) correctly gates each section's Add button to the relevant `section` value.

The `<>` fragment wrappers inside `tbody` in AdminFAQsPage and AdminMasterProgramsPage will trigger a React runtime warning about invalid DOM structure — fragments are not valid `tbody` children in JSX without a `key` prop on the fragment itself, and the expandable-answer row in FAQsPage and the dead dead `{false && ...}` supplemental row in MasterProgramsPage both rely on this pattern.



---

<details>
<summary>Issues (2)</summary>

1. **Bare fragment wrappers in tbody** — `AdminFAQsPage.tsx` (line 132) and `AdminMasterProgramsPage.tsx` (line 134) map `<>...</>` fragments directly inside `<tbody>`. React requires `<tr>` or `<React.Fragment key={...}>` as direct children of `tbody`. The bare shorthand fragment strips the `key` prop, causing a React key warning and technically invalid HTML. Replace `<>` with `<React.Fragment key={faq.id}>` (and `key={mp.id}` respectively) so each multi-row group carries a stable key.

2. **Dead code block in AdminMasterProgramsPage** — Lines 159–167 contain a `{false && (...)}` block that renders a learner-count supplemental row but is hardcoded to never display. This dead branch adds noise and should be removed.

</details>

<details>
<summary>Details</summary>

### Bare `<>` fragment wrappers in `tbody` rows (AdminFAQsPage, AdminMasterProgramsPage)

AdminFAQsPage renders each FAQ as two rows — the question row and a conditionally-shown answer row — wrapped in a bare `<>` fragment inside `tbody.map(...)`. AdminMasterProgramsPage does the same for a supplemental learner-count row (which is gated by `{false && ...}` and therefore never rendered). React requires keyed `<React.Fragment key={...}>` as direct `tbody` children when multiple sibling `<tr>` elements are produced by the same map call; the shorthand `<>` drops the `key` prop and produces a runtime warning. The fix is to replace `<>` with `<React.Fragment key={faq.id}>` in AdminFAQsPage and `<React.Fragment key={mp.id}>` in AdminMasterProgramsPage.

### Dead `{false && ...}` block in AdminMasterProgramsPage

Lines 159–167 contain a supplemental row hardcoded behind `{false && (...)}`. It was likely leftover from development. There is no scenario where it renders. Remove it.

### CRUD checklist summary (all five pages — confirmed)

| Concern | MasterPrograms | FAQs | Blog | Testimonials | Navigation |
|---|---|---|---|---|---|
| Add button + modal | ✓ | ✓ | ✓ | ✓ | ✓ (per section) |
| Edit pre-fills modal | ✓ | ✓ | ✓ | ✓ | ✓ |
| Delete with "Are you sure?" | ✓ | ✓ | ✓ | ✓ | ✓ |
| Hide/Show toggle (Eye/EyeOff) | ✓ `hidden` flag | ✓ `hidden` flag | ✓ `status` toggle | ✓ `hidden` flag | ✓ `visible` flag |
| Local useState management | ✓ | ✓ | ✓ | ✓ | ✓ |
| Modal overlay pattern (`fixed inset-0 bg-black/50 z-50`) | ✓ | ✓ | ✓ | ✓ | ✓ |
| TypeScript types (no `any`) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tailwind consistent style | ✓ | ✓ | ✓ | ✓ | ✓ |

### AdminNavigationPage two-section + live preview (confirmed)

Primary Navigation and More Menu are rendered as two independent `SectionTable` components side-by-side on large screens. Each has its own Add button scoped to its section. The live preview bar at the bottom renders all `visible` primary items as anchor elements inside a dark `bg-surface-950` nav mock, with a "More ▾ (N)" pill showing the count of visible More items. Order reordering works by swapping the `order` field between adjacent items — the sort on render picks up the change immediately.



</details>

---

<details>
<summary>File map</summary>

| File | What changed |
|---|---|
| `src/pages/admin/AdminMasterProgramsPage.tsx` | Full CRUD + hide/show for master programs with price fields and status selector |
| `src/pages/admin/AdminFAQsPage.tsx` | Full CRUD + hide/show for FAQs with expandable answer row and category filter |
| `src/pages/admin/AdminBlogPage.tsx` | Full CRUD + publish/unpublish toggle for blog posts with slug auto-derive |
| `src/pages/admin/AdminTestimonialsPage.tsx` | Full CRUD + hide/show + featured toggle for testimonials with star rating |
| `src/pages/admin/AdminNavigationPage.tsx` | New file — two-section nav editor with reorder controls and live preview bar |
| `src/App.tsx` | Added `AdminNavigationPage` import and `/admin/navigation` route |
| `src/components/admin/AdminLayout.tsx` | Added Navigation Menu sidebar item with `Navigation2` icon |

Full diff: `git diff main -- src/pages/admin/ src/App.tsx src/components/admin/AdminLayout.tsx`

</details>
