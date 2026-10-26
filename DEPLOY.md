# Deploy Guide — Global Minds Academy

Three deployment paths are documented below. Render runs the Express service
and frontend together. Vercel runs the frontend and API as serverless
functions, using Neon PostgreSQL for persistent storage.

| | Option A: Netlify | Option B: Render (recommended) | Option C: Vercel + Neon |
|---|---|---|---|---|
| What runs | Frontend only | Frontend + Express backend + PostgreSQL | Frontend + serverless API + Neon PostgreSQL |
| Login / admin / forms | Not available | Working | Working |
| Email verification | Not available | With Resend key | With Resend key |
| Database | None | Render PostgreSQL | Neon PostgreSQL |
| Setup | ~2 min | ~5 min | Configure Vercel and Neon |

---

## Option C — Vercel + Neon (serverless)

Vercel deploys the React frontend and the API functions under `api/`. Neon
provides the persistent PostgreSQL database; SQLite is not suitable for these
serverless functions. Vercel installs both the root and `server/` dependencies,
then builds the frontend and type-checks the API.

1. Create a Neon project and copy its **pooled** connection string.
2. Import this repository into Vercel and set the project root to the
   repository root. Vercel uses `vercel.json` to build and route `/api/*`.
3. Add these environment variables in Vercel for the environments you deploy:

| Key | Value |
|-----|-------|
| `DATABASE_DRIVER` | `postgres` |
| `DATABASE_URL` | Neon pooled connection string |
| `JWT_SECRET` | At least 32 random bytes |
| `APP_ORIGIN` | Exact site origin, e.g. `https://your-site.vercel.app` |
| `ADMIN_EMAIL` | Admin account email |
| `ADMIN_PASSWORD` | 14–72 bytes |
| `SUPER_ADMIN_EMAIL` | Super-admin account email |
| `SUPER_ADMIN_PASSWORD` | 14–72 bytes; different from admin password |
| `RESEND_API_KEY` | Optional; configure together with `EMAIL_FROM` |
| `EMAIL_FROM` | Optional; required when `RESEND_API_KEY` is set |

4. Deploy. Database migrations run on the first API invocation. For preview
   deployments, set `APP_ORIGIN` to that preview's exact origin if you need
   sign-in or other mutating requests to work there.
5. Verify `/api/health` and then test sign-in and the public forms.

Do not commit credentials or the Neon connection string. Configure them only in
Vercel's project environment settings. Set `APP_ORIGIN` to every production
custom domain used by the site; browser mutations from origins not on the
allowlist are rejected.

---

## Option B — Render (full stack)

The `render.yaml` blueprint deploys:
- one **PostgreSQL** database (free, expires in 90 days)
- one **web service** that serves the built React frontend **and** the Express API
  on a single URL (single-origin, so cookies + sessions just work)

### Step 1 — Push the repo to GitHub

The repo is already connected to `github.com/gokult78/global-minds.git` on the
`master` branch. Commit the deploy prep (see Step 5 of the prep) and push:

```powershell
git add -A
git commit -m "Add deploy config: Render blueprint + single-origin server"
git push origin master
```

> If `git push` fails with an auth error, your GitHub token expired.
> Run `gh auth login` (browser flow) and retry the push.

### Step 2 — Create the Render blueprint

1. Sign in to <https://render.com> (free account, no credit card).
2. Dashboard → **New** → **Blueprint**.
3. Select the `gokult78/global-minds` repo (authorize Render to read it if asked).
4. Render reads `render.yaml` and shows the database + web service it will create.
5. Fill in the secret environment variables (Render prompts for each `sync: false`):

| Key | What to set |
|-----|-------------|
| `JWT_SECRET` | 32+ random characters — e.g. run `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_PASSWORD` | Min 14 characters — the password for `admin@local.test` |
| `SUPER_ADMIN_PASSWORD` | Min 14 characters, **different** from ADMIN_PASSWORD — password for `globalminds@gmail.com` |
| `APP_ORIGIN` | Leave blank for now — set it after Step 3 (see below) |
| `RESEND_API_KEY` | Optional — only if you want email verification / password recovery |
| `EMAIL_FROM` | Optional — e.g. `Global Minds Academy <accounts@globalmindsacademy.in>` |

6. Click **Apply**. Render provisions the database and deploys the web service.
   First build takes ~3–5 minutes.

### Step 3 — Set APP_ORIGIN to your live URL

Once the service is live, Render assigns it a URL like
`https://global-minds-academy.onrender.com`. Copy that URL.

Render dashboard → your web service → **Environment** → set:

```
APP_ORIGIN = https://global-minds-academy.onrender.com
```

Save — Render redeploys automatically. The API's CORS check requires `APP_ORIGIN`
to match the exact origin the browser visits, so this step is **required** for
login/admin to work.

### Step 4 — Verify

Open `https://<your-service>.onrender.com`:

- Homepage loads → ✅
- `/health` returns `{"status":"ok"}` → ✅ API is live
- `/admin/login` → sign in with `admin@local.test` + the ADMIN_PASSWORD you set → ✅

### Free-tier notes

- The web service sleeps after 15 min of inactivity. The first request after
  sleep takes ~30s to wake it. Subsequent requests are fast.
- Free PostgreSQL expires in 90 days. Before then, back up your data
  (`pg_dump`) or upgrade the database to a paid plan.
- Auto-deploy is on: every `git push` to `master` redeploys automatically.

### One-command alternative (after first setup)

Once the blueprint is created and secrets are saved, future deploys are just:

```powershell
git push origin master
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

Netlify is configured here as a static frontend preview only. The Express API
uses persistent database storage, sessions, and HttpOnly cookies; use Render
or Vercel + Neon when those features are needed.

If you specifically want Netlify for the frontend, you can host the backend
separately on Render (Option B's web service) and point the frontend at it by
setting `VITE_API_BASE_URL` to the Render URL before building — but that's a
hybrid setup, more complex than just using Render end-to-end.

---

## Troubleshooting deploys

| Symptom | Cause | Fix |
|---------|-------|-----|
| Render build fails at `npm --prefix server run build` | Server TypeScript error | Run `npm --prefix server run build` locally first; fix any errors, push |
| Login fails with 403 "origin not allowed" | `APP_ORIGIN` not set or wrong | Set `APP_ORIGIN` to the exact `https://...onrender.com` URL in Render env |
| Admin login says "Invalid email or password" | Bootstrap passwords not set / mismatched | Set `ADMIN_PASSWORD` + `SUPER_ADMIN_PASSWORD` in Render env, then **clear the database** (Render dashboard → database → reset) so accounts are re-seeded |
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
| `APP_ORIGIN` | yes | Your live `https://...onrender.com` URL |
| `ADMIN_EMAIL` | yes | Default `admin@local.test` |
| `ADMIN_PASSWORD` | yes | Min 14 chars |
| `SUPER_ADMIN_EMAIL` | yes | Default `globalminds@gmail.com` |
| `SUPER_ADMIN_PASSWORD` | yes | Min 14 chars, different from admin |
| `RESEND_API_KEY` | optional | Enables email verification + recovery |
| `EMAIL_FROM` | optional | Required if `RESEND_API_KEY` is set |
