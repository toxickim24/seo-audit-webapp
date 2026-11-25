# SEO Mojo — Production Deployment Guide

**Site:** https://seomojo.app  
**Production app root:** `~/seo-audit-webapp`  
**Startup file:** `server/server.js`  
**Node.js version:** 20.20.2  
**Local repo (Windows):** `C:\wamp64\www\seo-audit-webapp`

---

## Release manifest

Every deployment must identify exactly which files change, which require a
frontend rebuild, and which exist only in git without being copied to the server.

### Backend files deployed to the production server

These are copied to `~/seo-audit-webapp/server/` during deployment, either by
`git pull` or by individual file upload.

| File | Change in this release |
|---|---|
| `server/server.js` | Startup guard: exits before listening if `JWT_SECRET` is absent |
| `server/utils/jwt.js` | Reads `JWT_SECRET` at call time, not at module-load time |
| `server/routes/adminUserRoutes.js` | Adds `requireRole("admin")` to every route |
| `server/routes/adminActivityRoutes.js` | Adds `requireRole("admin")` to every route |
| `server/routes/adminLeadRoutes.js` | Adds `requireRole("admin")` to GET and DELETE; POST stays public |
| `server/routes/adminSystemRoutes.js` | Adds `requireRole("admin")` to the insights route |

### Frontend source files (require a local build, then upload `build/`)

`REACT_APP_*` variables are baked into the bundle by webpack at build time.
They must be present in the environment of **the Windows machine running
`npm run build`**, not on the production server. The server does not read
`REACT_APP_*` at runtime.

| File | Change in this release |
|---|---|
| `src/api/SeoPerformance.js` | Removes module-level throw; adds null guard inside function |
| `src/components/Main.js` | Resets `journeyStep` and `seoData` in the catch block |
| `src/pages/PublicPartnerPage/index.js` | Same catch-block reset on the partner audit page |

### Repository-only files (committed to git; not copied to the production server)

| File | Purpose |
|---|---|
| `.gitignore` | Adds `server/schema_local.sql` to prevent accidental commit |
| `docs/deployment.md` | This guide |
| `README.md` | Updated to link to this guide |

No new npm packages are introduced in this release. `npm install` is not
required on the production server.

---

## Phase 1 — Local preparation `[Windows — PowerShell]`

### Step 1.1 — Verify the B4 authorization fixes

The four admin route files were edited to add `requireRole("admin")`. Before
committing, restart the local backend and confirm the fixes are active.

Stop any running backend instance, then start it fresh:

```powershell
# From the repo root — keep this terminal open while testing
node server\server.js
```

In a second PowerShell terminal, run the authorization check:

```powershell
node --input-type=module --experimental-vm-modules -e "
import http from 'http';
import { signToken } from './server/utils/jwt.js';

function req(method, path, token) {
  return new Promise((resolve, reject) => {
    const r = http.request(
      { hostname: '127.0.0.1', port: 5000, path, method,
        headers: token ? { Authorization: 'Bearer ' + token } : {} },
      (res) => { let d = ''; res.on('data', c => d += c);
        res.on('end', () => resolve(res.statusCode)); }
    );
    r.on('error', reject); r.end();
  });
}
// ... (see Step 1.1 test script in this release's B4 test record)
"
```

**Recorded results — 2026-11-25 against commit (pending):**

| Route | No token | Partner token | Admin token | Result |
|---|---|---|---|---|
| `GET /api/admin/users` | 401 | **403** | 200 | PASS |
| `GET /api/admin/activity` | 401 | **403** | 200 | PASS |
| `GET /api/adminLeads` | 401 | **403** | 200 | PASS |
| `GET /api/admin/system/insights` | 401 | **403** | 200 | PASS |
| `GET /api/admin/stats` *(control)* | 401 | 403 | 200 | PASS |
| `GET /api/admin/partners` *(control)* | 401 | 403 | 200 | PASS |

**All 6/6 routes pass. B4 fixes confirmed active as of 2026-11-25.**

Also confirm the startup guard works before committing. Stop the backend,
temporarily remove or comment out `JWT_SECRET` from `.env`, restart:

```powershell
node server\server.js
```

Expected output:
```
FATAL: JWT_SECRET is not set. Refusing to start.
```

