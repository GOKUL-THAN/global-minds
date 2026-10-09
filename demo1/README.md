# Global Academy

**"Learn. Build. Certify. Grow Globally."**

An education and professional training platform for IT training, cloud computing, DevOps, AI, data science, full stack development, software testing, cyber security and career development. LMS functionality is being implemented in phases; see the audit documents for current integration status.

---

## Features

- 🎓 **63+ Courses** across 14 technology categories
- 📚 **8 Master Programs** — comprehensive multi-month career tracks
- 🌐 **Global reach** — online training for learners in 25+ countries
- 💼 **Career platform** — resume prep, interview prep, mock interviews, job support
- 🏢 **Corporate training** — customised enterprise learning
- 🔬 **Internships** — hands-on IT internship opportunities
- 🏫 **Classroom training** — physical centres with lab facilities
- 📝 **Blog** — tech insights, career guides and certifications
- 🔐 **Admin portal** — full admin architecture (API-ready)
- 📱 **Fully responsive** — mobile-first, works 320px–1920px
- ♿ **Accessible** — WCAG-oriented, keyboard navigation, skip links
- 🔍 **SEO-ready** — structured data, sitemap, meta tags

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Routing | React Router v6 |
| Styling | Tailwind CSS 3 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Utilities | clsx + tailwind-merge |
| Animations | CSS animations (reduced-motion safe) |
| Auth API | Node.js + TypeScript + Express |
| Local database | SQLite (sql.js) |
| Production database | PostgreSQL (`pg`) |

---

## Project Structure

```
src/
├── App.tsx                    # Router with all routes
├── main.tsx                   # App entry point
├── index.css                  # Tailwind base + design system
│
├── components/
│   ├── admin/                 # Admin layout
│   ├── courses/               # CourseCard
│   ├── home/                  # Hero, Stats, Categories, Featured, etc.
│   ├── layout/                # Navbar, Footer, AnnouncementBar, Layout
│   └── ui/                    # Button, Badge, Modal, Toast, FAQAccordion, etc.
│
├── data/                      # All editable content (courses, programs, etc.)
│   ├── siteConfig.ts          # Brand, contact, SEO defaults
│   ├── courses.ts             # 17 detailed course records
│   ├── coursesExtra.ts        # 46 additional course stubs
│   ├── categories.ts          # 14 course categories
│   ├── masterPrograms.ts      # 8 master programs
│   ├── instructors.ts         # 6 trainer profiles
│   ├── locations.ts           # Training centre locations
│   ├── internships.ts         # Internship listings
│   ├── blogs.ts               # Blog posts
│   ├── faqs.ts                # FAQ entries
│   └── testimonials.ts        # Student testimonials
│
├── hooks/                     # usePageMeta, useCountUp, useIntersection
├── services/                  # authService, courseService, enquiryService, paymentService
├── types/                     # TypeScript type definitions
└── utils/                     # cn, formatters, structuredData
```

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start development server
npm run dev

# 4. Open in browser
# http://localhost:5173
```

### Admin portal authentication

The admin portal is available at `/admin` and accepts `ADMIN` and `SUPER_ADMIN`
accounts. Authentication is verified by the backend; passwords are bcrypt-hashed
in the configured database and sessions use an HttpOnly, SameSite=Strict cookie.
No admin password is sent to or stored in the browser.

1. Copy `server/.env.example` to `server/.env`. Set unique `ADMIN_PASSWORD` and
   `SUPER_ADMIN_PASSWORD` values (14–72 bytes), and a random `JWT_SECRET` of at
   least 32 bytes. Keep this file private. The default local admin email is
   `admin@local.test`; the Super Admin email is `globalminds@gmail.com`.
2. Install and run the API in one terminal:

   ```bash
   npm --prefix server install
   npm run dev:api
   ```

   On first startup the API applies versioned database migrations to the
   configured database and provisions both configured accounts if their emails
   do not already exist.
   It never resets an existing account's password from environment variables.
3. In another terminal run `npm run dev` and visit `http://localhost:5173/admin`.
   You will be sent to `/admin/login`.

All `/api/admin` routes are protected by server-side authentication and
permission checks. Local development defaults to SQLite and persists its
database file after transactions. Production startup requires PostgreSQL and
uses `DATABASE_URL`; the PostgreSQL adapter writes directly to the database and
does not export in-memory snapshots. Both providers use the versioned migration
runner. To configure production, set `DATABASE_DRIVER=postgres` and provide a
private PostgreSQL connection string in `DATABASE_URL`; keep credentials out
of source control and never use a `VITE_` variable for the database URL.
The generic Content Studio accepts these content section keys: `dashboard`,
`courses`, `categories`, `master-programs`, `website-menu`, `live-projects`,
`events`, `scholarships`, `refer-earn`, `corporate-training`, `about`,
`contact`, `online-training`, `classroom-training`, `certifications`,
`demo-class`, `skill-assessment`, `career`, `placement-records`,
`interview-preparation`, `mock-interview`, `students`, `instructors`,
`enquiries`, `internships`, `batches`, `locations`, `blog`, `faqs`,
`testimonials`, `certificates`, `payments`, and `settings`. Public reads are
enabled only for an explicit subset of these keys; this catalog does not mean
every public page is driven by CMS records. See the Phase 1 audit for the
current integration status.

