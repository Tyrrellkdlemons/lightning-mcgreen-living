# GitHub Workflow

## Branching

- `main`     — protected. Only via PR from `develop` or hotfix branches.
- `develop`  — staging branch. PRs land here for QA before promotion.
- `feature/*` — single-feature branches off `develop`.
- `hotfix/*` — emergency fixes off `main`.

## First-time repo setup

```bash
gh repo create lightning-mcgreen-living --public --source=. --remote=origin
git add .
git commit -m "chore: initial scaffold of Lightning McGreen Living"
git push -u origin main
git checkout -b develop
git push -u origin develop
```

## Branch protection (recommended on `main` and `develop`)

- Require PRs
- Require status check: `Lint · Typecheck · Build`
- Require status check: `Brand + Fair Housing scan`
- Require linear history
- Require signed commits (optional)

## CI pipeline

Defined in `.github/workflows/ci.yml`. Runs on every push and PR:

1. **Lint · Typecheck · Build** — `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build`
2. **Brand + Fair Housing scan** — greps for trademarked strings, Fair-Housing-unsafe filter copy, and "guaranteed approval" claims. Fails the build if any are found.

## PR template

`.github/PULL_REQUEST_TEMPLATE.md` enforces a compliance checklist on every change.

## Issue templates

`.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md`.

## Release / deploy

We deploy from `main`. Vercel and Netlify both work — env vars come from `.env.example`.

```bash
# Vercel one-shot
vercel --prod
```
