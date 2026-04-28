# Lightning McGreen Living — Checkpoint · 2026-04-28 (pre direct-links megaupgrade)

> 🟢 DEPLOYED · production mode (demo banner removed) · build green.
> Live: https://lightning-mcgreen-living.netlify.app
> Repo: https://github.com/Tyrrellkdlemons/lightning-mcgreen-living

Frozen state right before the next slice (property-name-specific apply links,
expanded vehicle inventory, screening-as-redline highlight, filter
improvements, embedded map listing popup, open-source alternatives doc).

## State at this checkpoint
- Demo mode fully removed (banner unmounted, default 'production', LifeBudget swapped to REAL_*)
- 40 real-operator rentals · 16 real-dealer-chain vehicles · 12 real-provider-chain work vehicles
- RotatingBackground reads /backgrounds/manifest.json (sync from `_insertimages/`)
- Topic-matching SVG illustrations + CARTO neighborhood tile per listing
- Apartment apply links route via leasing-portals.ts (RentCafe city search for RentCafe-platform; in-house for Equity/Essex/AvalonBay/Camden/Irvine Co/UDR/Prime/Decron)
- Resolver + ResolvedLink + RedirectScreen + PrepPackets shipped
- ScreeningPanel + ScreeningBadge shipped
- /admin/verify HEAD-probe + manual-verify log shipped
- DemoBanner stubbed (returns null)
- Theme x10 race + gingerbread accents, all original

## Up next (this slice)
1. Property-name-specific apply links via Google site-search fallback
2. Vehicle inventory 16 → 28+
3. Screening highlight: red/yellow/green-flag treatment with "could redline you" warning
4. Accessibility + screening strictness filters on rentals
5. Embedded MapLibre listing-popup on detail pages
6. docs/OPEN_SOURCE_ALTERNATIVES.md
7. Final checkpoint

## Rollback
```powershell
git log --oneline -n 5
git revert <bad-hash>
git push origin main
```
