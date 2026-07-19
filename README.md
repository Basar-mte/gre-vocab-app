# GRE Vocabulary | Goldmine

A flashcard and exam web app for GRE vocabulary practice, with a student portal and an admin portal.

- **Student portal** — flashcards and exams built from whatever sets the admin has loaded. Students can select individual sets, type a range (`1-5, 8, 12-15`), shuffle, and choose how many words to be tested on — for both single sets and combined/multi-set sessions.
- **Admin portal** — create/edit/delete sets and words, bulk-import a CSV, manage users (promote to admin), and see overall activity stats.
- **Theme** — red & white, configured in `src/app/globals.css`.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Prisma](https://www.prisma.io) — SQLite locally, Postgres in production
- [Auth.js / NextAuth v5](https://authjs.dev) — email+password (credentials) login, JWT sessions
- [Zod](https://zod.dev) for validation, [PapaParse](https://www.papaparse.com) for CSV import

## Getting started (local development)

Requires Node.js 20+.

```bash
npm install
npm run db:seed     # creates the SQLite dev DB, demo accounts, and 3 sample sets
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo accounts (also shown on the login page):

| Role    | Email                    | Password       |
| ------- | ------------------------ | -------------- |
| Admin   | `admin@goldmine.app`     | `admin1234`    |
| Student | `student@goldmine.app`   | `student1234`  |

Anyone can also self-register from `/register` — new accounts are created as students; promote them to admin from **Admin → Users**.

The `.env` file is already set up for local SQLite (`DATABASE_URL="file:./dev.db"`). See `.env.example` for the variables needed in any environment.

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

The recommended path is **GitHub → Vercel**, with a hosted Postgres database (SQLite's local file won't persist on Vercel's serverless filesystem).

1. **Push to GitHub** (see below).
2. **Create a Postgres database** — [Neon](https://neon.tech) or [Supabase](https://supabase.com) both have a free tier that works well with Vercel. Copy the connection string.
3. **Switch the Prisma datasource to Postgres**:
   - In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"` under `datasource db`.
   - Regenerate migrations for Postgres (from an empty database, so this is a clean one-time step — see below).
4. **Import to Vercel**: [vercel.com/new](https://vercel.com/new), select the GitHub repo.
5. **Set environment variables** in the Vercel project settings:
   - `DATABASE_URL` — your Postgres connection string
   - `AUTH_SECRET` — generate one with `npx auth secret` or `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your production URL (e.g. `https://your-app.vercel.app`)
6. Add `prisma migrate deploy` as part of the build (e.g. set the Vercel build command to `prisma migrate deploy && next build`, or add a `postinstall`/`vercel-build` script) so the schema is applied to the new database automatically.
7. After the first deploy, run the seed script against production once (`DATABASE_URL=... npm run db:seed`) if you want the demo accounts there too — otherwise just register an account and promote it to admin directly in the production database, or via a one-off script.

### Regenerating migrations for Postgres

The migration history in `prisma/migrations/` was authored against SQLite. Since the production Postgres database starts empty, don't try to replay the SQLite migrations — instead generate one fresh "init" migration from the final schema once the datasource provider is switched to `postgresql`:

```bash
rm -rf prisma/migrations
npx prisma migrate dev --name init   # against a fresh local/dev Postgres instance
```

Then `npx prisma migrate deploy` against the real production database applies that same migration.

## Known non-blocking items

- Next.js 16 has renamed the `middleware.ts` convention to `proxy.ts`; the app still builds and runs correctly with `middleware.ts` (just a deprecation warning in the build log).
- Prisma is intentionally pinned to `6.19.3` rather than the newly-released `7.x`, which changed how the datasource URL is configured (moved out of `schema.prisma` into `prisma.config.ts` + driver adapters). 6.x is fully supported and stable.