The process must exit without starting the HTTP listener. Restore `.env` and
restart normally before proceeding.

### Step 1.2 — Stage and commit all 12 files

```powershell
Set-Location C:\wamp64\www\seo-audit-webapp

git add `
  server/routes/adminUserRoutes.js `
  server/routes/adminActivityRoutes.js `
  server/routes/adminLeadRoutes.js `
  server/routes/adminSystemRoutes.js `
  server/server.js `
  server/utils/jwt.js `
  src/api/SeoPerformance.js `
  src/components/Main.js `
  src/pages/PublicPartnerPage/index.js `
  .gitignore `
  docs/deployment.md `
  README.md
```

Confirm exactly 12 files are staged and nothing else:

```powershell
git status
```

Then commit:

```powershell
git commit -m "security: requireRole on admin routes, JWT timing fix, startup guard, audit retry reset, deployment guide"
```

### Step 1.3 — Push to GitHub

```powershell
git push origin main
```

Expected: GitHub accepts the push without errors. Confirm the new commit is
at the top of `https://github.com/toxickim24/seo-audit-webapp/commits/main`.

### Step 1.4 — Build the React frontend

> **Environment variable note:** `REACT_APP_*` variables are only read during
> the build on this Windows machine. The production server does not use them.
> Confirm both are set in `C:\wamp64\www\seo-audit-webapp\.env` before
> running the build:
> - `REACT_APP_API_URL=https://seomojo.app`
> - `REACT_APP_PAGESPEED_KEY=<your production key>`
>
> If `.env` already has these values from the last build, no changes are
> needed. Do not change `DB_*` or any server-side values in `.env` for the
> build — the build ignores them.

```powershell
Set-Location C:\wamp64\www\seo-audit-webapp
$env:NODE_ENV = "production"
npm run build
```

Expected final line:
```
The build folder is ready to be deployed.
```

The build takes 60–120 seconds. If it exits with a linting error, fix the
reported file and line before continuing.

After the build, verify the PageSpeed key is present and the old throw is gone:

```powershell
# Should output 1 or more — confirms key is baked in:
(Select-String -Path "build\static\js\main.*.js" -Pattern "AIzaSy").Count

# Should output nothing — confirms old module-level throw is gone:
Select-String -Path "build\static\js\main.*.js" -Pattern "Missing PageSpeed API key"
```

---

## Phase 2 — Server reconnaissance `[cPanel Terminal — Bash]`

Open the cPanel Terminal under **Advanced → Terminal**. These steps are
read-only. Run each command and note the result before moving to Phase 3.

### Step 2.1 — Identify the deployment method

```bash
ls ~/seo-audit-webapp/.git 2>/dev/null \
  && echo "=== GIT CHECKOUT — use Phase 4A ===" \
  || echo "=== NOT A GIT REPO — use Phase 4B ==="
```

Note whether this is a git checkout or an uploaded copy. The result determines
which deployment path you use.

### Step 2.2 — Check the current backend revision

```bash
# If git checkout:
cd ~/seo-audit-webapp && git log --oneline -3

# Check whether the route files have already been updated:
grep -c "requireRole" ~/seo-audit-webapp/server/routes/adminUserRoutes.js
```

A result of `0` means the B4 fixes are not yet deployed. A result of `7`
means they are already on the server.

### Step 2.3 — Confirm JWT_SECRET is set and nonblank

```bash
[ "$(grep -c '^JWT_SECRET=.' ~/seo-audit-webapp/.env 2>/dev/null)" -ge 1 ] \
  && echo "JWT_SECRET: present and nonblank" \
  || echo "JWT_SECRET: MISSING or blank — complete Phase 3 before continuing"
```

This command reports only whether the variable is set. It does not print the
value.

If the result is `MISSING or blank`, proceed to Phase 3 before deploying
anything. The new `server.js` startup guard will prevent the app from
starting without this variable.

### Step 2.4 — Confirm the production database name

```bash
grep "^DB_NAME=" ~/seo-audit-webapp/.env
```

Write down this value. It must remain unchanged after deployment. This is the
only `.env` value you should read in the terminal.

### Step 2.5 — Note the current build hash

