# Global Minds Academy

**"Learn. Build. Certify. Grow Globally."**

A full-featured IT training and career development platform. Built with React 18 + TypeScript on the frontend and a Node.js + Express backend with SQLite (dev) / PostgreSQL (production) for data storage.

---

## What's Inside

- 🎓 **8 Courses** — Data Science, Machine Learning, Software Testing, Automation Testing, AWS Training, Generative AI, Full Stack Development, Cyber Security
- 📚 **5 Master Programs** — Freshers, Full Stack, AI & ML, Data Science & BI, Software Testing
- 🏢 **Corporate Training** — enquiry form, submits to `/api/enquiries`
- 🏫 **Colleges & Universities** — partnership enquiry form, submits to `/api/enquiries`
- 💼 **Career Platform** — placement records, interview prep, resume prep, mock interviews, job support
- 🔬 **Internships** — listings with detail pages
- 📝 **Blog** — tech articles and career guides
- 📍 **Locations** — training centre pages
- 🔐 **Admin Portal** — full CRUD, works without backend (demo mode auto-login)
- 🗄️ **Database** — SQLite (dev), PostgreSQL (production) via Express API
- 📱 **Fully Responsive** — mobile-first, 320 px – 1920 px
- 🔍 **SEO** — structured data, dynamic meta tags

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Routing | React Router v6 |
| Styling | Tailwind CSS 3 |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Backend | Node.js + Express + TypeScript |
| Auth | JWT (HttpOnly cookies) + bcryptjs |
| Database (dev) | SQLite via sql.js |
| Database (prod) | PostgreSQL via `pg` |
| Email | Resend API |

---

## Database

The backend stores all dynamic data in a database:

| Table / Section | What's stored |
|----------------|--------------|
| `users` | Admin, content manager, trainer, student accounts |
| `sessions` | JWT session tokens |
| `enquiries` | All form submissions (course, contact, corporate, college) |
| `cms_records` | CMS content (courses, master programs, blog, FAQs, testimonials, etc.) |
| `schema_migrations` | Applied migration history |

**Dev:** SQLite file at `server/data/admin.sqlite` — created automatically on first run.
**Prod:** PostgreSQL — set `DATABASE_DRIVER=postgres` and `DATABASE_URL` in `server/.env`.

### CMS API — store/update any content

| Method + Path | Purpose |
|--------------|---------|
| `GET /api/content/:section` | Public published records |
| `POST /api/admin/content/:section` | Create draft record |
| `PUT /api/admin/content/:section/:slug` | Update existing record |
| `POST /api/admin/content/:section/:slug/publish` | Publish draft |
| `POST /api/admin/content/:section/:slug/unpublish` | Unpublish |
| `POST /api/admin/content/:section/:slug/archive` | Archive |
| `DELETE /api/admin/content/:section/:slug` | Delete (SUPER_ADMIN only) |

Valid CMS sections: `courses`, `categories`, `master-programs`, `blog`, `faqs`, `testimonials`, `instructors`, `locations`, `internships`, `website-menu`, `corporate-training`, `about`, `contact`, `online-training`, `classroom-training`, `certifications`, `batches`, `events`, `scholarships`, `refer-earn`, `live-projects`, `career`, `placement-records`, `demo-class`, `skill-assessment`, `interview-preparation`, `mock-interview`.

---

## Local Setup

```bash
# 1. Install frontend dependencies
npm install

# 2. Copy and configure frontend env
cp .env.example .env

# 3. Install and start the backend (creates SQLite DB automatically)
cd server
cp .env.example .env        # fill in JWT_SECRET, ADMIN_PASSWORD, SUPER_ADMIN_PASSWORD
npm install
cd ..
npm run dev:api             # starts Express API on port 3001

# 4. Start frontend dev server (separate terminal)
npm run dev                 # http://localhost:5173
```

### Admin access

| URL | Behaviour |
|-----|-----------|
| `http://localhost:5173/admin` | Redirects to login if backend running, or auto-signs in as demo SUPER_ADMIN if no backend |
| `http://localhost:5173/admin/login` | Login form — "Enter Admin Panel (Demo Mode)" button available when no backend |

