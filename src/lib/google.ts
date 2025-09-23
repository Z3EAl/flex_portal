import { z } from "zod";

import type { Review } from "./reviews";

const starRatingMap: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

export const googleReviewSchema = z.object({
  name: z.string().optional(),
  reviewId: z.string().optional(),
  text: z.string().optional(),
  originalText: z
    .object({
      text: z.string().optional(),
      languageCode: z.string().optional(),
    })
    .optional(),
  rating: z.union([z.number(), z.string(), z.null(), z.undefined()]).optional(),
  starRating: z.string().optional(),
  publishTime: z.string().optional(),
  updateTime: z.string().optional(),
  relativePublishTimeDescription: z.string().optional(),
  authorAttribution: z
    .object({
      displayName: z.string().optional(),
      uri: z.string().optional(),
      photoUri: z.string().optional(),
    })
    .optional(),
  reviewer: z
    .object({
      displayName: z.string().optional(),
      profilePhotoUrl: z.string().optional(),
    })
    .optional(),
});

export type GoogleReview = z.infer<typeof googleReviewSchema>;

const googlePlaceBaseSchema = z.object({
  name: z.string().optional(),
  placeId: z.string().optional(),
  listing: z.string().optional(),
  googleMapsUri: z.string().optional(),
  reviews: z.array(googleReviewSchema).optional(),
});

export const googleMockSchema = z.object({
  places: z.array(googlePlaceBaseSchema),
});

export type GoogleMockPlace = z.infer<typeof googlePlaceBaseSchema>;

export const googlePlaceResponseSchema = z.object({
  name: z.string(),
  reviews: z.array(googleReviewSchema).optional(),
});

function toTenPointScale(rating: number | null): number | null {
  if (rating === null) return null;
  const clamped = Math.max(0, Math.min(5, rating));
  return Number((clamped * 2).toFixed(1));
}

function resolveRating(review: GoogleReview): number | null {
  const numeric =
    typeof review.rating === "number"
      ? review.rating
      : typeof review.rating === "string"
      ? Number(review.rating)
      : null;

  if (Number.isFinite(numeric)) {
    return toTenPointScale(Number(numeric));
  }

  if (typeof review.starRating === "string") {
    const mapped = starRatingMap[review.starRating.toUpperCase()];
    if (typeof mapped === "number") {
      return toTenPointScale(mapped);
    }
  }

  return null;
}

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  const normalized = Math.abs(hash);
  return Number.isFinite(normalized) ? normalized : 0;
}

function resolveGuest(review: GoogleReview): string {
  return (
    review.reviewer?.displayName?.trim() ||
    review.authorAttribution?.displayName?.trim() ||
    "Google Reviewer"
  );
}

function resolveText(review: GoogleReview): string {
  return (
    review.text?.trim() ||
    review.originalText?.text?.trim() ||
    ""
  );
}

function resolveDate(review: GoogleReview): string {
  const candidate = review.publishTime || review.updateTime;
  if (candidate) {
    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return new Date().toISOString();
}

function extractPlaceId(name: string | undefined): string | null {
  if (!name) return null;
  const segments = name.split("/");
  const last = segments[segments.length - 1];
  return last ? last : null;
}

export function normalizeGoogleReview(
  listing: string,
  placeId: string,
  review: GoogleReview,
  index: number
): Review {
  const idSeed =
    review.reviewId ||
    review.name ||
    `${review.publishTime ?? ""}-${resolveGuest(review)}-${resolveText(review)}`;
  const hash = stableHash(`${placeId}:${idSeed}:${index}`);

  return {
    id: 1_000_000_000 + hash,
    listing,
    guest: resolveGuest(review),
    date: resolveDate(review),
    rating: resolveRating(review),
    categories: {},
    channel: "google",
    type: "guest-to-public",
    text: resolveText(review),
    status: "published",
  };
}

export function parseGoogleMock(payload: unknown): GoogleMockPlace[] {
  const parsed = googleMockSchema.parse(payload);
  return parsed.places.map((place) => ({
    ...place,
    placeId: place.placeId || extractPlaceId(place.name || undefined) || undefined,
  }));
}

export function parseGooglePlaceResponse(payload: unknown): {
  placeId: string | null;
  reviews: GoogleReview[];
} {
  const parsed = googlePlaceResponseSchema.parse(payload);
  return {
    placeId: extractPlaceId(parsed.name),
    reviews: parsed.reviews ?? [],
  };
}
