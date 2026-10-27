# Deploy Guide — Global Minds Academy

Two free paths. **Render (Option B) is the only one that runs the full site** —
login, admin, CMS, and forms all need the Express backend, which Netlify/Vercel
static hosting cannot provide.

| | Option A: Netlify | Option B: Render (recommended) |
|---|---|---|
| Cost | Free | Free |
| What runs | Frontend only | Frontend **+ backend + database** |
| Login / admin / forms | ❌ broken | ✅ working |
| CMS content editing | ❌ | ✅ |
| Email verification | ❌ | ✅ (with Resend key) |
| Setup time | ~2 min | ~5 min |
| Sleeps when idle | No | Yes (wakes on next request) |

---

## Option B — Render (full stack, recommended)

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

Netlify serves static files only. The Express API uses SQLite files on disk,
JWT sessions, and HttpOnly cookies — none of that runs on Netlify Functions
(serverless, ephemeral filesystem). That's why Option B (Render) is the real
deploy for this project.

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
