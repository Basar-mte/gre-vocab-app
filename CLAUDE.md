@AGENTS.md

# Project: GREasy

Next.js 16 (App Router) + TypeScript + Tailwind v4 + Prisma (Postgres via Neon, provisioned through Vercel's Storage tab) + NextAuth v5 (Auth.js, credentials + JWT sessions). Live at <https://greasy.vercel.app>, deployed via GitHub → Vercel (auto-deploys on push to `main`).

- Student portal: flashcards and exams built from admin-managed vocabulary sets. Students pick sets (checkbox grid + free-form range like `1-5, 8`), shuffle, and a word count; exams add direction (word→meaning / meaning→word / mixed) and format (multiple choice / typed).
- Admin portal (`/admin`, role-gated): CRUD for sets/words, CSV bulk import, user management, activity stats.
- Auth: `src/auth.ts` (NextAuth v5), route protection in `src/middleware.ts` (defense in depth: middleware + `requireUser`/`requireAdmin` in `src/lib/session.ts` on every protected layout/page).
- Core exam logic lives in `src/lib/exam.ts` (shuffling, MCQ distractor generation, direction resolution) and `src/lib/sets.ts` (parsing `"1-5, 8, 10-12"` style range strings).
- Prisma schema: `prisma/schema.prisma`. Seed script: `prisma/seed.ts` (`npm run db:seed`) — creates demo admin/student accounts and 3 sample sets with real, independently-written definitions (not scraped from any external source).

Pinned Prisma to 6.19.3 (not 7.x) deliberately — Prisma 7 changed the datasource-in-schema config model (`prisma.config.ts` + driver adapters) and that surface wasn't worth the risk for this build. Don't upgrade without checking `https://pris.ly/d/major-version-upgrade` first.
