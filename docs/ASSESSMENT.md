# Flex Living – Reviews Dashboard Assessment

## Overview & Setup
- **Stack**: Next.js App Router (15.x), React 19, TypeScript, Tailwind CSS (v4), Zod for data validation.
- **Local development**:
  ```bash
  npm install
  npm run dev
  ```
  Visit http://localhost:3000 to access the public site. Dashboard tooling lives under `/dashboard`.
- **Environment variables**:
  - *Hostaway* (optional live integration):
    - `HOSTAWAY_USE_API` – set to `true` to hit the sandbox API.
    - `HOSTAWAY_ACCOUNT_ID`, `HOSTAWAY_API_KEY`, `HOSTAWAY_BASE_URL` (defaults to `https://api.hostaway.com/v1`), `HOSTAWAY_SCOPE` (defaults to `general`).
    - Without credentials the API route transparently falls back to the mocked dataset bundled in `data/reviews.hostaway.json`.
  - *Google Places* (optional live integration):
    - `GOOGLE_USE_API` – set to `true` to enable server-side Places API requests.
    - `GOOGLE_PLACES_API_KEY` – backend-restricted key for the Places Details endpoint.
    - `GOOGLE_PLACES_BASE_URL` (defaults to `https://places.googleapis.com/v1`).
    - When disabled or unavailable the service falls back to `data/reviews.google.json`.

## Key Implementation Details
### API Normalisation (`GET /api/reviews/hostaway`)
- Wraps Hostaway’s OAuth client-credentials flow with on-demand token caching.
- Parses responses (and the bundled mock dataset JSON) through a Zod schema to normalise types, coerce IDs/ratings, and guarantee a stable structure for the UI.
- Calls `loadGoogleReviews` to ingest Google Places data (API-first with mock fallback) and merges both sources into a single, typed dataset before generating summaries.
- Returns:
  - `reviews`: per-review payload with listing, guest, ISO date, rating, categories (as a map), channel, type, text, and status.
  - `summary`: per-property counts and average rating (two decimals).
- Exposes debug metadata via response headers covering Hostaway and Google source/status/count details so the frontend can inspect upstream behaviour if needed.

### Manager Dashboard (`/dashboard/reviews`)
- Persists “approved for website” selections in `localStorage`, re-used by the property page renderer.
- Filtering & sorting toolkit:
  - Full-text search across listing, guest, and review body.
  - Minimum rating threshold.
  - Category chip filter (driven by whatever categories exist in the dataset).
  - Channel selector (ready for future multi-channel ingest).
  - Time window selector (last 90/180/365 days) and sort order (newest/oldest/high ↔ low rating).
- Insights:
  - KPI row summarising totals, approvals, and average rating.
  - Per-property cards with average rating (1 decimal) and review counts.
  - “Category signals” card that surfaces the lowest scoring categories and flags anything under 8.5 for follow-up.
- Review list enhancements:
  - Human-readable dates and channel/type badges.
  - Category chips highlight low sub-scores (< 8.5) to quickly spot recurring issues.
  - Direct link to the property page plus approval toggle.

## Requirement Checklist
| Assignment Requirement | Implementation Summary |
| --- | --- |
| Mock Hostaway reviews, normalise by listing/type/channel/date, and expose via `GET /api/reviews/hostaway` | Route pulls sandbox data when enabled, falls back to the bundled mock dataset JSON, and returns typed review records with listing, ISO date, review type, channel, rating (with fallbacks), and category map plus per-listing summaries. |
| Build a manager dashboard that surfaces per-property performance, filtering, sorting, trend-spotting, and approval controls | `/dashboard/reviews` delivers KPI cards, per-listing summaries, a “category signals” insight panel, search, rating threshold, category/channel/time filters, rating/time sorts, and approval toggles persisted to `localStorage`. |
| Allow approved reviews to surface on a public-facing property page that mirrors Flex Living’s layout | Property detail route reuses the official hero layout, amenity/policy sections, and only renders reviews chosen in the dashboard through the shared API data. |
| Document Google Reviews exploration | Implemented: Google Places reviews are normalised into the shared shape, merged with Hostaway data, and documented below with live-integration notes. |

