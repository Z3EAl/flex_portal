import assert from "node:assert/strict";
import test from "node:test";

import { loadGoogleReviews } from "../src/lib/google-service.ts";

test("loadGoogleReviews falls back to mock data when API disabled", async () => {
  const { reviews, meta } = await loadGoogleReviews();

  assert.equal(meta.envUseApi, "false");
  assert.equal(meta.source, "mock");
  assert.ok(Array.isArray(reviews));
  assert.ok(reviews.length > 0);

  const googleReview = reviews.find((review) => review.channel === "google");
  assert.ok(googleReview);
  assert.equal(googleReview.type, "guest-to-public");
  assert.equal(typeof googleReview.id, "number");
  assert.ok(googleReview.id >= 1_000_000_000);
  assert.equal(googleReview.listing.length > 0, true);

  if (googleReview.rating !== null) {
    assert.ok(googleReview.rating <= 10);
  }
});
