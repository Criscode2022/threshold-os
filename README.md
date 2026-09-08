# Threshold

**The operations desk for licensed childcare and after-school programs.**

Know who is in the room — and who may walk them out. Threshold is a production-ready operations system for directors and lead teachers: live attendance, staff-to-child ratios against license, authorized pickup with a PIN, incident records, daily notes, and a waitlist that becomes enrollment without retyping the family.

| Layer | Stack |
|---|---|
| Web | Angular 19, standalone APIs, Tailwind CSS 4 |
| API | NestJS 11, JWT httpOnly cookies, Zod validation |
| Data | Neon Postgres (serverless) with a local Postgres fallback |
| Tests | NestJS unit + e2e-style service tests |

## Why it exists

Afternoon pickup is fifteen minutes. Paper binders and shared spreadsheets fail the two questions a licensed program must answer without hesitation:

1. Who is still in the building, and is this room within ratio?
2. Is this adult allowed to take this child?

Threshold is that board, plus the licensing trail that survives the evening.

## Product surface

- **Today** — present headcount, room ratios, unnotified incidents, activity
- **Door** — check-in and PIN-gated release to a named guardian
- **Roster** — enrolled children with allergy and medical flags
- **Rooms** — licensed adult:child ratio vs live occupancy
- **Incidents** — injury / behavior / medication with parent-notification state
- **Notes** — meals, naps, mood, end-of-day journal
- **Waitlist** — ranked intake; one action to enroll
- **Center** — license file and staff roster

A **Load sample center** action seeds Willow Grove After-School (Barcelona), a complete afternoon with rooms, twelve enrolled children, four waitlist families, open attendance, and an incident trail — so a director can evaluate the desk in under a minute.

## Architecture

```
apps/web   Angular SPA  →  /api/*  →  apps/api NestJS  →  Neon Postgres
```

Every query is scoped through `center_members.user_id`. The API never trusts a client-supplied user id. Pickup release requires a PIN that matches an authorized guardian on that child.

## Local development

```bash
git clone https://github.com/Criscode2022/threshold-os.git
cd threshold-os
cp .env.example .env          # set DATABASE_URL and JWT_SECRET
npm install
npm run migrate
npm run dev:api               # Nest on :3000
npm run dev:web               # Angular on :4200, proxies /api
```

Open http://localhost:4200, create a director account, then **Load sample center**.

### Database

Set `DATABASE_URL` to a [Neon](https://neon.tech) connection string (pooled) or any Postgres 15+. Migrations live in `migrations/` and are idempotent.

```
DATABASE_URL=postgresql://user:pass@host/neondb?sslmode=require
JWT_SECRET=generate-a-long-random-string
```

## Tests

```bash
npm test
```

Coverage includes password hashing, PIN authorization (reject unknown PIN, accept named guardian), ratio arithmetic, and center membership isolation.

## Production

- Build: `npm run build`
- API is a standard NestJS Node server (`node dist/main.js`)
- Web is a static Angular bundle (`apps/web/dist/web/browser`)
- Deploy API to a Node host or Vercel serverless; point the SPA at the same origin `/api`
- Provision Neon and run `npm run migrate` against `DATABASE_URL`

This repository is the canonical Angular + NestJS + Neon + Tailwind implementation of Threshold.

## License

MIT
