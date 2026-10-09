# API inventory and current contract

The API is an Express service in `server/src/index.ts`. Local development uses
SQLite through `sql.js`; production uses PostgreSQL through `pg`. The browser
calls same-origin `/api` routes through the Vite proxy.
All mutating browser routes require an allowed `Origin`. Protected routes use a
short-lived HttpOnly session cookie backed by a revocable database session.
Administrative routes independently check the authenticated account's
server-side permissions.

## Implemented routes

| Module | Method and URL | Authentication | Frontend consumer | Status |
|---|---|---|---|---|
| Health | `GET /health` | None | Operations/smoke checks | Working |
| Registration | `POST /api/auth/register` | None; rate limited | `/register` | Creates a `STUDENT` identity and sends verification email; requires configured Resend delivery |
| Login | `POST /api/auth/login` | None; rate limited | `/login`, `/admin/login` | Authenticates active identities; students must verify email |
| Verify email | `POST /api/auth/verify-email` | One-time token; same-origin | `/verify-email` | Consumes a hashed, expiring verification token |
| Resend verification | `POST /api/auth/resend-verification` | None; rate limited | Login page | Sends a replacement verification token |
| Forgot password | `POST /api/auth/forgot-password` | None; rate limited | `/forgot-password` | Generic response for unknown/inactive accounts |
| Reset password | `POST /api/auth/reset-password` | One-time token; same-origin | `/reset-password` | Consumes token and revokes all active sessions |
| Change password | `POST /api/auth/change-password` | Session cookie; same-origin | `/account/security` | Checks current password and revokes all active sessions |
| Session | `GET /api/auth/me` | Session cookie | Admin gate, student dashboard | Returns active identity and assigned permissions |
| Session inventory | `GET /api/auth/sessions` | Session cookie | `/account/security` | Lists the caller’s active sessions |
| Revoke session | `DELETE /api/auth/sessions/:id` | Session cookie; same-origin | `/account/security` | Revokes only a session owned by the caller |
| Logout all | `POST /api/auth/logout-all` | Session cookie; same-origin | `/account/security` | Revokes every active session and clears cookie |
| Logout | `POST /api/auth/logout` | Session cookie optional; same-origin | Admin/student sign out | Revokes the current session and clears cookie |
| Enquiries | `POST /api/enquiries` | None; rate limited | Contact, corporate, demo/enquiry forms | Working |
| Newsletter | `POST /api/newsletter` | None; rate limited | Site footer | Working; stores unique email subscriptions, does not send campaigns |
| Admin session | `GET /api/admin/session` | `users.read` | Admin session consumers | Returns authenticated administrative identity |
| Managed identities | `GET /api/admin/users` | `users.read` | API foundation | Paginated searchable identity listing |
| Update identity | `PATCH /api/admin/users/:id` | `users.update`; deactivation also requires `users.deactivate` | API foundation | Role/status changes revoke sessions; only super admins can grant or modify super-admin identities |
| Roles | `GET /api/admin/roles` | `roles.read` | API foundation | Lists seeded roles and assigned permissions |
| Permissions | `GET /api/admin/permissions` | `roles.read` | API foundation | Lists registered permission names |
| Update role permissions | `PUT /api/admin/roles/:role/permissions` | `roles.manage` | API foundation | Super-admin-only route; the `SUPER_ADMIN` role itself is immutable |
| Audit logs | `GET /api/admin/audit-logs` | `audit_logs.read` | API foundation | Paginated audit events; permission is seeded for `SUPER_ADMIN` |
| Enquiry list | `GET /api/admin/enquiries` | `enquiries.read` | Admin Enquiries | Working |
| Enquiry update | `PATCH /api/admin/enquiries/:id` | `enquiries.update` | Admin Enquiries modal | Working for status, assignee, follow-up date, and internal notes |
| Public CMS collection | `GET /api/content/:section` | None | Public content collection hook | Working for public sections only |
| Public CMS detail | `GET /api/content/:section/:slug` | None | No current direct frontend consumer | Working for published records |
| Admin CMS collection | `GET /api/admin/content/:section` | Section-specific `*.read` permission | Content Studio, Admin Courses | Working |
| Admin CMS detail | `GET /api/admin/content/:section/:slug` | Section-specific `*.read` permission | Content Studio | Working; course records also return ordered relational module/lesson structure |
| Create CMS record | `POST /api/admin/content/:section` | Section-specific `*.create` permission | Content Studio | Creates a draft; course slug may be generated from its title |
| Update CMS record | `PUT /api/admin/content/:section/:slug` | Section-specific `*.update` permission | Content Studio | Updates an existing draft; returns 404 for a missing or archived record; course modules/lessons are synchronized transactionally |
| Publish CMS record | `POST /api/admin/content/:section/:slug/publish` | Section-specific `*.publish` permission | Courses, Content Studio | Course publish requires descriptions, category slug, level, duration, safe thumbnail, prices, and a module with a lesson |
| Unpublish CMS record | `POST /api/admin/content/:section/:slug/unpublish` | Section-specific `*.publish` permission | Course list, Content Studio | Moves a published record to draft and removes its public snapshot; audited |
| Archive CMS record | `POST /api/admin/content/:section/:slug/archive` | Section-specific `*.archive` permission | Courses, Content Studio | Reversible; archived public course records are hidden |
| Restore CMS record | `POST /api/admin/content/:section/:slug/restore` | Section-specific `*.archive` permission | Content Studio | Restores prior draft/published status |
| Permanently delete CMS record | `DELETE /api/admin/content/:section/:slug` | `content.delete` | Content Studio | Working; seeded only for `SUPER_ADMIN` |

