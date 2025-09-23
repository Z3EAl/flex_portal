import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeHostawayReview,
  summarizeReviews,
  type HostawayReview,
} from "../src/lib/hostaway.ts";
import { loadHostawayReviews } from "../src/lib/hostaway-service.ts";

test("normalizeHostawayReview derives rating from category scores", () => {
  const review: HostawayReview = {
    id: 1,
    type: "guest-to-host",
    status: "published",
    rating: null,
    publicReview: "Great stay!",
    reviewCategory: [
      { category: "cleanliness", rating: 10 },
      { category: "communication", rating: 8 },
    ],
    submittedAt: "2024-01-01T12:00:00Z",
    guestName: "Sample Guest",
    listingName: "Example Listing",
    channel: "hostaway",
  };

  const normalized = normalizeHostawayReview(review);

  assert.equal(normalized.rating, 9);
  assert.equal(normalized.listing, "Example Listing");
  assert.equal(normalized.guest, "Sample Guest");
  assert.equal(normalized.categories.cleanliness, 10);
  assert.equal(normalized.categories.communication, 8);
});

test("summarizeReviews calculates per-listing averages", () => {
  const reviews = [
    normalizeHostawayReview({
      id: 1,
      type: "guest-to-host",
      status: "published",
      rating: 8,
      publicReview: "",
      reviewCategory: [],
      submittedAt: "2024-01-01T00:00:00Z",
      guestName: "Guest A",
      listingName: "Listing", 
      channel: "hostaway",
    }),
    normalizeHostawayReview({
      id: 2,
      type: "guest-to-host",
      status: "published",
      rating: null,
      publicReview: "",
      reviewCategory: [
        { category: "cleanliness", rating: 10 },
      ],
      submittedAt: "2024-02-01T00:00:00Z",
      guestName: "Guest B",
      listingName: "Listing",
      channel: "hostaway",
    }),
  ];

  const summary = summarizeReviews(reviews);

  assert.equal(summary.length, 1);
  assert.equal(summary[0]?.listing, "Listing");
  assert.equal(summary[0]?.count, 2);
  assert.equal(summary[0]?.avgRating, 9);
});

test("loadHostawayReviews returns normalized payload", async () => {
  const { reviews, summary, meta } = await loadHostawayReviews();

  assert.equal(meta.dataSource, "mock");
  assert.equal(meta.envUseApi, "false");
  assert.equal(meta.googleEnvUseApi, "false");

  assert.ok(Array.isArray(reviews));
  assert.ok(reviews.length > 0);
  assert.ok(Array.isArray(summary));
  assert.ok(summary.length > 0);

  const sample = reviews[0];

  assert.ok(reviews.some((review) => review.channel === "google"));

  assert.equal(typeof sample.id, "number");
  assert.equal(typeof sample.listing, "string");
  assert.equal(typeof sample.channel, "string");
  assert.equal(typeof sample.type, "string");
  assert.equal(typeof sample.date, "string");
  assert.equal(typeof sample.categories, "object");
  assert.ok(!Array.isArray(sample.categories));
  if (sample.rating !== null) {
    assert.equal(typeof sample.rating, "number");
  }

  const summarySample = summary[0];
  assert.equal(typeof summarySample.listing, "string");
  assert.equal(typeof summarySample.count, "number");
  if (summarySample.avgRating !== null) {
    assert.equal(typeof summarySample.avgRating, "number");
  }
});
