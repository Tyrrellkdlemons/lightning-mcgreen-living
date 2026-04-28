# Launch Checklist

## Engineering

- [ ] `npm run typecheck` clean
- [ ] `npm run lint` clean
- [ ] `npm run build` clean
- [ ] No `TODO(prod)` left in tree (`grep -r "TODO(prod)"`)
- [ ] All `src/lib/data/demo-*` excluded by `NEXT_PUBLIC_DATA_MODE=production`
- [ ] `ADMIN_SHARED_SECRET` set to a random 32-char value (not the default)
- [ ] `DATABASE_URL` configured if using Postgres
- [ ] PWA manifest validated, icons in `/public/icons/`
- [ ] Service worker registered and offline page renders

## Performance (Lighthouse target ≥ 95)

- [ ] LCP under 2.5s on a slow 4G profile
- [ ] CLS = 0 on home, search, detail pages
- [ ] No animated raining objects when `prefers-reduced-motion`
- [ ] Map and image-heavy components are lazy-loaded
- [ ] Routes are code-split (default with App Router)
- [ ] No blocking JS in `<head>`

## Accessibility (WCAG 2.1 AA)

- [ ] Keyboard tab order logical on every page
- [ ] Visible focus rings on every interactive element
- [ ] Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text/icons
- [ ] All images have meaningful `alt`
- [ ] All form fields have `<label>` (or `aria-label`)
- [ ] Reduce-motion toggle works and persists

## Compliance

- [ ] No filter or copy that touches a Fair Housing protected class
- [ ] All listings show source + last verified
- [ ] All promos labeled `Publicly verified` or `Needs verification`
- [ ] No "guaranteed approval" language anywhere
- [ ] No SSN/bank-credential collection
- [ ] Disclaimers present on all detail pages
- [ ] Brand do-not list reviewed (no Cars/NASCAR/Zillow lookalikes)

## SEO + share

- [ ] Per-page `<title>` and `<meta description>`
- [ ] Open Graph + Twitter card defaults
- [ ] `sitemap.xml` and `robots.txt` published
- [ ] Canonical URLs set

## Security

- [ ] All API keys server-side only (never `NEXT_PUBLIC_` for secrets)
- [ ] Rate limiting on `/api/*` endpoints
- [ ] CSP header set (in `next.config.mjs`)
- [ ] Admin route protected (token + IP allowlist optional)
- [ ] Logging redacts user PII

## Deploy

- [ ] Vercel/Netlify env vars match `.env.example`
- [ ] Preview deploy + smoke test passes
- [ ] DNS + HTTPS configured
- [ ] Error monitoring (Sentry or similar) attached
