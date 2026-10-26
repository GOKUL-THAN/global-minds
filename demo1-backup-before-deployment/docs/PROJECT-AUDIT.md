# Global Academy — Project Audit (Superseded Snapshot)

> **This document is an older snapshot and is not the current audit.** Its
> implementation claims predate the present auth/session/RBAC and CMS changes.
> Use [PHASE-1-AUDIT.md](./PHASE-1-AUDIT.md) for the current verified findings
> and [API.md](./API.md) for the current API contract. Do not use the historical
> status tables below as evidence of current behavior.

**Date:** October 2026  
**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + React Router v6  
**Build status:** ✅ Frontend TypeScript/build · ✅ Frontend lint · ✅ Backend TypeScript build

---

## Architecture Summary

**React SPA with an Express API.** Local development uses `sql.js` with a SQLite file; production is configured to require PostgreSQL through the `pg` adapter. A versioned migration runner is now used by both adapters. The backend exposes admin authentication, public/admin CMS content, enquiries, newsletter subscriptions, and student registration in pending-verification state. Public catalogue pages still combine local seed data with published CMS overlays. Most LMS and operational admin modules remain demo-only. See [API.md](./API.md) for the endpoint inventory and contract.

---

## Complete File Inventory

```
src/
  App.tsx               – Router (45+ routes)
  components/
    admin/              – AdminLayout (full sidebar + top bar)
    courses/            – CourseCard (grid + list layouts)
    home/               – 9 homepage sections
    layout/             – Navbar (mega menu, 10 categories), Footer, AnnouncementBar, Layout, BackToTop
    ui/                 – Button, Badge, Breadcrumbs, EnquiryForm, FAQAccordion,
                          LazyImage, Modal, StarRating, Toast, BackToTop
  data/
    siteConfig.ts       – Brand, contact, SEO, stats, countries, currencies
    courses.ts          – 17 fully-detailed courses + merge with extra
    coursesExtra.ts     – 46 additional courses (all categories covered)
    categories.ts       – 14 categories
    masterPrograms.ts   – 8 master programs
    instructors.ts      – 6 trainer profiles
    locations.ts        – 5 locations
    internships.ts      – 6 internship listings
    blogs.ts            – 6 blog posts
    faqs.ts             – 12 FAQs
    testimonials.ts     – 8 testimonials
  hooks/
    useCountUp.ts
    useIntersection.ts
    usePageMeta.ts      – Dynamic title/meta/OG per page
  pages/
    HomePage.tsx
    CategoryPage.tsx
    CertificationsPage.tsx
    ClassroomTrainingPage.tsx
    ContactPage.tsx
    CorporateTrainingPage.tsx
    InternshipsPage.tsx – WITH search + filter
    NotFoundPage.tsx
    OnlineTrainingPage.tsx
    RegisterPage.tsx
    TrainersPage.tsx    – NEW
    admin/              – 13 admin pages
    auth/               – LoginPage
    blog/               – BlogPage, BlogDetailPage
    career/             – CareerPage, JobSupportPage, InterviewPrepPage,
                          ResumePrepPage, MockInterviewPage
    courses/            – CoursesPage (search/filter), CourseDetailPage
    dashboard/          – DashboardPage (full with 11 sections)
    internships/        – InternshipDetailPage
    legal/              – PrivacyPolicy, Terms, RefundPolicy, CookiePolicy
    locations/          – LocationsPage, LocationDetailPage
    master-programs/    – MasterProgramsPage, MasterProgramDetailPage
  services/             – authService, courseService, enquiryService, paymentService
  types/index.ts        – All TypeScript types
  utils/                – cn, formatters, structuredData
public/
  favicon.svg
  robots.txt
  sitemap.xml
docs/
  PROJECT-AUDIT.md
README.md
.env.example
```

---

## ✅ Fully Implemented

