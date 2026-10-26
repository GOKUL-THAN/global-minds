# Global Minds Academy

**"Learn. Build. Certify. Grow Globally."**

A full-featured IT training and career development platform covering cloud computing, DevOps, AI/ML, data science, full stack development, software testing, cyber security, and more. Built with React 18 + TypeScript, backed by an Express API with SQLite (dev) and PostgreSQL (production).

---

## Features

- 🎓 **Rich Course Catalog** — Cloud, DevOps, AI/ML, Full Stack, Data, Testing, Security, Mobile, Database, Design, Networking, and more
- 📚 **Master Programs** — structured multi-course learning paths (Freshers, Full Stack, AI & ML, Data Science & BI, Software Testing)
- 🏫 **Colleges & Universities** — institutional partnership page with MoU, campus recruitment and student programs
- 🏢 **Corporate Training** — customised enterprise training enquiry with form submission
- 💼 **Career Platform** — placement records, interview prep, resume prep, mock interviews, job support
- 🔬 **Internships** — listings with detail pages and search/filter
- 📝 **Blog** — tech insights and career guides
- 📍 **Locations** — training centre locations with detail pages
- 🔐 **Admin Portal** — full CRUD admin panel with role-based access (Super Admin, Admin, Content Manager, Trainer)
- 📣 **Announcements** — admin-managed student announcements on the dashboard
- 🎓 **Student Portal** — dashboard, enrollments, attendance, certificates, announcements
- 🔍 **Search & Filter** — redesigned courses page with category chips, multi-select filters and layout toggle
- 📱 **Fully Responsive** — mobile-first, works 320 px – 1920 px
- ♿ **Accessible** — WCAG-oriented, keyboard navigation, skip links, ARIA roles
- 🔍 **SEO-Ready** — structured data, dynamic meta tags, sitemap

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Routing | React Router v6 |
| Styling | Tailwind CSS 3 |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion + CSS animations |
| Icons | Lucide React |
| Utilities | clsx + tailwind-merge |
| Auth API | Node.js + TypeScript + Express |
| Local database | SQLite (sql.js) |
| Production database | PostgreSQL (`pg`) |
| Email | Resend (optional — required for self-registration) |

---

## Project Structure

