# Expo Scanner (PWA)

Next.js 14 PWA for scanning exhibition booths and extracting company info with AI (Gemini). Data and images are stored in Supabase.

## Run locally

**Prerequisites:** Node.js 18+

1. Install dependencies: `npm install`
2. Copy env: `cp .env.example .env.local`
3. Set in `.env.local`:
   - `GEMINI_API_KEY` — Gemini API key (server-only)
   - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
4. Run: `npm run dev` → open [http://localhost:3000](http://localhost:3000)

## PWA

- Installable (manifest + icons). Offline: service worker caches the app shell so the app opens without network.
- Replace `public/icon-192.png` and `public/icon-512.png` with your own icons if desired (generated from `public/placeholder.svg`).

## Project layout

- **Root** — Next.js App Router app: `app/`, `components/`, `lib/`, `public/`
- **legacy/** — Original Vite/React prototype (reference only; not run as part of the app)
- **supabase/** — SQL migration and [setup instructions](supabase/README.md) for tables and Storage bucket

## Implementation plan

See [.cursor/plans/expo_scanner_pwa_implementation_42390188.plan.md](.cursor/plans/expo_scanner_pwa_implementation_42390188.plan.md) for the full PWA implementation plan.
