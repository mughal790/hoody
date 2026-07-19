# HOODY — International Men's Fashion E-Commerce

A production-grade, full-stack e-commerce platform for men's wearables (shirts, pants, hoodies, shoes, jackets) built with React, Express, and Supabase. 50 seeded products across 5 categories, full cart/wishlist/checkout flow, Supabase Auth, and light/dark mode.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS (`/client`)
- **Backend:** Express + TypeScript (`/server`)
- **Database & Auth:** Supabase (Postgres + Row Level Security + Auth)
- **Frontend hosting:** Cloudflare Pages
- **Backend hosting:** Railway
- **Package manager:** npm (npm workspaces are NOT used — this is a single root `package.json`)

## Project structure

```
/
├── client/              # React + Vite frontend
│   └── src/
│       ├── components/   # Reusable UI, layout, product, cart, auth components
│       ├── pages/        # Route-level pages
│       ├── contexts/     # Theme, Auth, Cart, Wishlist providers
│       ├── data/         # Temporary seed product catalog (used until Supabase is wired)
│       └── lib/          # Supabase client, API client, utils
├── server/               # Express API
│   └── src/
│       ├── routes/       # products, categories, cart, orders, wishlist, reviews
│       ├── middleware/   # auth (Supabase JWT), error handling
│       └── lib/          # Supabase service-role client
├── supabase/
│   ├── migrations/       # SQL schema + RLS policies
│   └── seed.sql          # Seed data matching client/src/data/products.ts
├── dist/                 # Build output (gitignored) — dist/public is the frontend build
├── railway.json          # Railway deploy config (backend)
├── Procfile              # Railway/Heroku-style process file
├── wrangler.toml          # Cloudflare Pages config (frontend)
└── .github/workflows/    # CI: typecheck, build, deploy to Cloudflare + Railway
```

## Local development

```bash
npm install
cp .env.example .env   # fill in your Supabase credentials
npm run dev             # runs client (5173) + server (3001) concurrently
```

The frontend proxies `/api` to the backend in dev. In production the two are deployed separately (Cloudflare Pages + Railway) and the frontend calls the backend via `VITE_API_URL`.

## Environment variables

See `.env.example`. You need:

| Variable | Where | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase Auth + client queries |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Backend | Server-side privileged Supabase access |
| `VITE_API_URL` | Frontend | Backend base URL in production (Railway URL) |
| `FRONTEND_URL` | Backend | CORS allow-list (Cloudflare Pages URL) |

The app runs with placeholder Supabase credentials if these are unset — the UI works fully with the local product catalog (`client/src/data/products.ts`), but auth/cart/orders persistence requires real Supabase credentials.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/migrations/001_initial_schema.sql`, then `supabase/seed.sql`.
3. In **Authentication → Providers**, enable Email and (optionally) Google.
4. Copy your Project URL and keys into `.env`:
   - `anon` public key → `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` (backend only, never expose to the client)

## Deploying the backend to Railway

1. Push this repo to GitHub.
2. In Railway, create a new project from the GitHub repo.
3. Railway will read `railway.json` automatically (Nixpacks build, `npm run build:server`, start via `node dist/server/index.js`).
4. Add environment variables in the Railway dashboard: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`, `NODE_ENV=production`.
5. Note the generated Railway URL — you'll need it as `VITE_API_URL` for the frontend build.

## Deploying the frontend to Cloudflare Pages

1. In Cloudflare Pages, create a project from the same GitHub repo.
2. Build command: `npm run build:client`
3. Build output directory: `dist/public`
4. Add environment variables in Cloudflare Pages: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` (your Railway backend URL).

## CI/CD (GitHub Actions)

`.github/workflows/deploy.yml` runs on every push to `main`:
1. Typecheck + build the frontend
2. Deploy `dist/public` to Cloudflare Pages
3. Deploy the backend to Railway via the Railway CLI

Required GitHub repo secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `RAILWAY_TOKEN`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run frontend + backend in dev mode |
| `npm run build` | Build both frontend (`dist/public`) and backend (`dist/server`) |
| `npm run build:client` | Build frontend only |
| `npm run build:server` | Build backend only |
| `npm start` | Run the built backend (serves API; static frontend serving is also wired in for combined deploys) |
| `npm run typecheck` | Typecheck the whole project |