```
demo1/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── package.json
├── tsconfig.json
│
├── public/
│   ├── favicon.svg
│   └── images/
│       ├── courses/              # 175 course thumbnail images (.jpg)
│       └── certification-vendors/
│
├── src/
│   ├── App.tsx                   # Router — all public + admin routes
│   ├── main.tsx                  # Entry point
│   ├── index.css                 # Tailwind base + design tokens
│   │
│   ├── components/
│   │   ├── admin/                # AdminLayout, AdminAuthGate
│   │   ├── blog/
│   │   ├── career/
│   │   ├── corporate/
│   │   ├── courses/              # CourseCard, filters
│   │   ├── home/                 # HeroSection, StatsSection, FeaturedCourses,
│   │   │                         # PopularCategories, CTASection, WhyUsSection, etc.
│   │   ├── layout/               # Navbar (mega menu + More ▾ dropdown), Footer,
│   │   │                         # AnnouncementBar, Layout
│   │   ├── master-programs/
│   │   └── ui/                   # Button, Badge, Modal, Toast, Breadcrumbs,
│   │                             # FAQAccordion, StarRating, LazyImage, etc.
│   │
│   ├── data/                     # Static seed / fallback data
│   │   ├── siteConfig.ts         # Brand name, phone, email, SEO defaults
│   │   ├── courses.ts
│   │   ├── masterPrograms.ts
│   │   ├── categories.ts
│   │   ├── instructors.ts
│   │   ├── locations.ts
│   │   ├── internships.ts
│   │   ├── blogs.ts
│   │   ├── faqs.ts
│   │   ├── testimonials.ts
│   │   ├── navigationMenu.ts
│   │   ├── publicCourseCatalog.ts
│   │   ├── cmsSeeds.ts
│   │   └── adminMockData.ts
│   │
│   ├── hooks/
│   │   ├── useCourseCatalog.ts   # Loads courses via courseService (CMS)
│   │   ├── useCmsCollection.ts   # Generic CMS collection hook
│   │   ├── usePageMeta.ts        # Dynamic <title> + meta description
│   │   ├── useCountUp.ts         # Animated number counter
│   │   └── useIntersection.ts   # Intersection Observer hook
│   │
│   ├── services/
│   │   ├── authService.ts        # Login, register, session, password reset
│   │   ├── courseService.ts      # Course catalog (CMS + static fallback)
│   │   ├── cmsService.ts         # Full CMS CRUD (admin)
│   │   ├── enquiryService.ts     # Course, contact, corporate & college enquiries
│   │   └── paymentService.ts    # Payment placeholder
│   │
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── CoursesPage.tsx       # Redesigned search + filter UI
│   │   ├── CategoryPage.tsx
│   │   ├── CertificationsPage.tsx
│   │   ├── CertificateViewPage.tsx
│   │   ├── ClassroomTrainingPage.tsx
│   │   ├── OnlineTrainingPage.tsx
│   │   ├── CollegesPage.tsx
│   │   ├── CorporateTrainingPage.tsx
│   │   ├── PlacementPage.tsx
│   │   ├── BatchSchedulePage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── InternshipsPage.tsx
│   │   ├── TrainersPage.tsx
│   │   ├── LiveProjectsPage.tsx
│   │   ├── DemoClassPage.tsx
│   │   ├── SkillAssessmentPage.tsx
│   │   ├── ScholarshipPage.tsx
│   │   ├── ReferEarnPage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── courses/              # CourseDetailPage, MasterPrograms, etc.
│   │   ├── master-programs/
│   │   ├── blog/                 # BlogPage, BlogDetailPage
│   │   ├── locations/            # LocationsPage, LocationDetailPage
│   │   ├── internships/          # InternshipDetailPage
│   │   ├── career/               # CareerPage, JobSupport, InterviewPrep,
│   │   │                         # ResumePrep, MockInterview
│   │   ├── auth/                 # LoginPage, AccountRecovery
│   │   ├── dashboard/            # StudentDashboardPage
│   │   ├── legal/                # Privacy, Terms, Refund, Cookie
│   │   └── admin/                # 19 admin pages (see Admin section below)
│   │
│   ├── types/                    # TypeScript interfaces (Course, MasterProgram,
│   │                             # User, FAQ, Testimonial, BlogPost, etc.)
│   └── utils/                    # cn(), formatters, structuredData
│
└── server/                       # Express API (separate process)
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── .env                      # ⚠ NOT committed — copy from .env.example
    ├── data/
    │   └── course-catalog.seed.json
    └── src/
        ├── index.ts              # All API routes
        ├── auth.ts               # Session helpers, permission middleware
        ├── config.ts             # Env-validated config
        ├── database.ts           # SQLite / PostgreSQL abstraction
        ├── db.ts                 # All database queries
        ├── email.ts              # Resend email helper
        └── migrations.ts        # Versioned schema migrations (001–008+)
```

---

## Local Setup

### Prerequisites

- **Node.js 20+** — `node --version`
- **npm 10+** — `npm --version`
- **PowerShell** (Windows) or any Unix shell

### 1. Install dependencies

Run from the project root (`demo1/`):

```powershell
npm install
npm --prefix server install
```

### 2. Configure the backend

```powershell
Copy-Item server\.env.example server\.env
```

Open `server/.env` and set at least these three values — never leave them as placeholders:

```
JWT_SECRET=<at-least-32-random-characters>
ADMIN_PASSWORD=<unique-password-min-14-chars>
SUPER_ADMIN_PASSWORD=<different-unique-password-min-14-chars>
```

### 3. Start in development mode

Open two terminals from the project root:

**Terminal 1 — API (port 3001):**
```powershell
npm run dev:api
```

**Terminal 2 — Frontend (port 5173):**
```powershell
npm run dev
```

Open `http://localhost:5173` in your browser.

> The API applies all pending database migrations automatically on startup. On first run it creates the Super Admin (`globalminds@gmail.com`) and Admin (`admin@local.test`) accounts using the passwords from `server/.env`.

### 4. Admin portal

Visit `http://localhost:5173/admin/login` and sign in with:

| Account | Email | Password source |
|---------|-------|----------------|
| Super Admin | `globalminds@gmail.com` | `SUPER_ADMIN_PASSWORD` in `server/.env` |
| Admin | `admin@local.test` | `ADMIN_PASSWORD` in `server/.env` |

