import assert from "node:assert/strict";
import test from "node:test";

import { calculateAverageRating } from "../src/lib/reviews";

test("calculateAverageRating ignores unrated entries", () => {
  const result = calculateAverageRating(
    [
      { rating: 9.7 },
      { rating: null },
      { rating: 8.3 },
    ],
    1
  );

  assert.equal(result, 9.0);
});

test("calculateAverageRating returns null when no ratings exist", () => {
  const result = calculateAverageRating([{ rating: null }]);

  assert.equal(result, null);
});
