# Phase 1 — System Audit & Foundation

**Audit date:** 2026-10-08  
**Scope:** Existing Global Minds Academy application in this workspace. This
report covers Phase 1 only; it does not implement or approve later phases.

## Executive summary

The repository contains a React/Vite website and an Express API with a
versioned SQL migration system. A substantial identity foundation is present:
hashed passwords, server-backed revocable sessions, five database roles,
permission checks on protected APIs, account verification/recovery flows, and
rate limits. CMS drafts, publishing, archiving, and course module/lesson
persistence are also implemented.

This is **not a complete LMS or production-ready training platform**. Several
admin dashboards and public content pages still use static/demo data; enrollment,
learning progress, batch scheduling, trainer assignments, payments, and file
uploads do not have complete persistent API workflows. The frontend and server
build cleanly, but current automated tests cover the database layer rather than
the complete browser-to-API flow.

No critical build/type/lint failure was found in this audit. Existing documentation
had stale API and course-fallback descriptions; `README.md` and `docs/API.md`
were corrected as part of this phase. No application behavior or stored data
was changed.

## 1. Current architecture

- **Frontend:** React 18 + TypeScript, Vite, React Router v6, Tailwind CSS.
  `src/App.tsx` owns public, account, student, and admin route trees.
- **Backend:** TypeScript/Express in `server/src/index.ts`. During development,
  Vite proxies `/api` to the API service. Production must route the same-origin
  `/api` path to the backend.
- **Persistence:** `server/src/database.ts` abstracts SQL.js/SQLite for local
  use and PostgreSQL (`pg`) for production. `server/src/migrations.ts` applies
  ordered migrations. The production configuration rejects SQLite.
- **Frontend state/data:** component-local React state and effects; hooks for
  shared CMS collection and page metadata behavior. There is no application-wide
  state store.
- **Forms/validation:** React Hook Form and Zod are installed and used by public
  forms. The API independently validates request data; not every CMS section
  has section-specific validation or a dedicated editor.
- **Files:** no file upload/storage API or object-storage integration was found.
  Course records currently store URL-like media fields, not uploaded assets.

## 2. Existing features

- Public website pages, course catalog/search, master programs, internships,
  blog, locations, career content, contact/enquiry forms, and newsletter signup.
- Registration, email verification, login, password recovery/reset/change,
  session inventory/revocation, and role/permission APIs.
- CMS generic record lifecycle: draft, publish, archive, restore, and
  super-admin-only permanent deletion.
- Course content validation and ordered course module/lesson persistence.
- Enquiries and newsletter subscriptions are persisted; admin enquiry listing
  and updates use the API.
- Other public content pages selectively merge published CMS records with
  built-in records.

## 3. Existing database models

The migrations define:

- Legacy compatibility tables: `admin_users`, `student_users`.
- Public/business records: `enquiries`, `newsletter_subscribers`.
- CMS: `cms_records` with `(section, slug)` uniqueness and draft/published/
  archived content.
- Identity/RBAC: `users`, `roles`, `permissions`, `user_roles`,
  `role_permissions`, `student_profiles`.
- Authentication/security: `sessions`, `email_verification_tokens`,
  `password_reset_tokens`, `audit_logs`.
- Course hierarchy: `course_modules`, `course_lessons`, with ordering,
  status, and course/module foreign keys.
- Migration tracking: `schema_migrations`.

There are no persistent enrollment, lesson-progress, batch/student assignment,
attendance, trainer assignment, quiz, assignment, payment, or notification
tables in the current schema.

## 4. Existing APIs

The current Express route inventory is in [API.md](./API.md). Implemented route
groups include health, registration/login/recovery/session management,
enquiries/newsletter, admin identities/roles/permissions/audit-log reads, and
public/admin CMS. Public CMS access is explicitly allowlisted; it is not enabled
for every registered section. Most sections use `content.*` permissions, while
courses use `courses.*`.

The admin CMS has distinct create (`POST`) and update (`PUT`) operations.
Updates do not create missing records. Course public data still combines CMS
records with the built-in catalog, and falls back to that catalog if its API
request fails.

## 5. Existing authentication

- Passwords are hashed with bcryptjs; one-time verification/reset tokens are
  stored as hashes and have expiry/use checks.
- Login issues a signed JWT in an HttpOnly, SameSite=Strict cookie. The
  associated session and token hash are stored server-side, with expiry and
  revocation checks on protected requests.
- Registration, login, verification, recovery, enquiry, and newsletter routes
  have rate-limit middleware. Email-dependent account flows require configured
  Resend credentials and report delivery/configuration errors.
- Private `/api/admin` routes pass through server-side authentication and
  permission checks. Mutations are guarded by an allowed-origin check.
- No authentication secret values were opened or copied during this audit.
  `.env` files are ignored by Git; use `server/.env.example` for the server
  configuration contract.

## 6. Existing roles

`SUPER_ADMIN`, `ADMIN`, `CONTENT_MANAGER`, `TRAINER`, and `STUDENT` are seeded
as database roles. Backend permissions are loaded from the database rather than
trusted from client-submitted role fields. Role-permission management and
account-management API routes are present. The frontend also hides/routes
admin navigation by role, but this is supplemental to—not a replacement for—
backend enforcement.

## 7. Existing Admin functionality

- **Connected:** CMS course/content records and lifecycle actions; enquiries;
  identity/role APIs (not all have complete admin screens).