CMS API:

| Method and path | Purpose |
|-----------------|---------|
| `GET /api/content/:section` | Public list of published records plus minimal archived tombstones |
| `GET /api/content/:section/:slug` | Public published record lookup |
| `GET /api/admin/content/:section[?status=draft|published|archived]` | Authenticated section list |
| `GET /api/admin/content/:section/:slug` | Authenticated record details |
| `POST /api/admin/content/:section` | Create a draft (`{ "slug": "...", "content": {...} }`) |
| `PUT /api/admin/content/:section/:slug` | Update an existing record as a draft; returns `404` when it does not exist |
| `POST /api/admin/content/:section/:slug/publish` | Explicitly publish saved content |
| `POST /api/admin/content/:section/:slug/unpublish` | Move published content back to draft and remove its public version |
| `POST /api/admin/content/:section/:slug/archive` | Hide content without deleting it |
| `POST /api/admin/content/:section/:slug/restore` | Restore an archived record |
| `DELETE /api/admin/content/:section/:slug` | Permanently delete; `SUPER_ADMIN` only |

CMS records are keyed by `(section, slug)`. Slugs are supplied in the URL for
PUT and lifecycle actions (POST create takes `{ "slug": "...", "content": {} }`);
course creation can derive a slug from its title when omitted. Slugs are
limited to 120 lowercase letters, numbers, hyphens, and underscores.
Content must be a JSON object up to 64 KB. Editing a published record saves a
draft while its prior published content remains public until explicit publish;
admin records expose `hasDraft` for pending unpublished changes. Admin record
responses include `id`, `section`, `slug`, `content` (working copy),
`publishedContent`, `status` (`draft`, `published`, `archived`), `hasDraft`,
`archivedFromStatus`, `createdBy`/`createdRole`, `updatedBy`/`updatedRole`,
`createdAt`, `updatedAt`, `publishedAt`, `archivedAt`, and `draftUpdatedAt`
(nullable timestamps/fields where not applicable). Public published entries
include `status: "published"` and the last published `content`. When a
previously published entry is archived, the public section list includes only
a tombstone (`id`, `section`, `slug`, `status: "archived"`, `publishedAt`,
`updatedAt`), with no content, so clients can suppress static-overlay content.
Draft-only and never-published archived records are not exposed publicly.
Unpublishing retains the editable draft but clears the previous public
snapshot. CMS lifecycle mutations are recorded in the audit log.
Enquiry submission and admin enquiry listing continue to use their existing
endpoints and data. Production hosting should proxy `/api` on the same origin,
with `APP_ORIGIN` set to the exact website origin.

---

## Environment Variables

The frontend `.env.example` documents optional public frontend settings.
`server/.env.example` documents required server-only settings. Key frontend
variables:

| Variable | Description | Safe for browser? |
|----------|-------------|-------------------|
| `VITE_APP_NAME` | Application name | ✅ Yes |
| `VITE_API_BASE_URL` | Backend API URL | ✅ Yes |
| `VITE_RAZORPAY_KEY` | Razorpay public key | ✅ Yes (public key only) |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key | ✅ Yes (public key only) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ Yes |

⚠️ **Never** put secret keys (Razorpay secret, Stripe secret, database passwords) in `VITE_` variables — they will be exposed in the browser bundle.

### API database configuration

`server/.env.example` lists the API environment variables. `DATABASE_DRIVER`
defaults to `sqlite` for local development. Set it to `postgres` and configure
`DATABASE_URL` for production; the server intentionally refuses to start in
production with SQLite. Migrations are applied automatically and recorded in
`schema_migrations`. Back up the database before deploying new migrations.

---

## Routes

