# Housing research assistant

The `/assistant` page calls the native Netlify function at `/api/assistant`. This is general housing research, not live inventory, an eligibility decision, an application submission, or a legal deadline calculator.

## Data and citations

The handler reads the existing 232-source public resource catalog and 79 historical California workbook records without changing them. Two separately identified supplemental referral records come from [211 Arizona](https://211arizona.org/) and [211 California](https://211ca.org/), whose public housing/shelter resource sections were inspected on November 3, 2026. They are not counted as catalog records or evidence of current shelter beds or funding. It selects no more than eight jurisdiction-matched records. Legal, shelter and financial-assistance questions require matching categories before ranking. Properties cannot substitute for assistance. City filters use existing place/workbook county mappings; a missing city never implies statewide coverage. Only explicitly identified broad referral URLs bypass a targeted city. If no suitable source exists, Gemini is not called and the response links to state assistance contacts. Workbook context deliberately omits old availability assertions, fit scores and screening judgments. Its links go to the existing property views, not inherited automatic search redirects.

Gemini gets only the current question, selected state/city, instructions and the selected record summaries. The complete context is limited to 14,000 UTF-8 bytes. Every answer block must cite a supplied record ID. The server validates JSON shape, lengths and citations and resolves URLs itself. Model-produced URLs, HTML, common sensitive patterns and unknown IDs reject the response. Citation membership is validated; this does not prove every generated sentence is correct. Provider facts and source freshness still need human confirmation.

The server does not fetch source URLs or offer browsing, tools, file uploads, payments or applications. The initial mode has no Google Search grounding. Labels distinguish a Gemini response from source-only directory matches.

## Provider and configuration

Use only the server-injected `GEMINI_API_KEY` and `GOOGLE_GEMINI_BASE_URL` pair supplied by Netlify AI Gateway. Do not set `NEXT_PUBLIC_` credentials, reuse browser authentication, add a direct unpaid-provider fallback, or log environment values. The current provider gate accepts only HTTPS `6b005e3f-bc71-4f4f-a2c7-520763994fb6.netlify.app` under `/.netlify/ai/` (the owned site's gateway address confirmed by Netlify's official API), with no URL credentials, query or fragment. Verify the injected non-secret gateway address in preview; if Netlify supplies a different address, independently verify and explicitly update this allowlist before activation.

The model is fixed in server code to `gemini-3.5-flash-lite`, with maximum output 1,024 tokens and a 30-second abort timeout. There is one generation call and no retry or expensive-model fallback. If the model is unavailable, the user receives clearly labeled source matches. A successful live preview response is required before claiming model access works.

`ASSISTANT_ENABLED=false` is an optional server-side kill switch. GET returns configuration/key-presence booleans and the HTTPS gateway origin/path only when the URL has no credentials, query or fragment. It never returns credential values, contacts Gemini, or guarantees provider availability. POST requires matching Origin, JSON, explicit consent, CA/AZ state, a 5–800-character question and an optional city up to 80 characters. Its actual body limit is 4,096 bytes. This is a public endpoint: Origin checks are not authentication.

## Budget and abuse controls

Netlify's native function rule permits five requests per minute per IP/domain. Edge rate limits may enforce with delay, so the provider call additionally requires reservations in the site-wide `housing-assistant-budget-v1` Blobs store:

- 20 provider attempts per UTC day across all visitors and deployments using the store.
- 300 provider attempts per UTC calendar month.
- Five attempts per IP per UTC day. IP identifiers use a dated HMAC with the injected gateway key; a key rotation can reset that pseudonymous IP partition, while global caps remain unchanged.

One bounded monthly document contains the total and dated per-IP counters. A strong read checks every limit before a single conditional `onlyIfNew` / `onlyIfMatch` write increments all counters atomically. Conflicts retry at most six times; failure, malformed state, missing IP or storage errors deny the provider call. Reservations are never refunded after an upstream failure or timeout. Rejected attempts do not change any counter. Successful reservations are conservatively retained after upstream errors because the provider may have received the request. Each monthly document has at most 31 day entries and 300 pseudonymous IP entries. Counters contain counts only. Daily pseudonymous IP keys are not raw addresses; they are still operational identifiers. No prompts or answers are stored. Blobs has no automatic TTL in this implementation; periodic removal of obsolete counters must preserve the active day/month and should be a separately reviewed maintenance task.

These are request caps, not a promise of a precise dollar amount. Token charges and hosting usage vary. The fixed model, prompt size, output cap and lack of tool loops bound normal inference work. Netlify's Agent Runners AI spending limit does not cap gateway inference. Do not change billing plans, auto-recharge or purchase credits as part of this feature.

## Privacy and page behavior

The page makes a safe configuration GET on mount; generation happens only after the user submits and acknowledges the notice. Existing local renter/buyer/work profiles, saved records and comparison selections are never read or sent. Questions/answers live in React page memory, not browser storage or a server chat history. Clearing the page aborts its pending request and removes its local question, answer and consent. An abort cannot reverse a request already delivered upstream or refund its reservation.

Common account/contact/identity patterns are rejected before quota or provider calls. This filter cannot detect all personal information; users must avoid entering it. Netlify/provider processing remains external processing. Update the site's central privacy page to describe it accurately. Do not claim universal zero retention.

## Integration and acceptance

Root integration owns navigation, central privacy copy, CI workflow steps and any environment changes. Add `node --test scripts/test-assistant.mjs` to existing regression steps. The test suite uses fake credentials, in-memory conditional storage and fake provider responses; it makes no Gemini calls and reads no personal data.

Before production acceptance:

1. Run regression fixtures, lint, typecheck and build on the integrated commit.
2. Verify the real gateway address, actual configured model and one successful cited preview answer; keep provider credentials out of evidence.
3. Verify budget state is shared across function instances and that native rate limiting is listed in the deployment.
4. Exercise unavailable, exhausted and malformed provider states; confirm only source matches are shown.
5. Check 360px layout, keyboard operation, consent, result focus, citations, clear/cancel and lack of history after reload.
6. Confirm the source response contains no credential, raw provider errors or personal-profile data.

## Official documentation consulted

- [Netlify AI Gateway](https://docs.netlify.com/build/ai-gateway/overview/)
- [Netlify AI pricing](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/pricing-for-ai-features/)
- [Netlify rate limiting](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/)
- [Netlify Blobs conditional writes and consistency](https://docs.netlify.com/build/data-and-storage/netlify-blobs/)
- [Netlify AI privacy](https://docs.netlify.com/build/build-with-ai/security-and-privacy-for-ai-features/)
- [Gemini 3.5 Flash-Lite](https://aistudio.google.com/docs/models/gemini-3.5-flash-lite)

Reviewed November 3, 2026. The account's actual runtime capability and credits require the integrator's deployment evidence.
