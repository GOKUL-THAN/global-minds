# Website and API audit

**Audit date:** 2026-10-08; database foundation update: 2026-10-08  
**Target:** `http://localhost:5174/`

## Overall status

**Partially working.** The public SPA, published-content overlay, enquiry intake,
admin authentication, CMS workflow, and newsletter subscription have working
paths. This is not a complete LMS or a production-ready payments/student
management system. Several admin screens and student-facing features remain
mock data or do not have backend endpoints.

## Runtime route and console check

Browser-rendered 64 routes from the application router: 43 public/auth/payment
routes and 21 admin routes. The routes rendered without new browser
`pageerror` or console-error events in the route sweep. Admin pages were checked
in the available signed-in admin browser context. HTTP 200 from the SPA server
only confirms that Vite served the application shell; it does not mean each
route has an API or persistent data behind it.

The route sweep covered:

- Public: `/`, `/courses`, `/courses/aws-training`,
  `/categories/cloud-computing`, `/master-programs`,
  `/master-programs/freshers-master-program`, `/online-training`,
  `/classroom-training`, `/certifications`, `/career`, `/career/job-support`,
  `/career/interview-preparation`, `/career/resume-preparation`,
  `/career/mock-interview`, `/internships`,
  `/internships/devops-internship`, `/register`, `/login`, `/admin/login`,
  `/dashboard`, `/contact`, `/corporate-training`, `/about`, `/trainers`,
  `/blog`, `/blog/aws-certification-guide-2026`, `/locations`,
  `/locations/chennai`, `/placement-records`, `/batch-schedule`, `/demo-class`,
  `/skill-assessment`, `/scholarships`, `/events`, `/live-projects`,
  `/refer-earn`, `/checkout`, `/payment-success`, `/payment-failed`,
  `/privacy-policy`, `/terms`, `/refund-policy`, and `/cookie-policy`.
- Admin: `/admin`, `/admin/courses`, `/admin/categories`,
  `/admin/master-programs`, `/admin/students`, `/admin/students/st1`,
  `/admin/student-progress`, `/admin/attendance`, `/admin/activity`,
  `/admin/studio`, `/admin/instructors`, `/admin/enquiries`,
  `/admin/internships`, `/admin/batches`, `/admin/locations`, `/admin/blog`,
  `/admin/faqs`, `/admin/testimonials`, `/admin/certificates`,
  `/admin/payments`, and `/admin/settings`.

This was a route-render smoke check, not a click-by-click audit of every control,
modal, form, dropdown, viewport size, or every possible dynamic slug.

### Runtime defect fixed

The live `/courses` route emitted React's “Maximum update depth exceeded” error.
`useCmsCollection` returned a fresh array on each render, which retriggered the
course page filter effect after every state update. The hook now memoizes the
merged collection. Reloading `/courses` after the fix produced no new browser
errors.

The remaining React Router v7 future-flag message is a warning, not a runtime
failure. An older shared browser tab contained a historical connection-refused
event; it did not recur in the live route sweep.

## Feature gap report

| Feature | Status | Evidence / limitation |
|---|---|---|
| Public pages and client-side routing | WORKING | 43 public/auth/payment routes rendered in browser smoke check |
| Course search, filters, and sorting | WORKING | Client-side filtering over local catalogue seed records |
| Public content publishing | PARTIAL | Public CMS overlays published records; local seed data remains fallback |
| Admin sign-in and session gate | WORKING | Session cookie, `/api/auth/me`, and protected admin route group |
| Admin CMS | WORKING | Draft, publish, archive, restore, and permanent delete flow through API |
| Enquiry forms | WORKING | Persisted to SQLite; admin list and update API are connected |
| Newsletter subscription | PARTIAL | Email is persisted uniquely; no unsubscribe or campaign delivery |
| Student registration | PARTIAL | Hashed account stored as unverified; email verification delivery/flow is absent |
| Student login/dashboard | PARTIAL | Verified student session path exists; registration-created accounts cannot authenticate before verification; LMS panels are not implemented |
| Course enrollment and learning progress | MISSING | No enrollment, module/topic, lesson, or progress entities/APIs |
| Trainer portal and assignment | MISSING | No trainer authentication role enforcement or course assignment APIs |
| Most admin operations | MOCK | Students, batches, attendance, activity, certificates, and payments screens use sample data |
| Admin course CRUD | PARTIAL | CMS can manage course content; catalogue admin list still reads static records and does not fully reflect CMS records |
| Payment processing | MISSING | No provider, server credentials, order API, webhook, or server verification |
| Email, password recovery, and OTP | MISSING | No email/SMS integration; service now returns explicit unavailable status rather than mock success |
| Roles and granular permissions | PARTIAL | Database roles are `ADMIN`/`SUPER_ADMIN`; other frontend-declared roles have no backend RBAC |
| Error/empty states | PARTIAL | Some connected pages expose load errors; mock-backed pages are not API error states |
| Responsive/accessibility interaction audit | NOT FULLY TESTED | Existing responsive markup was not exhaustively exercised at all viewport widths |

## API inventory summary

All discovered backend route definitions are listed in [API.md](./API.md).
Working endpoint groups are:

