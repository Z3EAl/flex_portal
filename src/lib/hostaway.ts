import { z } from "zod";

import {
  calculateAverageRating,
  type Review,
  type ReviewSummary,
} from "./reviews.ts";

export const ratingValueSchema = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === null || value === undefined || value === "") return null;
    const numeric = typeof value === "string" ? Number(value) : value;
    return Number.isFinite(numeric) ? Number(numeric) : null;
  });

export const hostawayReviewSchema = z.object({
  id: z.coerce.number(),
  type: z.string().optional(),
  status: z.union([z.string(), z.null()]).optional(),
  rating: ratingValueSchema,
  publicReview: z.string().optional(),
  reviewCategory: z
    .array(
      z.object({
        category: z.string(),
        rating: ratingValueSchema,
      })
    )
    .optional(),
  submittedAt: z.string().optional(),
  guestName: z.string().optional(),
  listingName: z.string().optional(),
  channel: z.string().optional(),
});

const hostawayPayloadSchema = z
  .object({
    result: z.array(hostawayReviewSchema).optional(),
    data: z.array(hostawayReviewSchema).optional(),
  })
  .transform((payload) => payload.result ?? payload.data ?? []);

export type HostawayReview = z.infer<typeof hostawayReviewSchema>;

export function parseHostawayPayload(payload: unknown): HostawayReview[] {
  return hostawayPayloadSchema.parse(payload);
}

export function normalizeHostawayReview(item: HostawayReview): Review {
  const cats: Record<string, number | null> = {};
  const categoryValues: number[] = [];

  (item.reviewCategory ?? []).forEach((category) => {
    if (!category?.category) return;

    const value =
      typeof category?.rating === "number"
        ? category.rating
        : null;

    if (value !== null) categoryValues.push(value);
    cats[category.category] = value;
  });

  const baseRating = typeof item.rating === "number" ? item.rating : null;
  const derivedRating =
    baseRating === null && categoryValues.length > 0
      ? Number(
          (
            categoryValues.reduce((sum, value) => sum + value, 0) /
            categoryValues.length
          ).toFixed(2)
        )
      : null;

  const submitted = item.submittedAt ? new Date(item.submittedAt) : new Date();
  const date = Number.isNaN(submitted.getTime()) ? new Date() : submitted;

  return {
    id: Number(item.id),
    listing: String(item.listingName ?? "").trim(),
    guest: String(item.guestName ?? "").trim(),
    date: date.toISOString(),
    rating: baseRating ?? derivedRating,
    categories: cats,
    channel: String(item.channel ?? "hostaway"),
    type: String(item.type ?? "guest-to-host"),
    text: String(item.publicReview ?? "").trim(),
    status: item.status ?? null,
  };
}

export function summarizeReviews(reviews: Review[]): ReviewSummary[] {
  const groups = new Map<string, Review[]>();

  for (const review of reviews) {
    const key = review.listing || "Unknown listing";
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(review);
    } else {
      groups.set(key, [review]);
    }
  }

  return Array.from(groups.entries()).map(([listing, list]) => ({
    listing,
    count: list.length,
    avgRating: calculateAverageRating(list, 2),
  }));
}