**Important notes:**
- The API must be running for login and any admin operation. An API outage never grants demo access.
- Bootstrap passwords are applied only when the account is **first created**. Changing the password in `server/.env` after the database already exists has no effect — use the Admin Portal's user management to change passwords.
- Student accounts provisioned by an administrator are activated immediately; provide their initial passwords through a secure channel.

---

## Build Commands

```bash
npm run dev           # Development server (Vite HMR) at :5173
npm run dev:host      # Dev server exposed on LAN (0.0.0.0:3000)
npm run build         # TypeScript check + Vite production build → /dist
npm run preview       # Preview production build (0.0.0.0:3000)
npm run lint          # ESLint (zero warnings enforced)
npm run serve         # Serve /dist locally
npm run dev:api       # Start Express API in dev mode (tsx watch)
npm run build:api     # Compile Express API with tsc → server/dist/
```

---

## Public Routes

| Route | Page |
|-------|------|
| `/` | Homepage |
| `/courses` | Course catalog — search, filter, grid/list toggle |
| `/courses/:slug` | Course detail |
| `/categories/:slug` | Category course listing |
| `/master-programs` | Master programs listing |
| `/master-programs/:slug` | Master program detail |
| `/online-training` | Online training overview |
| `/classroom-training` | Classroom training overview |
| `/certifications` | Certifications overview |
| `/corporate-training` | Corporate training + enquiry form |
| `/colleges` | College partnerships + enquiry form |
| `/placement-records` | Placement records |
| `/batch-schedule` | Upcoming batch schedule |
| `/demo-class` | Free demo class booking |
| `/skill-assessment` | Skill assessment |
| `/scholarships` | Scholarship programs |
| `/events` | Events & webinars |
| `/live-projects` | Live project training |
| `/refer-earn` | Refer & earn program |
| `/career` | Career support hub |
| `/career/interview-preparation` | Interview preparation |
| `/career/resume-preparation` | Resume preparation |
| `/career/mock-interview` | Mock interview booking |
| `/career/job-support` | Job search support |
| `/internships` | Internship listings |
| `/internships/:slug` | Internship detail |
| `/trainers` | Expert trainers |
| `/about` | About Global Minds Academy |
| `/contact` | Contact form |
| `/blog` | Blog listing |
| `/blog/:slug` | Blog post detail |
| `/locations` | Training centres |
| `/locations/:slug` | Location detail |
| `/register` | Student registration |
| `/login` | Student / admin login |
| `/dashboard` | Student dashboard (auth required) |
| `/verify-email` | Email verification callback |
| `/reset-password` | Password reset callback |
| `/privacy-policy` | Privacy policy |
| `/terms` | Terms of service |
| `/refund-policy` | Refund policy |
| `/cookie-policy` | Cookie policy |

---

## Admin Routes

All routes under `/admin` are protected by `AdminAuthGate`. The authentication API must be available; an API outage never grants demo access. Roles with access: `ADMIN`, `SUPER_ADMIN`, `CONTENT_MANAGER`, `TRAINER`.

| Route | Page |
|-------|------|
| `/admin` | Dashboard overview |
| `/admin/courses` | Courses — Add/Edit/Publish/Unpublish/Archive |
| `/admin/master-programs` | Master Programs — Add/Edit/Hide/Delete |
| `/admin/categories` | Categories — Add/Edit/Delete |
| `/admin/blog` | Blog Posts — Add/Edit/Publish/Unpublish/Delete |
| `/admin/faqs` | FAQs — Add/Edit/Hide/Delete |
| `/admin/testimonials` | Testimonials — Add/Edit/Feature toggle/Hide/Delete |
| `/admin/navigation` | Navigation Menu — Add/Edit/Reorder/Hide/Delete |
| `/admin/instructors` | Instructors — Add/Edit/Hide/Delete |
| `/admin/internships` | Internships — Add/Edit/Delete |
| `/admin/locations` | Locations — Add/Edit/Hide/Delete |
| `/admin/studio` | Content Studio — full CMS editor |
| `/admin/settings` | Site settings |
| `/admin/students` | Students — view/filter |
| `/admin/student-progress` | Student progress |
| `/admin/attendance` | Attendance |
| `/admin/enquiries` | Enquiries — view/update status |
| `/admin/batches` | Batches |
| `/admin/certificates` | Certificates |
| `/admin/payments` | Payments |
| `/admin/activity` | Audit/activity log |
| `/admin/announcements` | Student announcements — Add/Edit/Publish |
| `/admin/users` | User & role management (Super Admin only) |