- **Generic CMS:** the Content Studio is a JSON-oriented editor for multiple
  section keys. A section being present in the CMS registry does not mean it
  has a purpose-built form, validation, or a public-page integration.
- **Demo/static:** dashboard KPIs/activity, student/batch/attendance/
  certificates/payments and several content admin displays include mock or
  static data. Some screens explicitly label sample data; they must not be
  treated as operational records.

## 8. Missing functionality and critical bugs

No critical compile-time or lint defect was found in this pass. The principal
production-blocking gaps are missing end-to-end features rather than a single
identified runtime crash:

1. No enrollment or student LMS workflow (access control for enrolled course,
   lesson completion, persisted progress, resume learning).
2. No complete batch scheduling, conflict checking, capacity enforcement,
   trainer assignment, or student assignment workflow.
3. No complete trainer portal/data access model or trainer-resource APIs.
4. No payment provider order, webhook, signature verification, or persisted
   transaction flow. Checkout explicitly says payments are unavailable.
5. No file upload or managed asset-storage lifecycle.
6. No server-backed APIs for many operational admin dashboards currently
   rendered from sample data.
7. CMS coverage is incomplete: section IDs and generic JSON CRUD alone do not
   make a CMS feature complete; page rendering, tailored authoring, ordering,
   search/pagination, and validation vary by section.

## 9. Security findings and limitations

- **Positive controls observed:** private admin API middleware, server-side
  permission checks, origin validation on mutations, HttpOnly session cookies,
  hashed credentials/tokens, short-lived revocable sessions, and API input
  validation on the inspected routes.
- **Audit gap:** `audit_logs` records selected authentication, identity, and
  role events, but CMS mutations are not consistently recorded. The activity
  page still uses sample data rather than presenting the backend audit API.
- **Verification gap:** automated tests exercise database behaviors, not
  authenticated HTTP authorization across all roles, routes, and ownership
  boundaries. No live PostgreSQL integration test was run.
- **Rate-limit deployment limitation:** rate limits use the middleware's
  process-local default store. Multi-instance deployments need a shared store
  and proxy/IP configuration review.
- **CMS delivery behavior:** public CMS responses are cached for 60 seconds,
  so updates may not become visible immediately through intermediary caches.
- **Operational truthfulness:** mock dashboard values and built-in catalog
  fallback data can be mistaken for live records if consumers overlook labels
  or the backend is unavailable. The learner dashboard correctly avoids
  showing fake progress but has no LMS data yet.

No confirmed exploitable vulnerability was established from this bounded
foundation audit. The points above are implementation and verification gaps,
not a claim that the entire application has passed a dedicated penetration
test.

## 10. Hardcoded/mock data locations

- `src/data/`: built-in courses, categories, programs, instructors, locations,
  internships, blog posts, FAQs, testimonials, and related site content.
- `src/data/adminMockData.ts`: demonstration students, batches, activity,
  enrollments, and administrative metrics.
- `src/pages/dashboard/DashboardPage.tsx`: legacy demonstration student LMS
  dashboard; `/dashboard` currently uses the account-only
  `StudentDashboardPage.tsx` instead.
- `src/pages/admin/AdminDashboardPage.tsx`, `AdminActivityPage.tsx`,
  `AdminAttendancePage.tsx`, and `AdminBatchesPage.tsx`: mock operational
  statistics/records.
- `src/pages/EventsPage.tsx`, `LiveProjectsPage.tsx`, `ScholarshipPage.tsx`,
  `ReferEarnPage.tsx`, and other non-overlaid pages: static presentation data.
- `src/services/courseService.ts`: intentional built-in course fallback if the
  public CMS API cannot be reached.
- `src/services/paymentService.ts`: explicit unavailable implementation; it
  throws instead of simulating success.

## 11. Recommended implementation order

1. Add HTTP integration tests for auth, role permissions, ownership boundaries,
   CMS CRUD/lifecycle, and error responses; run them against disposable SQLite.
2. Complete the course authoring/publication contract and remove static course
   fallback only when an approved catalog migration/seed strategy exists.
3. Implement enrollment and student-owned LMS progress in the database/API
   before exposing lessons to learners.
4. Implement batches, trainers, scheduling, and attendance with server-side
   conflict/capacity invariants.
5. Replace each mock admin dashboard with real APIs before presenting metrics
   as operational data.
6. Connect remaining CMS sections to dedicated authoring and public rendering;
   add CMS mutation audit records and resolve public-cache invalidation.
7. Add file storage, payment-provider integration, and deployment/integration
   tests only with provider, privacy, and operational requirements defined.

## 12. Validation and status

The following commands were run after the documentation changes:

- `npm run build` — passed (TypeScript check and Vite production build).
- `npm run lint` — passed.
- `npm --prefix server test` — passed (server TypeScript build, 5 database
  tests, and an HTTP auth/CMS integration test).
- Unauthenticated `GET /api/admin/content/courses` against the running local
  API — returned HTTP 401.

No authenticated browser UX audit, PostgreSQL integration run, email-provider
test, or payment test was performed during Phase 1.

**Phase 1 audit: ✅ COMPLETE.** The requested architecture and functionality
inventory is documented, and local build/lint/database-test checks pass.
**Production readiness: ⚠️ NEEDS ATTENTION** because the end-to-end LMS,
operational workflows, and broader integration/security verification remain
incomplete. Phase 2 has since been implemented and verified separately; see
[PHASE-2-AUTH.md](./PHASE-2-AUTH.md). Later phases are not implied complete.
