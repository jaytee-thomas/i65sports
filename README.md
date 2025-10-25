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

# 4) Prisma generate & migrate
npx prisma generate
npx prisma migrate dev --name init

# 5) Run dev
npm run dev
```

## Next steps
- Wire Clerk auth: wrap layout with `<ClerkProvider>` and add sign-in/out.
- Implement real video upload using Cloudflare Stream or Mux.
- Build `/api/takes`, `/api/replies`, `/api/reels/upload-url` endpoints to handle uploads + DB writes.
- Replace the demo `gameId` in Reels with a real `Game` row (seed script).
- Replace odds demo with a real provider (cache results 30–60s).

Happy building! 🚀