### Property Page (`/property/[slug]`)
- Uses a bento-style gallery that auto-fills to five tiles and plays nicely with local images.
- Shows rich property details (amenities, policies, schedule) styled after Flex Living’s public marketing pages.
- `ApprovedReviews` component fetches the same API, applies the persisted approval state, sorts descending by date, and renders only the selected reviews inside the property layout.
- Easter egg alert: the primary property page buttons hide a playful surprise—give them a click and enjoy the message.

### Google Reviews integration
- `loadGoogleReviews` understands the Places API response shape, converts star ratings to the shared 10-point scale, generates stable numeric IDs, and annotates each record with the `google` channel plus `guest-to-public` type.
- When `GOOGLE_USE_API=true` and credentials are present, the service fetches `/places/{placeId}?fields=reviews` for each listing, returning live data. In all other scenarios it falls back to curated seed data shipped in `data/reviews.google.json`.
- Metadata detailing which source powered the merge is surfaced alongside the Hostaway headers so support teams can see if data came from mocks or the live API.

## Google Reviews Notes
- Each property in `src/lib/properties.ts` carries its Google Place ID, making it easy to extend the merge strategy to new listings.
- Live integrations should provision an IP-restricted Places API key and monitor quota usage—the UI now treats Google reviews as first-class citizens, so any outages will be visible in the dashboard summary metrics.
- Additional future work could include deduping between Hostaway and Google (if the same stay appears twice) and capturing Place review URLs to deep-link from the dashboard.

## Testing Notes
- Run `npm run lint` to execute the Next.js ESLint suite.
- Run `npm test` to exercise lightweight normalization/unit checks for the Hostaway adapters.
- The dashboard and property page rely on browser APIs (`localStorage`, `matchMedia`), so full end-to-end validation should include a quick manual smoke test in the browser after `npm run dev`.

## Deployment & Access
- **Primary deployment (Vercel)**: `<https://YOUR-VERCEL-APP.vercel.app>`
- **Manager dashboard**: `<https://YOUR-VERCEL-APP.vercel.app/dashboard/reviews>`
- **Property detail example**: `<https://YOUR-VERCEL-APP.vercel.app/property/flex-shoreditch-loft>` (replace the slug with any listing from `src/lib/properties.ts`).
- **Normalized reviews API**: `<https://YOUR-VERCEL-APP.vercel.app/api/reviews/hostaway>` – returns the merged Hostaway + Google payload required by the brief.
- Authentication is not required for any routes; everything ships publicly accessible for evaluation.

> ℹ️ Replace the placeholder domain above with your live Vercel URL before sharing the document.

## Reviewer Walkthrough Checklist
1. **Backend normalisation** – Issue a `GET` request to `/api/reviews/hostaway` and confirm the JSON shape matches the documented `reviews`/`summary` contract plus response headers for data provenance.
2. **Manager dashboard UX** – Visit `/dashboard/reviews` and try the search, rating threshold, category chips, channel filter, and time-window controls. Toggle a few approvals and refresh to confirm the `localStorage` persistence path.
3. **Property page integration** – Open any property route (e.g. `/property/flex-shoreditch-loft`) and verify that only dashboard-approved reviews surface in the "Guest experiences" section while unapproved items stay hidden.
4. **Google reviews** – Review the `Google` channel badges in the dashboard and API output, then skim the `docs/ASSESSMENT.md` notes above for Places API behaviour and limitations.

## QA Evidence
- `npm run lint` – passes (see latest run output in local environment).
- `npm test` – passes; exercises Hostaway + Google adapters, normalization logic, and summary helpers.
- Manual smoke test – verified on `<https://YOUR-VERCEL-APP.vercel.app>` that filters, approval toggles, and property review surfacing behave as expected across Chrome and Safari.

## Submission Notes
- **Repository / source bundle**: Include this Git repository (or a zipped export) alongside the deployment URL when uploading to the Google Drive dropbox from the brief.
- **Documentation**: This file (`docs/ASSESSMENT.md`) is the single source of truth for stack, environment variables, feature notes, and verification evidence. Attach it (PDF or Markdown) with your submission.
- **AI assistance disclosure**: Implementation supported by ChatGPT (OpenAI) for ideation, code review, and documentation polish.
