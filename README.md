# i65 Sports — MVP Starter

This is a minimal Next.js 14 starter for i65 Sports with:
- App Router, Tailwind, dark theme
- Pages: Highlights (home), Hot Takes (recorder), Fan Reels (uploader), Columnists (stub)
- Odds ticker (demo data from `/api/odds`)
- Prisma schema for Users, Hot Takes, Replies, Articles, Games, Fan Reels

## Quickstart

```bash
# 1) Unzip, cd in, and install deps
cd i65sports
npm install

# 2) Create your .env from the example
cp .env.example .env

# 3) Start a local Postgres (or use Neon/Supabase) and update DATABASE_URL
# Example Docker:
# docker run --name i65-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16

# 4) Apply prisma migrations & seed demo content
npm run db:migrate
npm run db:seed

# 5) Run dev
npm run dev
```

## Next steps
- Swap demo auth keys with live ones in production environments.
- Implement real video upload using Cloudflare Stream or Mux.
- Build `/api/takes`, `/api/replies`, `/api/reels/upload-url` endpoints to handle uploads + DB writes.
- Replace the demo `gameId` in Reels with a real `Game` row (seed script).
- Replace odds demo with a real provider (cache results 30–60s).
- Move background feed refresh into a scheduled worker (see `docs/data-jobs.md`).

Happy building! 🚀