---

## Navigation Bar

The navbar uses a **split primary + More ▾** pattern:

**Primary links (always visible):**
Courses ▾ (mega menu) · Master Programs · Certifications · Placement · Corporate · Colleges ▾

**More ▾ dropdown:**
Batch Schedule · Events · About · Blog · Contact · Trainers · Internships · Scholarships

Both **Courses** and **Colleges** have full corporate-style mega menus:
- **Courses mega menu** — 12 topic sections (Cloud, DevOps, AI, Full Stack, Data, Testing, Security, Programming, Mobile, Database, Design, Networking) with a live subtopic panel
- **Colleges mega menu** — 4 sections (College Partnerships, Campus Recruitment, Training for Students, Faculty Development) with quick-links panel

---

## Enquiry Forms

All enquiry forms submit to `/api/enquiries` via `enquiryService`:

| Form | Source tag | Key fields |
|------|-----------|------------|
| Course enquiry | `Website Form` | Name, email, phone, course, mode |
| Contact page | `Contact Page` | Name, email, subject, message |
| Corporate training | `Corporate Training Form` | Company, team size, technologies, mode |
| College / university | `College Enquiry Form` | Institution, designation, enquiry type, programs |

---

## Admin Operational Modules

Student, batch, attendance, internship/application, certificate, and activity history data use versioned database migrations (`007_operational_modules` and later). Admin overview statistics use `GET /api/admin/operations/summary`; Super Admin database health uses `GET /api/admin/system/health`. The admin dashboard checks `/api/admin/operations/status` against the schema before showing module readiness. Admin APIs are session- and permission-protected; audit history is append-only through the API.

Certificates can be verified publicly at `/api/certificates/verify/:certificateId`.

---

## Student Portal

Students sign in at `/login` and are redirected to `/dashboard`. The dashboard loads the authenticated student's profile, enrollments, assigned batches, attendance, internship applications, active certificates, account activity, and published announcements from `/api/student/dashboard`. Profile edits are limited to permitted fields at `PATCH /api/student/profile`. Administrators manage enrollments at `GET/POST /api/admin/students/:id/enrollments` and `PATCH /api/admin/enrollments/:id`. Student announcements are managed with `GET/POST /api/admin/announcements` and `PATCH /api/admin/announcements/:id`.

---

## Super Admin — User & Role Management

Super Admins access `/admin/users` to create accounts, activate/deactivate them, assign roles, and edit role permissions.

| Operation | Endpoint |
|-----------|---------|
| List / create accounts | `GET/POST /api/admin/users` |
| Update an account | `PATCH /api/admin/users/:id` |
| List roles / permissions | `GET /api/admin/roles`, `GET /api/admin/permissions` |
| Update role permissions | `PUT /api/admin/roles/:role/permissions` |

The server prevents non-Super Admins from creating or assigning privileged roles and protects the Super Admin role's permissions.

---

## Admin CRUD API Reference

| Module | Endpoints |
|--------|-----------|
| Students | `GET/POST /api/admin/students`, `GET/PATCH/DELETE /api/admin/students/:id`, `POST /:id/archive`, `POST /:id/restore` |
| Batches | `GET/POST /api/admin/batches`, `GET/PATCH/DELETE /api/admin/batches/:id`, `PUT /:id/students`, `PUT /:id/trainers`, `POST /:id/archive` |
| Attendance | `GET /api/admin/attendance`, `PUT /api/admin/attendance`, `PATCH /api/admin/attendance/:id`, `GET /api/admin/attendance/report` |
| Internships | `GET/POST /api/admin/internships`, `GET/PATCH/DELETE /api/admin/internships/:id`, plus application management under `/api/admin/internships/applications` |
| Audit history | `GET /api/admin/audit-logs` (read-only) |
| Certificates | `GET/POST /api/admin/certificates`, `POST /api/admin/certificates/:id/revoke`, public verify at `/api/certificates/verify/:certificateId` |
| Announcements | `GET/POST /api/admin/announcements`, `PATCH /api/admin/announcements/:id` |

