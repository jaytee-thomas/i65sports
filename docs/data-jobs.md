# Data Layer Operations

The hot take experience depends on a few predictable data jobs. This doc lists the manual commands for local dev plus the recurring background tasks we plan to automate for production.

## Local workflow

- `npm run db:migrate` – applies any pending Prisma migrations against the database pointed to by `DATABASE_URL`.
- `npm run db:seed` – clears demo tables and inserts a columnist, fan, sample hot takes, reactions, and reels. Run this after migrations so the hot-take page loads with content.
- `npm run db:reset` – drops and recreates the schema, but **skips** reseeding. Use when you want a blank slate; follow it with `npm run db:seed` if you want demo data back.

All commands rely on the `.env` Postgres connection. Update the URL before running against staging or production.

## Background jobs

| Job | Frequency | Purpose | Notes |
| --- | --- | --- | --- |
| `refresh-hot-take-feed` | Every 5 minutes | Revalidate the `/hot-takes` ISR cache once new takes land. | Implement via a lightweight worker hitting `/api/revalidate?path=/hot-takes`. |
| `sync-columnists` | Nightly | Pull long-form articles + author metadata from your CMS or writer API. | Seed script currently creates a single columnist; replace with CMS import when ready. |
| `expire-flagged-content` | Hourly | Hide any takes/reels/comments marked `FLAGGED` or `REMOVED`. | Use Prisma to set `status` and invalidate related cache paths. |
| `ingest-game-schedule` | Daily | Keep the `Game` table fresh so fan reels can attach to upcoming matchups. | Accepts data from Sportradar/StatsPerform; seed uses a single future Colts game. |

Until a queue/worker is in place, these can run from cron hitting new API routes or calling scripts in `/scripts`. Document any owner or API credentials in 1Password so operators can rotate them easily.
