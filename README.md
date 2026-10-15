# Aion 2 Armory

Fan-made character database + leaderboards for Aion 2 (Global: NA East/West, EU, Asia, LATAM; plus Korea and Taiwan). Unofficial; not affiliated with NCSOFT.

## Status
| Piece | State |
|---|---|
| Next.js frontend (home, search + filters, profile with Equipment/Skills/Stats/Ranks tabs, item + skill modals, sortable URL-shareable leaderboards) | Implemented on **mock data** (`lib/data.ts`) |
| Daevanion and Cosmetics tabs | Placeholder: labeled unavailable |
| Classes + Items pages, character comparison, original SVG icons | Implemented on mock data |
| Skills page, sitemap | Not built yet |
| Prisma schema + ingestion service (`prisma/`, `services/ingest/`) | Implemented, **untested**; not connected to the frontend yet |
| Generic permission-gated HTTP adapter (`services/ingest/src/http-source.ts`) | Plumbing implemented (rate limit, retry, cache, user agent). **Field mapping not done**: needs real sample responses (`mapping.ts`) |
| Frontend reading from the database / live data | Not wired yet (UI still uses `lib/data.ts`) |

## Run the website (no database needed)
```bash
npm install
npm run dev      # http://localhost:3000
```
Deploys to Vercel as-is. Rename the site in `SITE` in `lib/data.ts`.

## Database + ingestion (optional, not wired to the UI yet)
```bash
cp .env.example .env
docker compose up -d
npx prisma migrate dev --name init
npm run db:seed       # fake mock characters
npm test
```

## Next steps
Swap `lib/data.ts` for Prisma queries, add API routes, ranking job, caching, and a real source adapter only after usage rights are confirmed (`SourceAdapter` in `services/ingest/src/adapter.ts`).

## Connecting a live source
1. Set the `SOURCE_*` variables in `.env` (see `.env.example`). `SOURCE_PERMISSION_URL` is required and is stored as the source's terms link.
2. Fill in `mapServers`, `mapSearch` and `mapProfile` in `services/ingest/src/mapping.ts` using real sample responses.
3. Run `npx tsx services/ingest/src/run.ts --source=http`.
Icons: the UI uses original SVG icons. Game icons can be shown later via `Item.iconUrl` once a licensed icon source is confirmed.

## Icons
Default: built-in original vector icons (`components/Icon.tsx`). To show image files instead, add them under `public/icons/` named by slot/type/class (`mainHand.webp`, `helmet.webp`, `ring.webp`, `Active.webp`, `Gladiator.webp` ...) and set `NEXT_PUBLIC_ICON_BASE=/icons` (in Vercel: Settings → Environment Variables). Missing files fall back to the vector icon. Per-item icons come from `iconUrl` once a real data source is mapped. Only use icons you have the right to use, and keep any attribution the license requires.