---

## CMS API

The Content Studio is backed by a full CMS API. Records are keyed by `(section, slug)`.

| Method + Path | Purpose |
|---------------|---------|
| `GET /api/content/:section` | Public published records |
| `GET /api/content/:section/:slug` | Single published record |
| `GET /api/admin/content/:section` | Admin list (all statuses) |
| `POST /api/admin/content/:section` | Create draft |
| `PUT /api/admin/content/:section/:slug` | Update as draft |
| `POST /api/admin/content/:section/:slug/publish` | Publish |
| `POST /api/admin/content/:section/:slug/unpublish` | Unpublish |
| `POST /api/admin/content/:section/:slug/archive` | Archive |
| `POST /api/admin/content/:section/:slug/restore` | Restore |
| `DELETE /api/admin/content/:section/:slug` | Delete (SUPER_ADMIN only) |

---

## Environment Variables

### Frontend (`.env` at project root)

| Variable | Description | Browser-safe |
|----------|-------------|--------------|
| `VITE_APP_NAME` | Application display name | ✅ |
| `VITE_API_BASE_URL` | Backend API base URL | ✅ |
| `VITE_RAZORPAY_KEY` | Razorpay public key | ✅ |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key | ✅ |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ |

⚠️ **Never** put secrets (Razorpay secret, Stripe secret, DB passwords) in `VITE_` variables — they will be exposed in the browser bundle.

### Backend (`server/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | `development` or `production` |
| `PORT` | `3001` | API listening port |
| `APP_ORIGIN` | `http://localhost:5173` | Exact frontend origin for CORS |
| `DATABASE_DRIVER` | `sqlite` | `sqlite` (dev) or `postgres` (production) |
| `DATABASE_PATH` | `data/admin.sqlite` | SQLite file path (dev only) |
| `DATABASE_URL` | — | PostgreSQL connection string (production) |
| `JWT_SECRET` | **required** | Session signing key — min 32 bytes, keep private |
| `ADMIN_EMAIL` | `admin@local.test` | Admin account email |
| `ADMIN_PASSWORD` | **required** | Password for the admin account |
| `SUPER_ADMIN_EMAIL` | `globalminds@gmail.com` | Super admin account email |
| `SUPER_ADMIN_PASSWORD` | **required** | Password for the super admin account |
| `RESEND_API_KEY` | optional | Enables email verification + password recovery |
| `EMAIL_FROM` | optional | Sender address shown in account emails |

---

## Deployment

The frontend builds to `/dist` (static files). The backend is a separate Express process.

```bash
npm run build        # builds frontend to /dist
npm run build:api    # compiles Express API to server/dist/
```

| Platform | Method |
|----------|--------|
| Vercel | `vercel deploy` |
| Netlify | drag-and-drop `/dist` or `netlify deploy` |
| AWS S3 + CloudFront | sync `/dist` to bucket |
| VPS / Docker | serve `/dist` + run compiled API (`node server/dist/index.js`) |

Configure your host to redirect all routes to `index.html` for SPA routing. In production set `DATABASE_DRIVER=postgres` and a private `DATABASE_URL`; the server refuses to start in production with SQLite.

---

## Updating Content

All business content lives in `src/data/`. No component edits needed for basic updates:

| What to update | File |
|----------------|------|
| Brand name, phone, email, address | `src/data/siteConfig.ts` |
| Courses | `src/data/courses.ts` |
| Master programs | `src/data/masterPrograms.ts` |
| Categories | `src/data/categories.ts` |
| Trainer profiles | `src/data/instructors.ts` |
| Locations | `src/data/locations.ts` |
| Internships | `src/data/internships.ts` |
| Blog posts | `src/data/blogs.ts` |
| FAQs | `src/data/faqs.ts` |
| Testimonials | `src/data/testimonials.ts` |

Alternatively, Super Admins can manage all of the above through the **Admin Portal** (`/admin`) without editing source code. Changes made through the portal are written to the database and reflected on the live site immediately.

---

## Security Notes

