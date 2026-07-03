# Ariana — Fashion E-commerce

Landing page + storefront + admin PWA.

## Stack
- Next.js (App Router) + TypeScript + Tailwind v4
- Supabase (Postgres + Storage) — project "Petty petty project"
- Fonts: Clash Display (display/logo) + General Sans (UI/body) via Fontshare

## Structure
- `app/page.tsx` — landing page (Hero, Lookbook, ProductGrid, CraftSection, Footer)
- `components/Hero.tsx` — auto-crossfading video hero, wordmark overlay, live dominant-color background
- `hooks/useScrollReveal.ts` — the locked scroll-animation spec (one-time reveal, 15-25% threshold, staggered)
- `app/admin/*` — admin PWA (products, hero video upload workflow, orders)
- `supabase/schema.sql` — full DB schema + RLS policies

## Setup
1. Copy `.env.example` to `.env.local` and fill in real Supabase keys
   (Project Settings → API in the Supabase dashboard for "Petty petty project").
2. Run `supabase/schema.sql` in the Supabase SQL Editor (or via the connector once access is approved).
3. Create a public Storage bucket named `hero-videos`.
4. `npm install && npm run dev`

## Hero videos
No real clips yet — `app/page.tsx` points at placeholder paths in
`public/videos/`. Generate clips per the AI video prompt already discussed,
then either drop files directly in `public/videos/` or use `/admin/hero`
to upload, auto-crop for mobile, extract the dominant color, and publish
to Supabase.

## Admin PWA
Installable at `/admin` (manifest + service worker scoped to that route).
Icons are placeholders (`public/admin-icon-*.png`) — swap for the real logo
whenever it's ready.