CMS lifecycle mutations write metadata-only audit events (`cms.record.*`) with
the acting identity, section, slug, resource id, and request IP. Content bodies
and credentials are not copied into these audit events.

For course records the permission prefix is `courses`; other sections use
`content`. Public CMS reads are allowlisted for courses, categories,
master-programs, website-menu, live-projects, events, scholarships, refer-earn,
corporate-training, about, contact, online-training, classroom-training,
certifications, demo-class, skill-assessment, career, placement-records,
interview-preparation, mock-interview, instructors, internships, locations,
blog, FAQs, and testimonials. The remaining registered sections are not
available through public content routes. Public collection and detail responses
currently use a 60-second cache header.

## Frontend-to-API connections

- Enquiry forms create persistent enquiry records. The admin enquiry page reads
  and updates those records.
- Newsletter signup stores an email once; repeat submissions are idempotent.
- Course listings query the public CMS API and merge published records over
  the built-in course catalog. If the API request fails, the course service
  falls back to that static catalog. Other public CMS sections also merge
  published records with static seed data.
- Admin course lists and lifecycle actions are connected to CMS APIs. The
  Content Studio includes static course catalog entries as unsaved starting
  points; saving creates a CMS draft.
- Course publishing can be explicitly reversed: unpublish keeps the editable
  draft and removes the public snapshot. Create/update/publish/unpublish/
  archive/restore/delete operations emit audit metadata.
- Migration 004 preserves existing CMS records, expands allowed CMS author
  roles, and normalizes course modules and lessons into ordered relational
  tables. Existing course JSON remains backward compatible; legacy modules
  and topics are copied into the relational hierarchy.
- Registration creates a unified `STUDENT` identity with a bcrypt password
  hash and `email_verified = 0`. Email verification and recovery use Resend;
  configure `RESEND_API_KEY` and `EMAIL_FROM` together or these flows return an
  explicit service-unavailable/provider error.
- Legacy `admin_users` and `student_users` data is copied by migration 003 into
  the unified `users`, `user_roles`, and `student_profiles` tables without
  changing legacy account IDs/password hashes. Duplicate legacy email
  identities cause migration failure rather than silent account merging.
- Migration 003 seeds the five roles (`SUPER_ADMIN`, `ADMIN`,
  `CONTENT_MANAGER`, `TRAINER`, `STUDENT`), permissions, and role assignments.
  Protected routes load permissions from the database and reject inactive or
  unverified student accounts. The authenticated identity's own account data
  is returned by `/api/auth/me`; learning-resource APIs are still future work.
- Session JWTs include a server-stored session identifier and token hash.
  Protected requests reject expired/revoked sessions. Password reset/change
  and account role/deactivation changes revoke sessions.
- `/account/security` lets signed-in users change their password, review active
  sessions, revoke individual sessions, or sign out all sessions.
- `/dashboard` now requires an authenticated student and shows account data;
  course enrollment, progress, schedules, assignments, and certificates are
  not backed by APIs yet.