```bash
ls ~/seo-audit-webapp/build/static/js/main.*.js 2>/dev/null
```

Note the hash in the filename (e.g. `main.bbe10b52.js`). After deploying
the new build, the hash must be different.

### Step 2.6 — Confirm Node.js version

```bash
node --version
```

Expected: `v20.20.2` or another v20 release. If the command is not found,
run the activation command from the cPanel Node.js page first.

---

## Phase 3 — Resolve JWT_SECRET if missing `[cPanel UI or Terminal — Bash]`

Skip this phase if Step 2.3 returned `present and nonblank`.

The new `server.js` startup guard exits before opening the HTTP port if
`JWT_SECRET` is absent. Set the variable before deploying the new code.

**Option A — cPanel Node.js environment variables panel (preferred):**

1. In cPanel, go to **Software → Node.js** (or Setup Node.js App).
2. Click **Edit** on the `seo-audit-webapp` application.
3. Under **Environment Variables**, add:
   - Key: `JWT_SECRET`
   - Value: a strong secret (32 or more random characters)
4. Click **Save**.
5. Verify without displaying the value:

```bash
# If using cPanel UI, the variable is in cPanel's store, not in .env.
# The app will receive it at startup. No terminal check needed.
```

**Option B — Append to the existing `.env` file:**

Only append. Never overwrite the file — it contains your database credentials.

```bash
# Confirm the file exists before appending:
ls -la ~/seo-audit-webapp/.env

# Append JWT_SECRET:
printf '\nJWT_SECRET=%s\n' "$(openssl rand -hex 32)" \
  >> ~/seo-audit-webapp/.env

# Confirm it was added without displaying the value:
[ "$(grep -c '^JWT_SECRET=.' ~/seo-audit-webapp/.env)" -ge 1 ] \
  && echo "JWT_SECRET: added" \
  || echo "Failed to add JWT_SECRET"
```

> **Important:** If you generate a new `JWT_SECRET`, all currently
> active sessions will be invalidated when the app restarts. Users will need
> to log in again. This is expected and acceptable.

---

## Phase 4 — Backup `[cPanel Terminal — Bash]`

Take backups before making any changes to production files.

### Step 4.1 — Backup the backend source files

```bash
BACKUP_DATE=$(date +%Y%m%d)
cp -r ~/seo-audit-webapp/server ~/seo-audit-webapp/server.bak.${BACKUP_DATE}
echo "Backend backed up to: ~/seo-audit-webapp/server.bak.${BACKUP_DATE}"
ls -la ~/seo-audit-webapp/ | grep server.bak
```

### Step 4.2 — Backup the current frontend build

```bash
BACKUP_DATE=$(date +%Y%m%d)
cp -r ~/seo-audit-webapp/build ~/seo-audit-webapp/build.bak.${BACKUP_DATE}
echo "Build backed up to: ~/seo-audit-webapp/build.bak.${BACKUP_DATE}"
ls -la ~/seo-audit-webapp/ | grep build.bak
```

### Step 4.3 — Note the current git commit hash (git checkout only)

```bash
cd ~/seo-audit-webapp && git log --oneline -1
```

Write down this hash. It is the rollback target for the backend if git is used.

---

## Phase 5 — Deploy the backend

Use **5A** if Step 2.1 showed a git checkout. Use **5B** if not.

---

### Phase 5A — Git pull `[cPanel Terminal — Bash]`

```bash
cd ~/seo-audit-webapp
git pull origin main
```

Expected output includes:
```
 server/routes/adminActivityRoutes.js   | ...
 server/routes/adminLeadRoutes.js       | ...
 server/routes/adminSystemRoutes.js     | ...
 server/routes/adminUserRoutes.js       | ...
 server/server.js                       | ...
 server/utils/jwt.js                    | ...
 10 files changed, ...
```

After pull, confirm the production `.env` and uploads are intact:

```bash
# .env still has the database name:
grep "^DB_NAME=" ~/seo-audit-webapp/.env

# uploads directory is untouched:
ls ~/seo-audit-webapp/server/uploads/ | head -5
```

Skip to Phase 6.

---

### Phase 5B — Manual file upload `[cPanel File Manager]`