- Health: `GET /health`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`,
  `GET /api/auth/me`, `POST /api/auth/logout`
- Enquiry/newsletter: `POST /api/enquiries`, `GET /api/admin/enquiries`,
  `PATCH /api/admin/enquiries/:id`, `POST /api/newsletter`
- CMS: public collection/detail reads; admin list/detail, create/upsert,
  publish, archive, restore, and permanent delete
- Admin session: `GET /api/admin/session`

Some defined CMS endpoints are not called by current UI (`GET` detail and
`POST` create); the content editor currently reads the collection and saves via
upsert. No duplicate backend route was identified that needs consolidation.

### Required APIs still missing

- Email verification/resend and password-reset/change-token routes
- Student profile, admin student management, users/roles/permissions
- Course catalogue CRUD beyond generic CMS content; categories, modules, topics,
  content resources, and trainer assignment
- Enrollment, attendance, progress, lesson completion, assignments, grading,
  quizzes/results, certificates, and student notifications
- Trainer-specific routes and authorization
- Dashboard and activity/audit statistics from trusted backend data
- Payments, provider callbacks/webhooks, and server-side payment verification
- Newsletter unsubscribe and subscriber management
- Email replies for enquiries

## Database and architecture

Persisted application tables currently covered by migrations:

- `admin_users`: admin identities, bcrypt password hash, role, active state
- `student_users`: student registration/profile basics, bcrypt hash, active and
  email-verification state
- `enquiries`: web leads and follow-up workflow
- `newsletter_subscribers`: unique normalized email and subscription timestamp
- `cms_records`: versioned draft/published/archived JSON content with actor
  metadata

Local development loads SQLite through `sql.js` and persists a snapshot after
transactions. Production is configured to require PostgreSQL through the `pg`
adapter; PostgreSQL operates directly through a connection pool and does not
export in-memory snapshots. Both adapters use the ordered `schema_migrations`
table and `server/src/migrations.ts`. The current migrations preserve the
existing application entities; foreign-key-backed LMS entities have not yet
been implemented. Additional indexes and pagination will be required as these
collections grow.

## Security findings

- **Positive:** Admin APIs are session-protected; CMS delete is
  `SUPER_ADMIN`-only; mutations check an allowed `Origin`; login, registration,
  newsletter, and enquiry endpoints are rate-limited; passwords are bcrypt
  hashed; session cookie is `HttpOnly` and `SameSite=Strict`; public CMS is
  limited to an explicit allowlist.
- **Remaining:** Admin JWTs are not revocable server-side; logout clears the
  cookie only. There is no refresh rotation or session inventory. Email
  verification and password recovery are absent. Only two backend admin roles
  exist, with no resource-level permission model. Rate limits are in-process
  memory limits and would not coordinate across multiple API instances.
- **Input/data:** API validation exists on main write operations, but API
  response envelopes are inconsistent. Large collections are not paginated.
  Newsletter email storage has no unsubscribe/consent workflow.
- **Configuration:** Keep `server/.env` local and untracked; rotate any local
  development credentials before external deployment. Never put backend secrets
  in a `VITE_` variable.

## API and build testing

Latest isolated API smoke checks: **22 passed** (registration, duplicate and
invalid registration, unverified login denial, newsletter persistence and
deduplication, enquiry persistence and validation, admin authorization, CMS
public allowlisting, and health). Tests ran against a temporary SQLite file,
which was removed afterward. These are command-driven smoke checks; there is no
automated API integration-test suite in the repository.

Database foundation follow-up: the new Node test suite passed **2 tests**,
covering migration of a legacy SQLite file, preservation of existing records,
and enquiry/newsletter/CMS persistence. An isolated HTTP smoke run also passed
health, admin authorization/login, newsletter, enquiry persistence, and CMS
publish/read. PostgreSQL integration remains unverified because no PostgreSQL
service or credentials are configured in this environment.

Latest commands:

- `npm run build` — passed; Vite warns that the main JavaScript chunk is about
  1 MB minified.
- `npm run lint` — passed.
- `npm --prefix server run build` — passed.
- `npm --prefix server test` — passed (2 migration/persistence tests).

## Files changed in this audit

- `src/hooks/useCmsCollection.ts` — memoize merged CMS collections to stop the
  course-page render loop.
- `src/App.tsx` — remove false payment-success/failure claims when payments
  cannot be processed.
- `src/pages/CorporateTrainingPage.tsx` — remove obsolete mock-service claim.
- `server/src/database.ts` — introduce replaceable SQLite/PostgreSQL adapters,
  transactions, and PostgreSQL connection pooling.
- `server/src/migrations.ts` — version and record the existing schema setup.
- `server/src/db.ts`, `server/src/auth.ts`, and `server/src/index.ts` — move
  current persistence and request paths to async database operations.
- `server/test/database.test.mjs` — add migration and persistence regression
  coverage.
- `server/src/config.ts`, `server/package.json`, `server/package-lock.json`,
  `server/.env.example` — configure database driver and production PostgreSQL.
- `README.md` — document the local and production database setup.
- `docs/API.md` — API route inventory, consumer mapping, and known limitations.
- `docs/PROJECT-AUDIT.md` — replace stale frontend-only status and limitations.
- `docs/WEBSITE-AUDIT.md` — this route, feature, API, database, and security
  audit.

## Remaining work before production

Configure and implement email delivery before enabling student verification or
password recovery. Select a payment provider before implementing checkout.
Define LMS enrollment/progress and role-permission requirements before building
student/trainer/admin APIs. Replace mock admin screens with backend-backed
states, implement pagination where collections can grow, expand the test suite
to cover HTTP authorization and all domain workflows, and validate
legal/business/course content. Do not treat the current API as a complete
production LMS.
