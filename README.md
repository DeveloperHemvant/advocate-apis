# NewAdv API (Express + Prisma + Postgres)

This backend uses the **shared Postgres** instance for the whole project (see repo root `UNIFIED_DATABASE.md`). Schema: `public`.

## Quick start (dev)

1) Start Postgres:

```bash
cd backend
docker compose up -d
```

2) Create env file:

- Copy `.env.example` to `.env` and adjust values if needed.

3) Run migrations + seed admin:

```bash
npx prisma migrate dev
npm run prisma:seed
```

4) Start API:

```bash
npm run dev
```

API runs on `http://localhost:4000` by default.

## Main endpoints

- `POST /api/auth/register` (advocate onboarding)
- `POST /api/auth/login` (advocate login; supports email or phone via `emailOrPhone`)
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/advocates/me`
- `PUT /api/advocates/me`

Admin:

- `POST /api/admin/login`
- `GET /api/admin/advocates`
- `PATCH /api/admin/advocates/:id/status`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`

