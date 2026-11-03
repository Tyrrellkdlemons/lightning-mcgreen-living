# City coverage and evidence refresh

Status: RELEASE CANDIDATE. User authorizes notebook, GitHub and existing Netlify publication. No new spending, account/security expansion, resident data, applications or outreach.

Root codex/01a1a12d/city-expansion-root is integrator. Branch feat/all-city-housing-refresh from a2dfb0fca06f472adcf42fb82cdbfd3b99342127. PR https://github.com/Tyrrellkdlemons/lightning-mcgreen-living/pull/5. Canonical79 workbook and original203-source audit preserved.

Delivered: Census2026 registry2089 CA/AZ places (CA1622, AZ467), including every incorporated city/town and Census-designated place; county lookup73. New /homes rent/buy search, city suggestions, state/county/type/beds/price/evidence/photo/sort filters, saved/shareable searches, city-specific provider links and36 sourced HomePath sale observations. Geography coverage is not complete listing inventory.

Evidence:232-source catalog229 content-inspected and3 unresolved original destinations with labeled related alternatives;9 of12 originals recovered (5 cached-content recoveries disclosed).151 rental communities,4 fresh operator feeds with12 sampled available-now units plus future samples;2 Union South Bay floor-plan advertisements. Operator advertising does not prove physical vacancy. Ten newly visually inspected photographs (ArLo4 and two sale homes3 each), publisher-hosted with consent/source labels. Other sampled sale thumbnails are not individually inspected. Freshness expires after48h.

Dependencies: Next16.4.5, React19.3.1, MapLibre6.16.0, Zod4.6.7, ESLint9.39.5, Node24. Production audit0 vulnerabilities; development15 moderate,0 high/critical. React19 migration fixes storage hydration, clock/media subscriptions, keyed pagination, search aborts, photo lifecycle and route request APIs. Independent reviewer confirmed pagination/photo corrections. Map fixtures19PASS, photo fixtures29PASS, mobile fixtures22PASS; location14PASS; property/source/city regressionsPASS. Local lint/typecheck and exact39a578c CI/full builds/preview PASS. Existing PhotoGallery img performance warning remains.

Chrome preview verification:360/390px phones,768px tablet,1024px landscape and1440px desktop; city keyboard selection, numeric filters, saved search immediate update, publisher photos, honest empty results, state/county sync and reduced motion. MapLibre street/satellite/dark rendered with source credits. Required routes and10 workbook source probes HTTP200. Physical phones/tablets, assistive technologies and full WCAG conformance untested.

Final preview found real Netlify durable-cache collision: San Tan Valley API returned a cached Phoenix response because framework Netlify-Vary omitted q/state. Route now uses force-dynamic and explicit browser/CDN/Netlify no-store plus query variation. Executable route regression covers distinct queries, state constraints and empty responses. Must verify corrected exact-head preview/CI before merge.

Notebook: three current sources imported and full text read back (232-source catalog v4,2089-place Census registry,151-community/36-sale property evidence v5 literal JSON). Previous versions retained/deselected. Gemini performed source-consistency synthesis, not independent live verification. Receipt .revamp-evidence/city-expansion-root/notebook-import-receipt.json.

Remaining release steps: exact candidate CI/preview cache regression; merge PR5; observe production receipt linked to merge SHA; live workflows/API/provider statuses; add notebook final release note. Final release receipt lives in .revamp-evidence/city-expansion-root/DELIVERY.json and merged PR body. Production not yet claimed here.

Ownership: root final-release claim tracked by shared registry; no local heavy jobs. Worker recovery-regression claim d93d4371992c42a3b16b10aa5a27503f preserved (two completed source regression files; worker hit quota before release). No other agent may release it. Root releases only own claim after final writes. Review_ui and locations implementation scopes handed off; no running children.