Upload only the **6 backend files** listed in the release manifest. Do not
upload `.env`, `src/`, `node_modules/`, `server/uploads/`, `server/schema_local.sql`,
or any other file not in the manifest.

**Files to upload and their exact server destinations:**

| Upload this file from Windows | To this path on the server |
|---|---|
| `server\server.js` | `~/seo-audit-webapp/server/server.js` |
| `server\utils\jwt.js` | `~/seo-audit-webapp/server/utils/jwt.js` |
| `server\routes\adminUserRoutes.js` | `~/seo-audit-webapp/server/routes/adminUserRoutes.js` |
| `server\routes\adminActivityRoutes.js` | `~/seo-audit-webapp/server/routes/adminActivityRoutes.js` |
| `server\routes\adminLeadRoutes.js` | `~/seo-audit-webapp/server/routes/adminLeadRoutes.js` |
| `server\routes\adminSystemRoutes.js` | `~/seo-audit-webapp/server/routes/adminSystemRoutes.js` |

In cPanel File Manager:
1. Navigate to the destination directory.
2. Click **Upload**.
3. Select the file from Windows.
4. When prompted to overwrite, confirm **Yes**.

After all 6 files are uploaded, confirm the timestamps updated:

```bash
ls -la ~/seo-audit-webapp/server/server.js
ls -la ~/seo-audit-webapp/server/utils/jwt.js
ls -la ~/seo-audit-webapp/server/routes/adminUserRoutes.js
```

Confirm the B4 fix is in the uploaded file:

```bash
grep -c "requireRole" ~/seo-audit-webapp/server/routes/adminUserRoutes.js
```

Expected: `7` (one per route, plus the import line).

---

## Phase 6 — Deploy the frontend build `[Windows PowerShell + cPanel File Manager]`

The `build/` directory is git-ignored. It must always be uploaded manually
after a local `npm run build`.

**Step 6.1 — Create a zip of the new build `[Windows — PowerShell]`:**

```powershell
Set-Location C:\wamp64\www\seo-audit-webapp
Compress-Archive -Path build\* -DestinationPath build_release.zip -Force
Write-Host "Zip created: $((Get-Item build_release.zip).Length) bytes"
```

**Step 6.2 — Upload and extract `[cPanel File Manager]`:**

1. In cPanel File Manager, navigate to `~/seo-audit-webapp/`.
2. Click **Upload** and select `build_release.zip` from Windows.
3. After upload finishes, right-click `build_release.zip` → **Extract**.
4. Extract into `~/seo-audit-webapp/build/` and confirm overwrite when prompted.

**Step 6.3 — Remove the zip file `[cPanel Terminal — Bash]`:**

```bash
rm ~/seo-audit-webapp/build_release.zip
```

**Step 6.4 — Confirm the new bundle hash `[cPanel Terminal — Bash]`:**

```bash
ls ~/seo-audit-webapp/build/static/js/main.*.js
```

The hash must be different from the value you noted in Step 2.5. If the
filename is unchanged, the wrong build was uploaded.

**Step 6.5 — Remove the local zip `[Windows — PowerShell]`:**

```powershell
Remove-Item C:\wamp64\www\seo-audit-webapp\build_release.zip
```

---

## Phase 7 — Pre-restart checklist `[cPanel Terminal — Bash]`

Run all checks before restarting. Every check must pass.

```bash
# 1. JWT_SECRET is nonblank
[ "$(grep -c '^JWT_SECRET=.' ~/seo-audit-webapp/.env 2>/dev/null)" -ge 1 ] \
  && echo "1. PASS: JWT_SECRET present" \
  || echo "1. FAIL: JWT_SECRET missing — resolve Phase 3 first"

# 2. Startup guard is in the new server.js
grep -q "Refusing to start" ~/seo-audit-webapp/server/server.js \
  && echo "2. PASS: startup guard present" \
  || echo "2. FAIL: startup guard missing — check upload"

# 3. Admin route files have requireRole
grep -q "requireRole" ~/seo-audit-webapp/server/routes/adminUserRoutes.js \
  && echo "3. PASS: adminUserRoutes has requireRole" \
  || echo "3. FAIL: requireRole missing — check upload"

# 4. JWT timing fix is in jwt.js (no module-level SECRET constant)
grep -q "^const SECRET" ~/seo-audit-webapp/server/utils/jwt.js \
  && echo "4. FAIL: old module-level SECRET still present" \
  || echo "4. PASS: JWT timing fix confirmed"

# 5. Database name is unchanged
grep "^DB_NAME=" ~/seo-audit-webapp/.env

# 6. Uploads are intact
ls ~/seo-audit-webapp/server/uploads/ | head -5

# 7. New frontend build hash is present
ls ~/seo-audit-webapp/build/static/js/main.*.js

# 8. No local schema file present
ls ~/seo-audit-webapp/server/schema_local.sql 2>/dev/null \
  && echo "8. ALERT: schema_local.sql found on server — remove it" \
  || echo "8. PASS: no local schema on server"
```

