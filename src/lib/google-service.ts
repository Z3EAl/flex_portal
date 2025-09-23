import { createRequire } from "node:module";
import {
  normalizeGoogleReview,
  parseGoogleMock,
  parseGooglePlaceResponse,
  type GoogleMockPlace,
} from "./google.ts";
import { properties } from "./properties.ts";
import type { Review } from "./reviews.ts";

const require = createRequire(import.meta.url);
const googleSeedData = require("../../data/reviews.google.json");

const MOCK: GoogleMockPlace[] = parseGoogleMock(googleSeedData);

export type GooglePlaceMapping = {
  listing: string;
  placeId: string;
};

export type GoogleLoadOptions = {
  placeMappings?: GooglePlaceMapping[];
};

export type GoogleLoadResult = {
  reviews: Review[];
  meta: {
    source: string;
    status: string;
    count: number;
    envUseApi: string;
  };
};

function defaultPlaceMappings(): GooglePlaceMapping[] {
  return properties
    .filter((property) => property.googlePlaceId)
    .map((property) => ({
      listing: property.name,
      placeId: property.googlePlaceId!,
    }));
}

function mockByPlaceId(): Map<string, GoogleMockPlace> {
  const map = new Map<string, GoogleMockPlace>();
  MOCK.forEach((place) => {
    if (place.placeId) {
      map.set(place.placeId, place);
    }
  });
  return map;
}

export async function loadGoogleReviews(
  options: GoogleLoadOptions = {}
): Promise<GoogleLoadResult> {
  const mappings = options.placeMappings ?? defaultPlaceMappings();
  const fallback = mockByPlaceId();

  const useApi = process.env.GOOGLE_USE_API === "true";
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const baseUrl =
    process.env.GOOGLE_PLACES_BASE_URL || "https://places.googleapis.com/v1";

  const collected: Review[] = [];
  const statusCodes = new Set<string>();
  let usedSource: "mock" | "api" = "mock";

  for (const mapping of mappings) {
    const placeId = mapping.placeId;
    let reviews: Review[] = [];
    let consumedFromApi = false;

    if (useApi && apiKey) {
      try {
        const endpoint = `${baseUrl.replace(/\/$/, "")}/places/${encodeURIComponent(
          placeId
        )}?fields=reviews`;
        const res = await fetch(endpoint, {
          method: "GET",
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "reviews",
            Accept: "application/json",
          },
          cache: "no-store",
        });

        statusCodes.add(String(res.status));

        if (res.ok) {
          const parsed = parseGooglePlaceResponse(await res.json());
          const apiReviews = parsed.reviews ?? [];
          if (apiReviews.length > 0) {
            consumedFromApi = true;
            reviews = apiReviews.map((review, index) =>
              normalizeGoogleReview(mapping.listing, placeId, review, index)
            );
          }
        }
      } catch {
        statusCodes.add("error");
      }
    } else if (useApi && !apiKey) {
      statusCodes.add("401");
    }

    if (!consumedFromApi) {
      const fallbackPlace = fallback.get(placeId);
      const seed = fallbackPlace?.reviews ?? [];
      reviews = seed.map((review, index) =>
        normalizeGoogleReview(mapping.listing, placeId, review, index)
      );
    }

    if (consumedFromApi) {
      usedSource = "api";
    }

    reviews.forEach((review) => collected.push(review));
  }

  return {
    reviews: collected,
    meta: {
      source: usedSource,
      status:
        statusCodes.size === 0
          ? "n/a"
          : Array.from(statusCodes).sort().join(","),
      count: collected.length,
      envUseApi: String(useApi),
    },
  };
}
