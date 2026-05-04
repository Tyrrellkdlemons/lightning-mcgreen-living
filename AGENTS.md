# AGENTS.md — Codex + Claude coordination notes

This repo is worked on by **two AI agents** alternately:

- **Codex** (ChatGPT, GPT-5 / GPT-5.5) — heavy lifting on file changes,
  background dev server, validation runs.
- **Claude** (Cowork desktop) — file edits, cross-file checks, doc and
  data sync.

Both agents must follow these rules so neither overwrites the other's work.

## 1. Read before you write

Before editing anything, the agent should:

1. Read `docs/APT_LINKS.md` to confirm the canonical 1–79 ranked list.
2. Read the most recent `CHECKPOINT_*.md` at repo root to see what was
   last shipped.
3. Read `src/lib/data/workbook-ranked-listings.ts` and
   `src/lib/data/generated/workbook-ranked-listings.json` for the live
   data shape — never invent fields, only extend.

## 2. Don't break existing engine wiring

The Apartment Apply Engine page (`/apartments/apply-engine`) is wired to:

- `src/components/rentals/ApartmentApplyEngine.tsx`
- `src/lib/data/workbook-ranked-listings.ts`
- `src/lib/data/generated/workbook-ranked-listings.json`
- `src/lib/search/index.ts` (workbook indexed under `Workbook` result type)
- `src/components/rentals/RentalSearch.tsx` (workbook source-links panel)
- `src/components/shell/BottomNav.tsx` (mobile 5-tab nav)
- `src/app/api/maps/streetview/route.ts` (street-view + satellite fallback)
- `src/components/maps/MapPanel.tsx` (CARTO / Esri / MapTiler / Mapbox switcher)

If you touch any of these, run a typecheck and confirm `/apartments/apply-engine`,
`/rentals`, and `/work-vehicles` still return HTTP 200.

## 3. Workbook ingest is reproducible

The 79 ranked listings are produced by:

```bash
npm run import:workbook
```

which runs `scripts/import-ranked-workbook.py`. That script is the source
of truth for the JSON. If you change ranks/URLs in `docs/APT_LINKS.md`,
also update the script's input data and re-run it so the JSON regenerates.

Verified state (2026-05-04):

- 79 listings in JSON, ranks 1–79 contiguous.
- Property name + city + source URL match `docs/APT_LINKS.md` for all 79.

## 4. Mobile / PWA defaults are non-negotiable

Codex hardened the mobile experience on 2026-05-04. Don't regress:

- safe-area handling on layout (`src/app/layout.tsx`).
- 5-tab bottom nav including Apply Engine (`BottomNav.tsx`).
- extra bottom padding so content isn't hidden behind nav.
- reduced heavy background effects on mobile (rain/parallax tuned).
- PWA manifest (`public/manifest.json`).

When adding a new feature, mobile-first it: assume 360px wide, finger-tap targets,
tight typography. Test by resizing dev viewport before declaring "done".

## 5. Checkpoints before risky changes

Before any large refactor or schema rename:

1. Create `CHECKPOINT_<date>_<slug>.md` at repo root summarizing what's
   currently working.
2. (Optional) Drop a zip backup under `checkpoints/<date>_<time>/`.

## 6. Validation gates

Before saying "done", every agent should run:

```bash
npm run typecheck
npm run lint
node scripts/verify-links.mjs --probe --limit=10
```

The only allowed pre-existing warning is the `<img>` warning in
`PhotoGallery.tsx` (Codex flagged this, not in scope to fix yet).

## 7. Communication trail

Each agent should leave a one-line entry in `CHECKPOINT_<date>.md` (or
create one) when finishing a session, listing files touched + what was
verified. The next agent reads it before starting.

---

_Last updated 2026-05-04 by Claude (cowork). Codex authored the engine,
mobile nav, map providers, and street-view route in earlier sessions._