**Default accounts** (created automatically on first API startup):

| Role | Email | Password set in |
|------|-------|----------------|
| Super Admin | `globalminds@gmail.com` | `server/.env` → `SUPER_ADMIN_PASSWORD` |
| Admin | `admin@local.test` | `server/.env` → `ADMIN_PASSWORD` |

---

## Build Commands

```bash
npm run dev          # Frontend dev server (HMR, port 5173)
npm run dev:host     # Frontend exposed on LAN (0.0.0.0:3000)
npm run dev:api      # Backend API server (port 3001)
npm run build        # TypeScript check + Vite production build → /dist
npm run preview      # Preview production build
npm run lint         # ESLint (zero warnings)
npm run serve        # Serve /dist locally
npm run build:api    # Build Express API → server/dist
```

---

## Environment Variables

### Frontend (`.env`)

| Variable | Description |
|----------|-------------|
| `VITE_APP_NAME` | App display name |
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_RAZORPAY_KEY` | Razorpay public key (safe for browser) |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key (safe for browser) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

⚠️ Never put secret keys in `VITE_` variables — they are bundled into the browser build.

### Backend (`server/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_DRIVER` | `sqlite` (dev) or `postgres` (prod) |
| `DATABASE_PATH` | Path to SQLite file (default: `data/admin.sqlite`) |
| `DATABASE_URL` | PostgreSQL connection string (prod only) |
| `JWT_SECRET` | Session signing key — min 32 chars, keep private |
| `ADMIN_EMAIL` | Admin account email |
| `ADMIN_PASSWORD` | Admin account password (min 14 chars) |
| `SUPER_ADMIN_EMAIL` | Super Admin email |
| `SUPER_ADMIN_PASSWORD` | Super Admin password (min 14 chars) |
| `RESEND_API_KEY` | Resend API key for email (optional) |
| `EMAIL_FROM` | Sender name + address for emails |
| `APP_ORIGIN` | Frontend origin for CORS + email links |
| `PORT` | API port (default: 3001) |

---

## Project Structure

```
demo1/
├── index.html                     # App shell + SEO meta tags
├── vite.config.ts                 # Vite config (proxy /api → port 3001)
├── package.json                   # Frontend scripts + dependencies
│
├── src/
│   ├── App.tsx                    # All routes (public + admin)
│   ├── main.tsx                   # Entry point
│   ├── index.css                  # Tailwind base + design tokens
│   │
│   ├── components/
│   │   ├── admin/                 # AdminLayout, AdminAuthGate
│   │   ├── courses/               # CourseCard
│   │   ├── home/                  # HeroSection, StatsSection, FeaturedCourses,
│   │   │                          # MasterProgramsSection, PopularCategories,
│   │   │                          # CTASection, WhyUsSection, BlogSection, etc.
│   │   ├── layout/                # Navbar (mega menu), Footer, AnnouncementBar
│   │   └── ui/                    # Button, Badge, Modal, Toast, Breadcrumbs,
│   │                              # FAQAccordion, StarRating, LazyImage, etc.
│   │
│   ├── data/                      # Static seed data (used as fallback when API is down)
│   │   ├── siteConfig.ts          # Brand, contact, stats, social links
│   │   ├── courses.ts             # 8 course records
│   │   ├── publicCourseCatalog.ts # Course catalog for public routing
│   │   ├── masterPrograms.ts      # 5 master programs
│   │   ├── categories.ts          # 8 course categories
│   │   ├── instructors.ts         # Trainer profiles
│   │   ├── locations.ts           # Training centre locations
│   │   ├── internships.ts         # Internship listings
│   │   ├── blogs.ts               # Blog posts
│   │   ├── faqs.ts                # FAQ entries
│   │   ├── testimonials.ts        # Student testimonials
│   │   ├── scholarships.ts        # Scholarship data
│   │   ├── navigationMenu.ts      # Nav items + mega menu
│   │   ├── cmsSeeds.ts            # CMS section seed keys
│   │   └── adminMockData.ts       # Admin demo data
│   │
│   ├── hooks/
│   │   ├── useCourseCatalog.ts    # Loads courses via API, falls back to static
│   │   ├── useCmsCollection.ts    # Generic CMS collection with static fallback
│   │   ├── usePageMeta.ts         # Dynamic <title> + meta description
│   │   ├── useCountUp.ts          # Animated number counter
│   │   └── useIntersection.ts     # Intersection Observer
│   │
│   ├── services/
│   │   ├── authService.ts         # Login, register, session, password reset
│   │   ├── courseService.ts       # Course catalog (API + static fallback)
│   │   ├── cmsService.ts          # CMS CRUD (silently falls back when API down)
│   │   ├── enquiryService.ts      # Course, contact, corporate & college enquiries
│   │   ├── paymentService.ts      # Payment placeholder
│   │   ├── studentPortalService.ts# Student dashboard API calls
│   │   └── adminOperationsService.ts # Admin bulk operations
│   │
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── CoursesPage.tsx        # Search + filter + grid/list toggle
│   │   ├── CourseDetailPage.tsx
│   │   ├── CategoryPage.tsx
│   │   ├── MasterProgramsPage.tsx
│   │   ├── MasterProgramDetailPage.tsx
│   │   ├── CorporateTrainingPage.tsx
│   │   ├── CollegesPage.tsx
│   │   ├── PlacementPage.tsx
│   │   ├── BatchSchedulePage.tsx
│   │   ├── CertificationsPage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── InternshipsPage.tsx
│   │   ├── TrainersPage.tsx (file exists, route to be wired)
│   │   ├── BlogPage.tsx / BlogDetailPage.tsx
│   │   ├── LocationsPage.tsx / LocationDetailPage.tsx
│   │   ├── career/                # CareerPage, JobSupport, InterviewPrep,
│   │   │                          # ResumePrep, MockInterview
│   │   ├── auth/                  # LoginPage, RegisterPage, AccountRecovery
│   │   ├── dashboard/             # StudentDashboardPage
│   │   ├── legal/                 # Privacy, Terms, Refund, Cookie
│   │   └── admin/                 # 19 admin pages
│   │
│   ├── types/                     # TypeScript interfaces
│   └── utils/                     # cn(), formatters, structuredData
│
└── server/                        # Express API + database
    ├── src/
    │   ├── index.ts               # Express app + all routes
    │   ├── auth.ts                # Auth middleware + JWT helpers
    │   ├── database.ts            # SQLite / PostgreSQL adapter
    │   ├── db.ts                  # DB query helpers
    │   ├── migrations.ts          # Versioned schema migrations
    │   ├── config.ts              # Environment config
    │   └── email.ts               # Resend email integration
    ├── data/
    │   ├── admin.sqlite           # SQLite database (dev, auto-created)
    │   ├── course-catalog.seed.json
    │   └── site-content.seed.json
    └── package.json