All checks 1–4 and 7–8 must pass. Check 5 must show the production database
name. Check 6 must show your existing uploads.

---

## Phase 8 — Restart the Node.js application `[cPanel Node.js UI]`

1. In cPanel, go to **Software → Node.js** (or Setup Node.js App).
2. Find `seo-audit-webapp` in the application list.
3. Click **Restart**.
4. Wait for the status to return to **Running** (5–15 seconds).

If the status shows **Stopped** or an error indicator, check the startup logs
immediately (Phase 9).

---

## Phase 9 — Startup log check `[cPanel Terminal — Bash]`

```bash
# Try each path — one will contain the most recent output:
tail -30 ~/seo-audit-webapp/logs/stderr.log 2>/dev/null \
  || tail -30 ~/logs/stderr.log 2>/dev/null \
  || tail -30 ~/seo-audit-webapp/stderr.log 2>/dev/null \
  || echo "Log file not found — check cPanel error logs panel"
```

**Expected on successful startup:**
```
✅ MySQL pool initialized successfully
🚀 Server running on http://localhost:<PORT>
✅ Serving React build from: /home/<user>/seo-audit-webapp/build
```

**If the log shows `FATAL: JWT_SECRET is not set. Refusing to start.`:**
The startup guard fired. `JWT_SECRET` is not reaching the process. Return to
Phase 3. After setting the variable, restart again.

**If the log shows a database connection error:**
The `.env` DB credentials may have been modified. Run:

```bash
grep "^DB_NAME=" ~/seo-audit-webapp/.env
```

Compare against the value from Step 2.4. If they differ, restore from the
backup (see Rollback).

---

## Phase 10 — Post-deployment verification

### Browser checks

Open each URL in an incognito window to avoid cached state.

| Check | How | Expected | Status |
|---|---|---|---|
| Audit form renders | Open `https://seomojo.app/seo-audit` | URL input and "Run Your SEO Audit Now" button visible; no blank page | PENDING |
| Audit completes | Enter a real URL, click Run | Results appear after scanning; or form returns with error on failure | PENDING |
| Retry after failure | Kill backend mid-request or use an invalid URL | Form reappears; entered URL is preserved; error message shown | PENDING |
| Rate limit modal | Run two audits from the same IP | Second attempt shows "Free Scan Limit Reached" modal; form restores after dismissal | PENDING |
| Partner page | Open `https://seomojo.app/seo-partner/<slug>` | Branded audit form renders; audit completes | PENDING |
| Admin login | Open `https://seomojo.app/login` and log in with admin credentials | Redirect to `/admin-dashboard`; dashboard loads | PENDING |
| Admin routes locked | Log in as partner; attempt to access admin URL | 403 response or redirect; partner cannot view admin data | PENDING |

Mark each check **PASS** or **FAIL** in the Release Log (Maintenance section)
after completing them.

### Post-restart API spot check `[cPanel Terminal — Bash]`

```bash
# API is responding:
curl -s https://seomojo.app/api/auth/me \
  -H "Authorization: Bearer fake.token.here" \
  | grep -q "Invalid or expired token" \
  && echo "API: responding correctly" \
  || echo "API: unexpected response"

# Admin route requires auth:
curl -s https://seomojo.app/api/admin/users \
  | grep -q "No token provided" \
  && echo "Admin route: auth required" \
  || echo "Admin route: unexpected response"
```

---

## Rollback procedure

