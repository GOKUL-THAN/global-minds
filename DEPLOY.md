# Deploy Guide — Global Minds Academy

The Vercel project serves the frontend and proxies `/api/*` to the Express API
on Render. Render runs the API with PostgreSQL; its blueprint is configured at
the repository root.

| | Option A: Netlify | Option B: Vercel + Render (recommended) |
|---|---|---|
| Cost | Free | Free |
| What runs | Frontend only | Vercel frontend + Render API + PostgreSQL |
| Login / admin / forms | ❌ broken | ✅ working |
| CMS content editing | ❌ | ✅ |
| Email verification | ❌ | ✅ (with Resend key) |
| Setup time | ~2 min | ~5 min |
| Sleeps when idle | No | Yes (wakes on next request) |

---

## Option B — Vercel frontend + Render API (recommended)

The Vercel project rewrites `/api/*` and `/health` to
`https://global-minds-academy.onrender.com`. The `render.yaml` blueprint deploys:
- one **PostgreSQL** database (free, expires in 90 days)
- one **web service** for the Express API (it also serves the built frontend)

### Step 1 — Push the repo to GitHub

The repo is `GOKUL-THAN/global-minds` and deploys from `main`. Push changes:

```powershell
git add -A
git commit -m "Fix production API deployment"
git push origin main
```

> If `git push` fails with an auth error, your GitHub token expired.
> Run `gh auth login` (browser flow) and retry the push.

### Step 2 — Create the Render blueprint

1. Sign in to <https://render.com> (free account, no credit card).
2. Dashboard → **New** → **Blueprint**.
3. Select the `GOKUL-THAN/global-minds` repo (authorize Render to read it if asked).
4. Render reads `render.yaml` and shows the database + web service it will create.
5. Fill in the secret environment variables (Render prompts for each `sync: false`):

| Key | What to set |
|-----|-------------|
| `JWT_SECRET` | 32+ random characters — e.g. run `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_PASSWORD` | Min 14 characters — the password for `admin@local.test` |
| `SUPER_ADMIN_PASSWORD` | Min 14 characters, **different** from ADMIN_PASSWORD — password for `globalminds@gmail.com` |
| `RESEND_API_KEY` | Optional — only if you want email verification / password recovery |
| `EMAIL_FROM` | Optional — e.g. `Global Minds Academy <accounts@globalmindsacademy.in>` |

6. Click **Apply**. Render provisions the database and deploys the web service.
   First build takes ~3–5 minutes.

### Step 3 — Verify the Vercel origin allowlist

`APP_ORIGIN` and `APP_ALLOWED_ORIGINS` are set by `render.yaml` to allow the
Vercel production aliases. Keep them aligned with the aliases configured for
the Vercel project if those aliases change.

The API must be live before the frontend can log in or save queries. Verify:

- `https://global-minds-academy.onrender.com/health` returns `{"status":"ok"}`.
- `https://global-minds-beta.vercel.app/health` returns the same JSON through the Vercel proxy.
- Sign in and submit an enquiry on the Vercel site.

### Free-tier notes

- The web service sleeps after 15 min of inactivity. The first request after
  sleep takes ~30s to wake it. Subsequent requests are fast.
- Free PostgreSQL expires in 90 days. Before then, back up your data
  (`pg_dump`) or upgrade the database to a paid plan.
- Auto-deploy is on: every `git push` to `main` redeploys automatically.

### One-command alternative (after first setup)

Once the blueprint is created and secrets are saved, future deploys are just:

```powershell
git push origin main
```

Render rebuilds and redeploys automatically.

---

## Option A — Netlify (frontend-only preview)

Use this only to share a public preview of the page designs. **Login, admin,
registration, and form submissions will not work** — there is no backend.

### Step 1 — Log in once

```powershell
netlify login
```

A browser window opens. Authorize. You only do this once per machine.

### Step 2 — Deploy

From the project root:

```powershell
# Quick preview deploy (gets a temporary URL)
netlify deploy --dir=dist

# Production deploy (uses your custom/site name)
netlify deploy --prod --dir=dist
```

On the first `--prod` deploy, Netlify asks for a site name (becomes
`<name>.netlify.app`) or lets you link to an existing site.

### Why a separate backend is needed on Netlify

Netlify serves static files only in this configuration. The Express API needs
a persistent PostgreSQL database for accounts, sessions, CMS data, and enquiries.

If you use Netlify for the frontend, you must also configure an equivalent
`/api/*` proxy to the Render service. The application uses same-origin API
paths, so setting `VITE_API_BASE_URL` alone does not configure the requests.

---

## Troubleshooting deploys

| Symptom | Cause | Fix |
|---------|-------|-----|
| Login says the sign-in server is unreachable; API requests return the website HTML | The Render API is unavailable or Vercel is not proxying `/api/*` to it | Ensure the Render blueprint is applied and healthy at `/health`; verify the Vercel API rewrite is deployed |
| Render build fails at `npm --prefix server run build` | Server TypeScript error | Run `npm --prefix server run build` locally first; fix any errors, push |
| Login fails with 403 "origin not allowed" | Frontend origin is not allowlisted | Set `APP_ORIGIN` to the canonical Vercel origin and add other frontend origins to `APP_ALLOWED_ORIGINS` |
| Admin login says "Invalid email or password" | Account email/password do not match the initialized database account | Verify the configured account email and use the password set when the account was initialized; use the supported password-reset flow rather than resetting the production database |
| 500 on first API call | `JWT_SECRET` missing | Set `JWT_SECRET` (32+ chars) in Render env |
| Service never wakes / cold starts very slow | Free tier | First request after 15 min idle takes ~30s; this is expected |
| `git push` rejected | GitHub token expired | `gh auth login`, then retry |

---

## Environment variable reference (production)

| Variable | Required | Notes |
|----------|----------|-------|
| `NODE_ENV` | yes | `production` (render.yaml sets it) |
| `DATABASE_DRIVER` | yes | `postgres` (render.yaml sets it) |
| `DATABASE_URL` | yes | Injected from the Render database |
| `JWT_SECRET` | yes | 32+ random characters |
| `APP_ORIGIN` | yes | Canonical frontend origin, set to the Vercel production URL |
| `APP_ALLOWED_ORIGINS` | no | Comma-separated additional exact frontend origins |
| `ADMIN_EMAIL` | yes | Default `admin@local.test` |
| `ADMIN_PASSWORD` | yes | Min 14 chars |
| `SUPER_ADMIN_EMAIL` | yes | Default `globalminds@gmail.com` |
| `SUPER_ADMIN_PASSWORD` | yes | Min 14 chars, different from admin |
| `RESEND_API_KEY` | optional | Enables email verification + recovery |
| `EMAIL_FROM` | optional | Required if `RESEND_API_KEY` is set |