- No secrets stored in `VITE_` variables
- All forms validated with Zod (client) + Express middleware (server)
- Admin sessions use HttpOnly, SameSite=Strict cookies — no token in localStorage
- Passwords hashed with bcrypt (cost factor 12); minimum entropy enforced at account creation
- All `/api/admin` routes require server-side session + role check
- Enquiry and auth endpoints are rate-limited (15 min / 1 hr windows)
- Payment secrets remain server-side only; Razorpay/Stripe public keys are safe to expose

---

## Troubleshooting

### API won't start

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Cannot find module '…/config.js'` | API not built | Run `npm --prefix server install` then `npm run dev:api` |
| `Error: JWT_SECRET is not set` | Missing env var | Copy `server/.env.example` → `server/.env` and set `JWT_SECRET` |
| `Error: ADMIN_PASSWORD` / `SUPER_ADMIN_PASSWORD is not set` | Missing env var | Set both passwords in `server/.env` |
| `EADDRINUSE :::3001` | Port already in use | Kill the other process or change `PORT` in `server/.env` |
| `SQLITE_CANTOPEN` / `no such file` | Database directory missing | The `server/data/` folder must exist. Create it: `New-Item -ItemType Directory -Path server\data` |

### Frontend won't start

| Symptom | Cause | Fix |
|---------|-------|-----|
| `sh: vite: command not found` | Dependencies not installed | Run `npm install` from the project root |
| `EADDRINUSE :::5173` | Port in use | Vite auto-selects the next free port; check terminal output |
| Blank page / white screen | Build error or missing `.env` | Check browser console; create a root `.env` from `.env.example` |

### Login / admin access issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Invalid email or password" for bootstrap accounts | API started before `server/.env` was set | Delete `server/data/admin.sqlite`, update `.env`, restart `npm run dev:api` |
| Changing `server/.env` password doesn't work | Accounts already seeded | Use Admin Portal (`/admin/users`) to change the password, or delete the SQLite file and restart |
| "Origin not allowed" (403) | `APP_ORIGIN` mismatch | Make sure `APP_ORIGIN` in `server/.env` matches the exact URL the frontend runs on (e.g. `http://localhost:5173`) |
| Admin portal shows "API unavailable" | API not running | Start `npm run dev:api` in a separate terminal |
| Email verification required but no email arrives | `RESEND_API_KEY` not configured | Set `RESEND_API_KEY` and `EMAIL_FROM` in `server/.env`, or have an admin provision the account manually |

### Build errors

| Symptom | Cause | Fix |
|---------|-------|-----|
| TypeScript errors during `npm run build` | Type mismatches | Run `npx tsc --noEmit` to see all errors; fix before building |
| ESLint max-warnings exceeded | Lint violations | Run `npm run lint` to see violations; fix or review before deploying |
| `vite build` succeeds but routes return 404 on deployment | SPA routing not configured | Configure your host to rewrite all paths to `index.html` |

### Database migration errors

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Cannot migrate duplicate legacy identity email` | Duplicate emails in the old schema | Inspect `server/data/admin.sqlite` with any SQLite browser and remove duplicates |
| Migration `005` fails with seed file not found | `server/data/course-catalog.seed.json` missing | Restore the file from source control (`git checkout server/data/`) |
| PostgreSQL `ECONNREFUSED` in production | Database unreachable | Check `DATABASE_URL` and that the PostgreSQL service is running and accessible |

### Student portal issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Dashboard shows no enrollments | Admin hasn't enrolled the student | Admin adds enrollments at `/admin/students/:id` |
| Student can't log in (verified account) | Account deactivated | Admin reactivates at `/admin/users` |
| Certificate page blank | Certificate not yet issued | Admin issues certificate at `/admin/certificates` |

### Common Windows / PowerShell gotchas

```powershell
# Wrong — cmd syntax doesn't work in PowerShell
set NODE_ENV=production && npm run build

# Correct
$env:NODE_ENV="production"; npm run build

# Check if port 3001 is in use
netstat -ano | Select-String ":3001"

# Kill a process by PID (replace 12345)
Stop-Process -Id 12345 -Force

# Create missing server/data directory
New-Item -ItemType Directory -Path "server\data" -Force
```

---

*Global Minds Academy — Replace placeholder content (prices, bios, testimonials, stats, phone numbers, legal text) with real information before public launch.*
