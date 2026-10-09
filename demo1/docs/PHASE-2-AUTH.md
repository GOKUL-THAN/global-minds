# Phase 2 — Authentication, Sessions & RBAC

**Status: ✅ COMPLETE for the current Phase 2 scope**  
**Validation date:** 2026-10-08

## Implemented and verified

- Retained existing bcrypt password hashing, email verification, reset tokens,
  server-backed HttpOnly session cookies, expiry checks, revocation, and
  database-backed RBAC.
- Fixed startup provisioning so configured bootstrap admin credentials, role,
  and active state are not rewritten on every restart. This prevents password
  changes from being silently reverted and prevents startup from reactivating
  a deactivated administrator.
- Corrected the configured admin password length guard to enforce the stated
  14–72 UTF-8 byte range.
- Added HTTP integration coverage for missing/forged sessions, invalid
  passwords, Student/Trainer denial on admin APIs, Admin/Super Admin
  permissions, expiry, logout revocation, and login throttling.
- Confirmed auth responses do not expose password hashes or echo submitted
  passwords.

## Validation

`npm --prefix server test` passes the backend build and 6 tests, including:

- Legacy migration and persistence behavior.
- Password reset token single-use and session revocation.
- Configured admin credential persistence across restart.
- HTTP login/session/permission/rate-limit checks.
- Authenticated course CRUD, syllabus readback, archive/restore,
  publish/unpublish, public visibility, audit records, and persistence through
  API restart.

Unauthenticated admin API requests return **401**; authenticated Student and
Trainer requests without admin permissions return **403**. Permission-allowed
Admin and Super Admin API requests return **200**.

## Limitations

- Sessions have a fixed two-hour expiry; no refresh-token endpoint exists, so
  users must sign in again after expiry.
- Email-dependent registration, verification, and recovery require Resend
  configuration and were not tested against a live provider.
- Rate limits use the process-local default store. Multi-instance deployments
  require a shared limiter store and trusted-proxy configuration.
- PostgreSQL was unavailable for integration tests.
- Student enrollment ownership and trainer resource assignment rely on domain
  APIs that remain for later phases.

**Production readiness remains ⚠️ NEEDS ATTENTION.** Phase 2 does not certify
the entire website or later LMS phases.