- Payment routes are not implemented. The checkout page says payments are
  unavailable; payment service methods now fail explicitly rather than making
  fake orders or reporting fake verification success.

## Missing APIs for existing or advertised areas

These are absent and must not be treated as working:

- Student email verification/resend and password recovery/change. No email
  provider or delivery configuration exists.
- Student profile update/deactivation, enrollment, course progress, lesson
  completion, schedule, assignment, quiz, certificate, or notification APIs.
- Payment creation, provider webhook, and server-side verification. No provider
  or server credentials are configured.
- Newsletter unsubscribe/consent management and admin subscriber management.
- Enquiry reply/email delivery. Enquiry status, assignment, notes, and follow-up
  are persisted; replying currently opens the user's email client.
- Live CRUD/statistics for most admin areas such as students, batches,
  attendance, payments, certificates, and activity. Those screens still use
  mock data or disabled actions.

## Future relational model

The current migrations intentionally establish the cross-database persistence
foundation without pre-creating unused LMS tables. New tables should be added
with their owning API/domain phase:

- **Identity and authorization:** unified users, roles, permissions, role
  assignments, student profiles, revocable sessions, hashed single-use
  verification/reset tokens, and audit logs are implemented as the initial
  identity foundation. Broader role-specific application workflows remain
  future work.
- **Course authoring:** `courses` reference `course_categories`; explicit
  trainer assignments connect users and courses. A course owns ordered
  modules, modules own ordered lessons, and lessons may own typed resources.
  Publishing state belongs on the records served publicly.
- **Learning records:** an enrollment joins one student to one course (and
  optionally a batch); lesson progress is unique per enrollment/lesson and
  drives server-computed course progress.
- **Scheduled learning:** batches reference courses; join tables assign
  students and trainers; class sessions belong to batches; attendance is
  unique per student/session.
- **Assessment:** assignments belong to courses or lessons, submissions
  belong to students and assignments, and grades reference a submission and
  grading trainer. Quizzes own questions/options; attempts and answers are
  student-owned and scored server-side.
- **Operations:** certificates reference completed enrollments and have a
  separate public verification identifier; notifications belong to a user;
  audit logs reference actors and resource identifiers without secrets.
- **External integrations:** payment orders, verified transactions, and
  webhook event identifiers must be separate records; file records contain
  metadata/object-storage keys rather than file bytes in relational rows.
  Newsletter consent/unsubscribe state belongs to the subscriber record.

The other domain relations should use a foreign key, an explicit lifecycle/status,
created and updated timestamps, and uniqueness constraints for domain invariants.
Deletion policy (soft delete versus restricted/cascading delete) must be
decided per domain before its migration; destructive audit/history records
should not cascade away. None of the planned entities above is live yet.

## API limitations and security notes

- Responses predate a single envelope standard and use endpoint-specific JSON
  shapes (usually `{ message }` for errors). Standardization remains outstanding.
- Authentication, token single-use, session invalidation, and RBAC checks are
  covered by local database tests, but the HTTP routes have not yet been
  exercised as an automated integration suite.
- The PostgreSQL adapter and migrations are present, but no live PostgreSQL
  service was available for integration validation.
- Email delivery uses Resend and cannot be validated without provider
  credentials. Registration/recovery explicitly report configuration/provider
  failures.
- The local SQLite adapter is loaded into memory and writes a database snapshot
  after each transaction. Production is required to use the PostgreSQL adapter,
  which executes queries and transactions directly through a connection pool.
  Both adapters apply ordered, recorded migrations from `server/src/migrations.ts`.
- The backend has TypeScript build validation and automated persistence tests
  (`npm --prefix server test`) covering SQLite migrations, legacy identity
  preservation, verification/reset single-use behavior, session invalidation,
  course module/lesson migration and persistence, role-aware CMS authorship,
  and enquiry/newsletter/CMS operations.

For local SQLite use, set `DATABASE_DRIVER=sqlite` (the default) and optionally
`DATABASE_PATH`. For production, set `DATABASE_DRIVER=postgres` and configure
`DATABASE_URL`; production mode rejects SQLite. The database connection string
must remain server-side and must never be placed in a `VITE_` variable.

## Verification commands

```powershell
npm run build
npm run lint
npm --prefix server run build
npm --prefix server test
```