| Feature | Details |
|---------|---------|
| Vite + React + TypeScript | ✅ |
| Tailwind CSS design system | ✅ Full custom design tokens |
| siteConfig (global config) | ✅ All business data centralised |
| TypeScript types (all) | ✅ |
| Services layer | ✅ Auth, CMS, enquiries, and newsletter use API; payment/OTP/recovery are unavailable until provider integrations exist |
| Navbar + MegaMenu | ✅ 10 categories, all courses listed |
| Announcement bar | ✅ |
| Footer (full) | ✅ All sections + newsletter |
| Back-to-top button | ✅ |
| Skip-to-content (a11y) | ✅ |
| Homepage | ✅ 21 sections |
| /courses | ✅ Search + filter + sort + grid/list |
| /courses/:slug | ✅ Full detail page, sticky panel |
| /categories/:slug | ✅ |
| /master-programs | ✅ |
| /master-programs/:slug | ✅ Full detail |
| /online-training | ✅ |
| /classroom-training | ✅ |
| /certifications | ✅ |
| /career | ✅ |
| /placement | ✅ (alias for /career) |
| /career/job-support | ✅ NEW |
| /career/interview-preparation | ✅ NEW |
| /career/resume-preparation | ✅ NEW |
| /career/mock-interview | ✅ NEW (with booking form) |
| /internships | ✅ Search + filter |
| /internships/:slug | ✅ NEW |
| /corporate-training | ✅ With validated form |
| /trainers | ✅ NEW |
| /about | ✅ |
| /contact | ✅ With validated form |
| /blog | ✅ |
| /blog/:slug | ✅ NEW |
| /locations | ✅ |
| /locations/:slug | ✅ NEW |
| /register | ✅ Creates a student account pending email verification |
| /login | ✅ Admin login; student login is blocked until verified |
| /dashboard | ✅ Student-only authenticated account page; LMS data not connected |
| /admin | ✅ NEW — full sidebar layout |
| /admin/courses | ✅ NEW — searchable table |
| /admin/categories | ✅ NEW |
| /admin/master-programs | ✅ NEW |
| /admin/students | ✅ NEW (API-ready stub) |
| /admin/instructors | ✅ NEW — card grid |
| /admin/enquiries | ✅ Reads live enquiries and persists status/assignment/notes/follow-up updates |
| /admin/internships | ✅ NEW — table |
| /admin/batches | ✅ NEW (stub) |
| /admin/locations | ✅ NEW — card grid |
| /admin/blog | ✅ NEW — table |
| /admin/faqs | ✅ NEW — accordion |
| /admin/testimonials | ✅ NEW (stub) |
| /admin/certificates | ✅ NEW (stub) |
| /admin/payments | ✅ NEW (stub) |
| /admin/settings | ✅ NEW — read-only siteConfig view |
| /checkout | ✅ |
| /payment-success | ✅ |
| /payment-failed | ✅ |
| /privacy-policy | ✅ |
| /terms | ✅ |
| /refund-policy | ✅ |
| /cookie-policy | ✅ |
| Course catalog: 63 courses | ✅ All categories covered |
| Master programs: 8 | ✅ |
| Trainer profiles: 6 | ✅ |
| Locations: 5 | ✅ |
| Internships: 6 | ✅ |
| Blog posts: 6 | ✅ |
| SEO (usePageMeta) | ✅ All major pages |
| Structured data (JSON-LD) | ✅ Org, Course, FAQ, Breadcrumb |
| sitemap.xml | ✅ |
| robots.txt | ✅ |
| LazyImage | ✅ |
| EnquiryForm (Zod validation) | ✅ |
| FAQAccordion | ✅ |
| README.md | ✅ |

---

## ⚠️ Remaining Limitations

| Item | Status |
|------|--------|
| Backend API | Partial — see [API.md](./API.md) for implemented and missing routes |
| Student account verification | Accounts persist as unverified; email provider and verification flow are not configured |
| LMS operations | Enrollment, progress, lesson, quiz, assignment, and certificate APIs are absent |
| Admin operations | CMS and enquiries are connected; most other admin screens remain mock/read-only |
| Payment processing | No checkout API or provider configured; mock order/verification results removed |
| Email/SMS notifications | Not configured |
| Google OAuth login | Architecture ready, client ID needed |
| Real testimonials | Using demo data — must replace with real reviews |
| Real statistics | Using placeholder numbers — verify before launch |
| Real business info | Phone, email, address all placeholder |
| Legal pages | Placeholder — must be reviewed by legal counsel |
| Course content | All placeholder — replace with real descriptions/prices |

---

## Security Status

- ✅ No secret keys in frontend code
- ✅ `.env.example` documents public/private variable split
- ✅ Zod validation on all forms
- ✅ Input sanitised at service layer
- ✅ VITE_ prefix only for public browser variables
- ✅ Admin endpoints require an active admin session; CMS permanent deletion requires `SUPER_ADMIN`
- ✅ Public CMS routes reject internal sections
- ⚠️ Logout clears the browser cookie but does not revoke an already copied JWT
- ⚠️ Student email verification, password recovery, and role/permission management are not implemented

---

## Performance (Build Output)

| Chunk | Size | Gzipped |
|-------|------|---------|
| vendor (React, Router) | 207 KB | 68 KB |
| forms (RHF, Zod) | 86 KB | 24 KB |
| animations | 0.9 KB | 0.6 KB |
| index (app) | ~1,014 KB | ~233 KB |
| CSS | ~82 KB | ~13 KB |

- Build warns that the main app chunk exceeds 500 KB; further code splitting is recommended
- Lazy images via IntersectionObserver ✅  
- prefers-reduced-motion respected ✅
