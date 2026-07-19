# GREasy

A flashcard and exam web app for GRE vocabulary practice, with a student portal and an admin portal.

- **Student portal** — flashcards and exams built from whatever sets the admin has loaded. Students can select individual sets, type a range (`1-5, 8, 12-15`), shuffle, and choose how many words to be tested on — for both single sets and combined/multi-set sessions.
- **Admin portal** — create/edit/delete sets and words, bulk-import a CSV, manage users (promote to admin), and see overall activity stats.
- **Theme** — red & white, configured in `src/app/globals.css`.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Prisma](https://www.prisma.io) — Postgres (see "Local development" below for why SQLite was dropped)
- [Auth.js / NextAuth v5](https://authjs.dev) — email+password (credentials) login, JWT sessions
- [Zod](https://zod.dev) for validation, [PapaParse](https://www.papaparse.com) for CSV import

## Getting started (local development)

Requires Node.js 20+ and a Postgres connection string (the schema targets `postgresql` only — see below).

```bash
npm install
npm run db:seed     # applies the schema and creates demo accounts + 3 sample sets
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo accounts (also shown on the login page):

| Role    | Email                    | Password       |
| ------- | ------------------------ | -------------- |
| Admin   | `admin@greasy.app`       | `admin1234`    |
| Student | `student@greasy.app`     | `student1234`  |

Anyone can also self-register from `/register` — new accounts are created as students; promote them to admin from **Admin → Users**.

### Getting a local `DATABASE_URL`

This project started on SQLite and switched to Postgres-only once it was deployed (Prisma only supports one datasource provider per schema, and Vercel's serverless filesystem can't persist a SQLite file). To develop locally:

1. Open the Vercel dashboard → **gre-vocab-app-c8qg** project → **Settings → Environment Variables**.
2. Copy the `DATABASE_URL` and `DATABASE_URL_UNPOOLED` values (from the connected Neon database) into your local `.env` yourself — paste them in directly rather than running `vercel env pull`, since some sandboxed environments scrub secret-shaped values written to disk by an agent.
3. `.env` already has placeholders for both; see `.env.example`.

This means local dev currently talks to the same Neon database as production. For a separate dev database, create a Neon branch (Neon dashboard → your project → Branches) and use its connection string locally instead.

## Loading your real word sets

The seed script only creates 3 small sample sets (60 words total, clearly labeled "Sample Set 1/2/3") so the app is usable out of the box. To load your real 30 sets:

1. Sign in as an admin and go to **Admin → CSV import**.
2. Download the sample CSV there for the exact column layout, or export your own spreadsheet with these columns:
   - `set_number` (required) — 1, 2, 3, … 30
   - `term` (required)
   - `meaning` (required)
   - `set_title` (optional) — used only when a set number doesn't exist yet
   - `part_of_speech`, `example`, `synonyms` (all optional)
3. Upload the CSV. Sets are created automatically for any `set_number` that doesn't exist yet. Re-uploading a corrected file is safe — a term that already exists in the same set gets updated instead of duplicated.

You can also manage sets/words one at a time from **Admin → Sets & words**.

## How exams and flashcards work

- **Set selection** is shared UI (`src/components/set-selector.tsx`) used by both flashcards and exam setup: a checkbox grid of every set that exists, plus a free-form range box (`1-5, 8, 12-15`) that adds to the selection — so single sets, ranges, and arbitrary combinations all work the same way.
- **Flashcards** (`/flashcards`) are stateless — no database write, just a client-side deck with flip animation, shuffle, keyboard nav (space to flip, ← → to move), and "known/unsure" tracking for the session.
- **Exams** (`/exam`) persist an `ExamAttempt` + one `ExamAnswer` row per question at creation time (so the exact question set is stable even if someone edits the source words mid-attempt), support **Word→Meaning**, **Meaning→Word**, or **Mixed** direction, and **multiple choice** (auto-generated distractors from the rest of the word bank) or **typed** answers. Results and full history are under `/history`.

## Project structure

```text
prisma/schema.prisma       Data model (User, VocabSet, Word, ExamAttempt, ExamAnswer)
prisma/seed.ts             Demo accounts + sample sets
src/auth.ts                NextAuth v5 config (credentials provider, JWT sessions)
src/middleware.ts          Route protection (login required / admin-only routes)
src/lib/session.ts         requireUser() / requireAdmin() helpers for server components & actions
src/lib/exam.ts            Shuffling, MCQ distractor generation, direction resolution
src/lib/sets.ts            "1-5, 8, 12-15" range-string parsing
src/components/            Shared UI: set selector, top nav, confirm-submit button
src/app/(portal)/          Everything behind login: dashboard, flashcards, exam, history, admin/*
```

## Deploying

Live at **<https://greasy.vercel.app>**, deployed via **GitHub → Vercel** with a Neon Postgres database (installed through Vercel's Storage tab, which wires up `DATABASE_URL` etc. automatically). Every push to `main` redeploys automatically through the Git integration.

How it's wired up:

- **Database**: Vercel project → **Storage** tab → Neon Postgres. This sets `DATABASE_URL` (pooled, used by the app at runtime) and `DATABASE_URL_UNPOOLED` (direct connection, used for schema pushes) as encrypted project env vars automatically.
- **Schema sync**: there's no `prisma/migrations` folder — `vercel.json`'s `buildCommand` runs `prisma generate && prisma db push --accept-data-loss && prisma db seed && next build` on every deploy. `db push` and the seed script are both idempotent, so this is safe to run repeatedly, but it also means a destructive schema change (e.g. dropping a column with existing data) would apply without a confirmation prompt — fine for a small project, worth knowing before scaling this up.
- **Auth**: `AUTH_SECRET` and `NEXTAUTH_URL` are set as project env vars (Production/Preview/Development). Generate a new secret with `npx auth secret` or `openssl rand -base64 32` if you ever need to rotate it.

To redeploy manually instead of waiting for a push: `vercel --prod` (requires `vercel login` and `vercel link` once per machine).

## Known non-blocking items

- Next.js 16 has renamed the `middleware.ts` convention to `proxy.ts`; the app still builds and runs correctly with `middleware.ts` (just a deprecation warning in the build log).
- Prisma is intentionally pinned to `6.19.3` rather than the newly-released `7.x`, which changed how the datasource URL is configured (moved out of `schema.prisma` into `prisma.config.ts` + driver adapters). 6.x is fully supported and stable.
