# Idea Board

A simple, anonymous idea board with upvotes. Production-ready REST backend (Express + Postgres) and a responsive Next.js frontend with Tailwind/shadcn-like UI.

## Architecture Overview

- Frontend: Next.js (Pages router), Tailwind CSS, minimal shadcn-style components.
- Backend: Node.js (Express), `pg` pool, REST API, structured logging, rate limiting.
- Database: PostgreSQL (Supabase-compatible), SQL migrations.
- Containerization: Dockerfiles per service; `docker-compose` orchestrates DB, backend, frontend.
- Concurrency: Atomic upvote via `UPDATE ideas SET upvotes = upvotes + 1 ...`.
- Resilience: Health check, graceful shutdown, basic rate limiting, DB readiness in migrations.

### Data Model
`ideas(id serial pk, text text(≤280), upvotes int default 0, created_at timestamptz, updated_at timestamptz)`

## Local Development (Docker Compose)

Prereqs: Docker Desktop

Start all services:
```bash
docker-compose up --build
```

Services:
- DB: Postgres on `localhost:5432` (volume-backed; migrations applied on backend start)
- Backend: `http://localhost:4000` (health: `/api/health`)
- Frontend: `http://localhost:3000`

Common commands:
```bash
# Tail logs
docker-compose logs -f backend

# Rebuild a single service
docker-compose build backend && docker-compose up backend
```

## Manual Run (without Compose)
```powershell
# Start DB only
docker-compose up -d db

# Run migrations + backend locally
cd backend
$env:DATABASE_URL="postgres://postgres:postgrespassword@localhost:5432/ideaboard"
node scripts/migrate.js
npm start

# Frontend
cd ../frontend
npm run dev
```

## API Documentation

Base URL: `http://localhost:4000/api`

- POST `/ideas`
  - Body: `{ "text": "Short idea text up to 280 chars" }`
  - 201: `{ success, data: { id, text, upvotes, created_at } }`

- GET `/ideas?limit=20&offset=0&sort=newest|popular`
  - 200: `{ success, data: [ { id, text, upvotes, created_at }, ... ] }`

- POST `/ideas/:id/upvote`
  - 200: `{ success, data: { id, upvotes } }`

- GET `/health`
  - 200: `{ status: 'ok', db: 'ok' }`

## Trade-offs & Notes

- Simplicity over complexity: polling + re-fetch instead of websockets.
- `pg` over `supabase-js` server-side for atomic increments and performance.
- In-memory rate limiting (per-node). For distributed setup, use Redis.
- SQL migrations via simple script; swap to `node-pg-migrate` if needed later.

## Kubernetes Manifests (basic)

See `k8s/` folder for example manifests. Adjust image names, secrets, and domain for your environment.

### Apply
```bash
kubectl apply -f k8s/
```