```

---

## Public Routes

| Route | Page |
|-------|------|
| `/` | Homepage |
| `/courses` | Course catalog — search, filter, grid/list |
| `/courses/:slug` | Course detail |
| `/categories/:slug` | Category listing |
| `/master-programs` | Master programs list |
| `/master-programs/:slug` | Master program detail |
| `/online-training` | Online training overview |
| `/classroom-training` | Classroom training |
| `/certifications` | Certifications |
| `/corporate-training` | Corporate training + enquiry form |
| `/colleges` | College partnerships + enquiry form |
| `/placement-records` | Placement records & hiring partners |
| `/batch-schedule` | Upcoming batch schedule |
| `/demo-class` | Free demo class booking |
| `/skill-assessment` | Skill assessment quizzes |
| `/scholarships` | Scholarship programs |
| `/events` | Events & webinars |
| `/live-projects` | Live project training |
| `/refer-earn` | Refer & earn |
| `/career` | Career support hub |
| `/career/interview-preparation` | Interview prep |
| `/career/resume-preparation` | Resume prep |
| `/career/mock-interview` | Mock interview |
| `/career/job-support` | Job support |
| `/internships` | Internship listings |
| `/internships/:slug` | Internship detail |
| `/about` | About Global Minds Academy |
| `/contact` | Contact form |
| `/blog` | Blog listing |
| `/blog/:slug` | Blog post |
| `/locations` | Training centres |
| `/locations/:slug` | Location detail |
| `/register` | Student registration |
| `/login` | Sign in |
| `/dashboard` | Student dashboard |
| `/certificates/:certificateId` | Certificate viewer |
| `/privacy-policy` | Privacy policy |
| `/terms` | Terms of service |
| `/refund-policy` | Refund policy |
| `/cookie-policy` | Cookie policy |

---

## Admin Routes

All under `/admin`. Without a backend, auto-signs in as demo SUPER_ADMIN.

| Route | Page | Operations |
|-------|------|-----------|
| `/admin` | Dashboard | — |
| `/admin/courses` | Courses | Add/Edit/Publish/Archive (CMS) |
| `/admin/website/master-programs` | Master Programs | Add/Edit/Hide/Delete |
| `/admin/website/categories` | Categories | Add/Edit/Delete |
| `/admin/website/blog` | Blog | Add/Edit/Publish/Unpublish/Delete |
| `/admin/website/faqs` | FAQs | Add/Edit/Hide/Delete |
| `/admin/website/testimonials` | Testimonials | Add/Edit/Feature/Hide/Delete |
| `/admin/website/website-menu` | Navigation | Add/Edit/Reorder/Hide/Delete |
| `/admin/website/instructors` | Instructors | Add/Edit/Hide/Delete |
| `/admin/website/locations` | Locations | Add/Edit/Delete |
| `/admin/enquiries` | Enquiries | View/Update status |
| `/admin/studio` | Content Studio | Full CMS editor |
| `/admin/settings` | Settings | Site config |

---

## Enquiry Forms → Database

All forms post to `/api/enquiries` and are stored in the database:

| Form | Source tag |
|------|-----------|
| Course enquiry | `Website Form` |
| Contact page | `Contact Page` |
| Corporate training | `Corporate Training Form` |
| College / university | `College Enquiry Form` |

View all submissions at `/admin/enquiries`.

---

## Deployment

### Frontend only (static)
```bash
npm run build        # outputs to /dist
```
Deploy `/dist` to Vercel, Netlify, AWS S3 + CloudFront, or any static host.
Configure all routes to redirect to `index.html` for SPA routing.

### Full stack (frontend + API + database)
```bash
npm run build        # frontend → /dist
npm run build:api    # API → server/dist
```

| Step | Detail |
|------|--------|
| Set `DATABASE_DRIVER=postgres` | in `server/.env` |
| Set `DATABASE_URL` | PostgreSQL connection string |
| Set `JWT_SECRET` | 32+ random characters |
| Set `APP_ORIGIN` | Your frontend domain |
| Proxy `/api` → API process | nginx, Caddy, or platform proxy |
| SPA fallback | All routes → `index.html` |

Platforms: **Render**, **Railway**, **Fly.io**, **AWS EC2**, **DigitalOcean App Platform**, **Vercel** (frontend) + **Railway** (API + PostgreSQL).

---

## Updating Static Content

Content can be updated two ways:

**1. Edit source files** (no backend needed):

| Content | File |
|---------|------|
| Brand, phone, email, stats | `src/data/siteConfig.ts` |
| Courses | `src/data/courses.ts` + `src/data/publicCourseCatalog.ts` |
| Master programs | `src/data/masterPrograms.ts` |
| Categories | `src/data/categories.ts` |
| Instructors | `src/data/instructors.ts` |
| Locations | `src/data/locations.ts` |
| Internships | `src/data/internships.ts` |
| Blog posts | `src/data/blogs.ts` |
| FAQs | `src/data/faqs.ts` |
| Testimonials | `src/data/testimonials.ts` |

**2. Use Admin → Content Studio** (`/admin/studio`) — edits are stored in the database and override static data on the live site without a rebuild.

---

## Security

- No secrets in `VITE_` variables (all bundled into browser)
- Admin sessions use HttpOnly, SameSite=Strict cookies — no token in localStorage
- Passwords hashed with bcryptjs
- All `/api/admin` routes require server-side session + role check
- Zod validation on all forms (client + server)
- Rate limiting on auth endpoints (express-rate-limit)
- Security headers via helmet

---

*Global Minds Academy — Chennai, Tamil Nadu, India · globalmindsacademy.in*
