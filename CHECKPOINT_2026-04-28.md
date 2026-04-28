# Lightning McGreen Living — Checkpoint 2026-04-28

Pointer to the canonical checkpoint at [`docs/CHECKPOINT.md`](./docs/CHECKPOINT.md).

## Snapshot
- **Phase:** post-research upgrade complete
- **Mode:** demo (production refuses unverified listings)
- **Branch convention:** main ← develop ← feature/*
- **Deploy targets ready:** Netlify (default) + Vercel
- **Next:** push to GitHub via `gh repo create` and run `netlify deploy --prod`

## What's new since the initial scaffold
- County assistance overlay (LA ERRP reopened 2026-02-09, OCHA 2026 forms,
  Riverside DPSS Housing Support, San Bernardino court help, statewide CalWORKs)
- Source-of-income notice + adverse-action letter generator
- Auto-loan hardship card (CFPB / FTC / CA BAR / DFPI)
- Printable letter templates: lease extension, auto hardship, county packet
- MapLibre + CARTO Voyager basemap (no Google Maps key required)
- Open-source workarounds: CA SOS bizfile, CA DMV Occupational License,
  Yelp Fusion (free tier), Nominatim, NHTSA Safety + Recalls, Open Charge Map,
  SoCal transit feeds (LA Metro, Metrolink, OCTA)
- Netlify + Vercel deploy configs + push-and-deploy scripts (sh + ps1)

See [`docs/CHECKPOINT.md`](./docs/CHECKPOINT.md) for the full inventory.
