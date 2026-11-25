# SEO Mojo

Free SEO audit web application. Live at **https://seomojo.app**.

## Local development

```bash
# Install dependencies (repo root and server/)
npm install
cd server && npm install && cd ..

# Copy .env.example to .env and fill in values
cp .env.example .env

# Start frontend (port 3000) and backend (port 5000) together
npm run dev
```

Frontend: http://localhost:3000/seo-audit  
Backend API: http://localhost:5000/api/

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts React dev server and Express API concurrently |
| `npm start` | React dev server only (port 3000) |
| `node server/server.js` | Express API only (port 5000) |
| `npm run build` | Production React bundle → `build/` |

## Deployment

See **[docs/deployment.md](docs/deployment.md)** for the full step-by-step
production deployment runbook, including release manifest, pre-restart
checklist, rollback procedure, and release log.

**Quick reference:**

1. Apply and test code changes locally.
2. Build the React frontend on Windows: `npm run build`
   (`REACT_APP_API_URL` and `REACT_APP_PAGESPEED_KEY` must be set in `.env`).
3. Push to GitHub.
4. On the production server: `git pull origin main` (or upload individual files).
5. Upload the new `build/` directory via cPanel File Manager.
6. Confirm all pre-restart checks pass, then click **Restart** in the cPanel
   Node.js panel.

## Environment variables

The `.env` file at the repository root is git-ignored. Copy `.env.example`
and fill in values. Backend variables (`DB_*`, `JWT_SECRET`, `OPENAI_API_KEY`,
`EMAIL_*`) are read at server startup. Frontend variables (`REACT_APP_*`) are
baked into the bundle at build time and are not read at runtime.

Production `JWT_SECRET` must be set before starting the server. The backend
will refuse to start if this variable is absent or blank.

## Project structure

```
seo-audit-webapp/
├── src/              React frontend source
├── server/           Express API
│   ├── routes/       API route definitions
│   ├── controllers/  Request handlers
│   ├── middleware/   Auth, rate-limit, logging
│   └── services/     SEO analysis modules
├── build/            Production React bundle (git-ignored; built locally)
├── docs/             Project documentation
│   └── deployment.md Production deployment runbook
└── .env              Local environment variables (git-ignored)
```
