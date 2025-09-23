# Flex Living – Reviews Dashboard Assessment

## Overview & Setup
- **Stack**: Next.js App Router (15.x), React 19, TypeScript, Tailwind CSS (v4), Zod for data validation.
- **Local development**:
  ```bash
  npm install
  npm run dev
  ```
  Visit http://localhost:3000 to access the public site. Dashboard tooling lives under `/dashboard`.
- **Environment variables** (optional Hostaway integration):
  - `HOSTAWAY_USE_API` – set to `true` to hit the sandbox API.
  - `HOSTAWAY_ACCOUNT_ID`, `HOSTAWAY_API_KEY`, `HOSTAWAY_BASE_URL` (defaults to `https://api.hostaway.com/v1`), `HOSTAWAY_SCOPE` (defaults to `general`).
  - Without credentials the API route transparently falls back to the mocked dataset bundled in `data/reviews.hostaway.json`.

## Key Implementation Details
### API Normalisation (`GET /api/reviews/hostaway`)
- Wraps Hostaway’s OAuth client-credentials flow with on-demand token caching.
- Parses responses (and the bundled mock JSON) through a Zod schema to normalise types, coerce IDs/ratings, and guarantee a stable structure for the UI.
- Returns:
  - `reviews`: per-review payload with listing, guest, ISO date, rating, categories (as a map), channel, type, text, and status.
  - `summary`: per-property counts and average rating (two decimals).
- Exposes debug metadata via response headers: data source (`mock` vs `hostaway`), API status code, raw Hostaway count, and whether the API integration is enabled.

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
| Mock Hostaway reviews, normalise by listing/type/channel/date, and expose via `GET /api/reviews/hostaway` | Route pulls sandbox data when enabled, falls back to the bundled mock JSON, and returns typed review records with listing, ISO date, review type, channel, rating (with fallbacks), and category map plus per-listing summaries. |
| Build a manager dashboard that surfaces per-property performance, filtering, sorting, trend-spotting, and approval controls | `/dashboard/reviews` delivers KPI cards, per-listing summaries, a “category signals” insight panel, search, rating threshold, category/channel/time filters, rating/time sorts, and approval toggles persisted to `localStorage`. |
| Allow approved reviews to surface on a public-facing property page that mirrors Flex Living’s layout | Property detail route reuses the official hero layout, amenity/policy sections, and only renders reviews chosen in the dashboard through the shared API data. |
| Document Google Reviews exploration | Findings and a suggested implementation path are recorded below. |

### Property Page (`/property/[slug]`)
- Uses a bento-style gallery that auto-fills to five tiles and plays nicely with local images.
- Shows rich property details (amenities, policies, schedule) styled after Flex Living’s public marketing pages.
- `ApprovedReviews` component fetches the same API, applies the persisted approval state, sorts descending by date, and renders only the selected reviews inside the property layout.
- Easter egg alert: the primary property page buttons hide a playful surprise—give them a click and enjoy the message.

## Google Reviews Exploration
- Investigated Google Places API for server-side ingestion. Viable options require enabling the **Places API** and using the **Place Details** endpoint with `reviews` fields.
- Sandbox constraints & API key policies (credit card requirement, CORS restrictions) prevented live integration for this assessment.
- To extend:
  1. Capture the Google Place ID per listing (could live in `src/lib/properties.ts`).
  2. Add a server action/route that calls `https://places.googleapis.com/v1/places/{placeId}?fields=reviews` with an API key restricted to backend IPs.
  3. Map Google’s review schema into the shared `Review` shape and merge with Hostaway data.
- Findings and next steps are documented here so the team can evaluate the trade-offs before provisioning credentials.

## Testing Notes
- Run `npm run lint` to execute the Next.js ESLint suite.
- Run `npm test` to exercise lightweight normalization/unit checks for the Hostaway adapters.
- The dashboard and property page rely on browser APIs (`localStorage`, `matchMedia`), so full end-to-end validation should include a quick manual smoke test in the browser after `npm run dev`.