Use this procedure if the app does not start, login is broken, the audit
form is blank, or any Phase 10 check fails.

### Backend rollback — deployed files only `[cPanel Terminal — Bash]`

This rolls back only the 6 files deployed in this release. It does not touch
`.env`, the database, `server/uploads/`, or `node_modules/`.

```bash
# Set the backup directory name (replace YYYYMMDD with today's date):
BACKUP=~/seo-audit-webapp/server.bak.YYYYMMDD
DEST=~/seo-audit-webapp/server

cp "$BACKUP/server.js"                      "$DEST/server.js"
cp "$BACKUP/utils/jwt.js"                   "$DEST/utils/jwt.js"
cp "$BACKUP/routes/adminUserRoutes.js"      "$DEST/routes/adminUserRoutes.js"
cp "$BACKUP/routes/adminActivityRoutes.js"  "$DEST/routes/adminActivityRoutes.js"
cp "$BACKUP/routes/adminLeadRoutes.js"      "$DEST/routes/adminLeadRoutes.js"
cp "$BACKUP/routes/adminSystemRoutes.js"    "$DEST/routes/adminSystemRoutes.js"

echo "Backend files restored from $BACKUP"
```

Confirm the rolled-back files no longer have the startup guard:

```bash
grep -q "Refusing to start" ~/seo-audit-webapp/server/server.js \
  && echo "Still new version" \
  || echo "Rolled back successfully"
```

**OR** if using git:

```bash
cd ~/seo-audit-webapp
# Replace HASH with the commit hash from Step 4.3:
git revert HEAD --no-edit
```

### Frontend build rollback `[cPanel Terminal — Bash]`

```bash
BACKUP=~/seo-audit-webapp/build.bak.YYYYMMDD

rm -rf ~/seo-audit-webapp/build
cp -r "$BACKUP" ~/seo-audit-webapp/build
echo "Frontend build restored from $BACKUP"
ls ~/seo-audit-webapp/build/static/js/main.*.js
```

The bundle filename must revert to the hash you noted in Step 2.5.

### Restart after rollback `[cPanel Node.js UI]`

Click **Restart** in the cPanel Node.js panel. Confirm the status returns to
**Running** and repeat Phase 9 to check the startup log.

### JWT_SECRET during rollback

The rolled-back `server.js` does not have the startup guard. If `JWT_SECRET`
is present in the environment, the rolled-back app will use it and existing
sessions will continue to work. Do not change or remove `JWT_SECRET` during
the rollback.

The insecure hardcoded fallback `super_secret_jwt_key` was present in the
previous `jwt.js` and `authMiddleware.js`. After rollback, those files are
restored and the fallback re-enters the codebase. Plan a follow-on release
to redeploy the timing fix as soon as the rollback cause is resolved.

### Cleanup `[cPanel Terminal — Bash]`

Delete backups only after the release has been verified stable (minimum 24 hours):

```bash
rm -rf ~/seo-audit-webapp/server.bak.YYYYMMDD
rm -rf ~/seo-audit-webapp/build.bak.YYYYMMDD
```

---

## Maintenance

### When to update this guide

Update `docs/deployment.md` whenever any of the following changes:

- The startup command, startup file, or Node.js version on the production server
- The list of required environment variables (`JWT_SECRET`, `REACT_APP_*`, `DB_*`)
- The deployment method (git checkout vs file upload)
- The machine used to run the frontend build
- The rollback procedure, as discovered during an actual rollback
- A new npm package is added that requires `npm install` on the server
- The production server or hosting provider changes

After testing and merging a change to this file, add a row to the Release Log.

### Release log

Add a row immediately after completing Phase 10 for each deployment.

| Date | Commit | Deployed by | B4 check | Browser verify | Notes |
|---|---|---|---|---|---|
| 2026-11-25 | pending push | toxickim24 | 6/6 PASS (local) | 5 PASS / 1 SKIP (local pre-verify) | First formal release. B4 fixes verified locally. Local pre-verify: analysis failure (400), 429 (quota hit on 2nd req), PageSpeed null, partner page failure, form retry — all PASS. Rate-limit modal skip: no admin token for /api/clear; 429 confirmed by natural second request. Production browser checks PENDING deployment. |
