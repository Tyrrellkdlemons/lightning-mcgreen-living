# Media, authenticated publishing and assistant upgrade

## Objective and authorization
The user requests workarounds for missing authenticated photo publishing, accurate property imagery/availability evidence, and live Gemini chat. Updating the existing GitHub repository and Netlify production site is specifically authorized. Preserve all79 workbook records and existing capabilities. Do not invent property images, vacancies or eligibility; no new purchases, auto-topup, account changes or public upload access.

## Current implementation
Base `ab6c585a451a032a18a1cd1d2c7a3652084de2ca`, branch `feat/evidenced-media-assistant`. Canonical root on verified T: MAIN VOL (volume52f102ab-1410-4a79-b919-7439eed688c1). Root is Git/Netlify/browser integrator; four-agent maximum, no delegated heavy jobs or browser activity.

M1: 10 exact communities /13 canonical IDs,10 official gallery links,3 YouTube player candidates,6 Matterport external tours. One selected-unit observation and two plan-count observations; seven explicitly unconfirmed. All snapshots have observation timestamps and become historical after48hours. Original79 workbook and232 catalog preserved. Detailed evidence in docs/PROPERTY_EVIDENCE_2026-11-03.md.

M2: Owner photo publication extended to298 destinations:27cities,79workbook,43rentals,149propertysources. Server allowlist derives context and rejects conflicting destination kinds; existingcityrecords/keys/digests preserved.25photo testsPASS. Root independently reviewed server auth/origin/body/image/target/conditional-write isolation. Photo agent independently reviewed root component integration and found a rental-context mismatch, corrected to source OR trust_label unverified. Mobile selector min-width fix applied.

Netlify site6b005e3f-bc71-4f4f-a2c7-520763994fb6. ADMIN_SHARED_SECRET verified secret/Functions-only for production anddeploy-preview; activation awaits deployment. Local DPAPI encrypted owner copy outside repo; helper scripts/owner-photo-upload.ps1 uses it without printing. No secret values in source/evidence. CLI env:set initially silently no-opped without linkedsite despite--site, fixed with NETLIFY_SITE_ID processvariable andAPIreadback. APIreceipt showscorrectkey/scopes/contexts. One publicCC0Phoenixskyline downloaded and visuallyinspected forauthuploadtest; citycontextonly, provenanceevidencedoc. No property photographs rehosted without permission.

M3: New /assistant + /api/assistant, gateway-only fixedGemini3.5FlashLite,20/day300/month5/IP/day, boundedquestion/context/output, consent, noappchattranscripts, validatedcitationIDs andhonestsourcefallback.19initialtestsPASS; independentreview found retrievaljurisdiction/intent relevance and sequentialbudgetdrain, nowbeingfixed in agent-owned scopes. Reviewerresearch willrecheck. AccountPro3000credits,AIenabled,gatewayeligible,auto-topupfalse. OfficialgetAIGatewayToken API (tokennotloggedorstored) givesbase https://6b005e3f-bc71-4f4f-a2c7-520763994fb6.netlify.app/.netlify/ai/ ; deployedproviderbasepathneedsreadback. No separateGooglekey.

## Checks and remaining work
Root small regression suite PASS after NODE_PATH points to existing globalTypeScript: compliance,static-scan,CMS,79propertyviews,assistance,streetview,232catalog,linkrouting,planning,evidence,photos,assistant,brandvalidation. No localinstall/build. RemoteNode20lint/typecheck/build,previewactualGemini,citationrelevance,browsermobile/desktop,tourplayback,realdenied/authenticatedphoto/CDN,productiondeployment andliveacceptance remainNOT_RUN.

Root globalclaim22f301b4262a440bb962c8d9630d5561 ownercodex/01a1a12d/media-assistant-release ownsGit/Netlify/sharedbrowser andexactrootintegrationpaths; assistantagent ownsitsrepairscopes. No localheavyjob. BrowserChrome3 tab1046232645 publichelp createdthisturn, runtimehandlemediaBrowserTab. Claimrebaseline followedownedbatchcompletion, nothingexternaloverwritten. Currentprivateartifacts .revamp-evidence/media-assistant.

Next: acceptreviewedassistantrepairs; commit/pushbranch andPR; NetlifyGitpreview; readGET/api/assistant nonsecretstatus tofinalizeexactgatewayallowlist; testrealfeatures; fix/verify; mergeonlycheckedSHA; verifyproductionreceipt andworkflow; finalhandoff andreleaseownclaims.

## Candidate checkpoint 2026-11-03 14:55 UTC
Assistant repairs handed off; 25 tests pass. Intent/jurisdiction filtering, two inspected statewide211 supplements, and one atomic monthly quota document resolve independent review findings. Owner helper redirect/port/normalized-origin fixes independently approved. All workers released scopes. Root final integration claim 032415c303964f7da80251f302c3ada2 ownercodex/01a1a12d/media-assistant-final. Public and private output separation verified; all canonical workbook/catalog source files unchanged. Remote and live checks still pending.