### Public Routes
| Route | Page |
|-------|------|
| `/` | Homepage |
| `/courses` | Course catalog (search + filter) |
| `/courses/:slug` | Course detail |
| `/categories/:slug` | Category courses |
| `/master-programs` | Master programs list |
| `/master-programs/:slug` | Master program detail |
| `/online-training` | Online training |
| `/classroom-training` | Classroom training |
| `/certifications` | Certifications |
| `/career` | Career support |
| `/career/interview-preparation` | Interview prep |
| `/career/resume-preparation` | Resume prep |
| `/career/mock-interview` | Mock interview booking |
| `/career/job-support` | Job search support |
| `/placement` | Placement support |
| `/internships` | Internships (with search/filter) |
| `/internships/:slug` | Internship detail |
| `/corporate-training` | Corporate training |
| `/trainers` | Expert trainers |
| `/about` | About Global Academy |
| `/contact` | Contact form |
| `/blog` | Blog listing |
| `/blog/:slug` | Blog post detail |
| `/locations` | Training centre locations |
| `/locations/:slug` | Location detail |
| `/register` | Student registration |
| `/login` | Student login |
| `/checkout` | Payment (placeholder) |
| `/privacy-policy` | Privacy policy |
| `/terms` | Terms of service |
| `/refund-policy` | Refund policy |
| `/cookie-policy` | Cookie policy |

### Dashboard (no layout)
| Route | Page |
|-------|------|
| `/dashboard` | Student dashboard |

### Admin (admin layout)
| Route | Page |
|-------|------|
| `/admin` | Admin dashboard |
| `/admin/courses` | Course management |
| `/admin/categories` | Categories |
| `/admin/master-programs` | Master programs |
| `/admin/students` | Students |
| `/admin/instructors` | Instructors |
| `/admin/enquiries` | Enquiries |
| `/admin/internships` | Internships |
| `/admin/batches` | Batch schedules |
| `/admin/locations` | Training centres |
| `/admin/blog` | Blog posts |
| `/admin/faqs` | FAQs |
| `/admin/testimonials` | Testimonials |
| `/admin/certificates` | Certificates |
| `/admin/payments` | Payments |
| `/admin/settings` | Site settings |

---

## Build Commands

```bash
npm run dev       # Start development server
npm run build     # TypeScript check + production build
npm run preview   # Preview production build
npm run lint      # ESLint check
npm --prefix server run build
npm --prefix server test
```

---

## Updating Business Content

All business content lives in `src/data/`. **No UI components need to be edited** to update:

| What to update | File |
|----------------|------|
| Brand name, phone, email, address | `src/data/siteConfig.ts` |
| Course information | `src/data/courses.ts` + `src/data/coursesExtra.ts` |
| Master program details | `src/data/masterPrograms.ts` |
| Trainer profiles | `src/data/instructors.ts` |
| Training centre locations | `src/data/locations.ts` |
| Internship listings | `src/data/internships.ts` |
| Blog posts | `src/data/blogs.ts` |
| FAQs | `src/data/faqs.ts` |
| Testimonials | `src/data/testimonials.ts` |
| Category list | `src/data/categories.ts` |

---

## Connecting a Backend API

The Express API is connected for admin/student authentication, registration,
CMS content, enquiries, and newsletter subscription. Public catalogue pages
still use local seed data with published CMS overlays; most LMS operations and
several admin areas remain mock-backed or unavailable. Use
[API.md](./docs/API.md) and [WEBSITE-AUDIT.md](./docs/WEBSITE-AUDIT.md) for the
current feature-by-feature status. Do not treat routes that render successfully
as evidence that their data is persisted.

---

## Security Notes

- No secrets are stored in VITE_ variables
- All forms use Zod validation
- Admin API routes require a backend session; only `ADMIN` and `SUPER_ADMIN`
  are currently enforced as backend roles
- Payment secrets must always remain server-side only

---

## Placeholder Data

All course descriptions, prices, trainer bios, testimonials, statistics and business details are **placeholder content**. Replace with real Global Academy information before going live.

Items that must be updated:
- Course names, descriptions, prices, durations
- Trainer names, photos, bios, certifications
- Testimonials (remove demo reviews, add real ones)
- Statistics (student count, course count, countries)
- Phone numbers and email addresses
- Physical addresses and map links
- Legal pages (review with legal counsel)

---

## Deployment

The frontend builds to a static `/dist` folder, but the complete application
also requires the Express API. Production must use PostgreSQL (`DATABASE_DRIVER=postgres`
and a private `DATABASE_URL`) and proxy same-origin `/api` requests to the API.
Deploy the frontend and API with their required SPA fallback and environment
configuration to:

- **Vercel** — `vercel deploy`
- **Netlify** — drag and drop `/dist`
- **AWS S3 + CloudFront** — sync `/dist` to bucket
- **Any static hosting** — serve the `/dist` folder

Configure your hosting to redirect all routes to `index.html` for SPA routing.

---

*Global Academy — Placeholder content. All business information to be updated before public launch.*
#   g l o b a l m i n d s - c o u r s e - w e b s i t e  
 #   g l o b a l m i n d s - c o u r s e - w e b s i t e  
 