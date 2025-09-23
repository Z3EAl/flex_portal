export type Review = {
  id: number;
  listing: string;
  guest: string;
  date: string;
  rating: number | null;
  categories: Record<string, number | null>;
  channel: string;
  type: string;
  text: string;
  status: string | null;
};

export type ReviewSummary = {
  listing: string;
  count: number;
  avgRating: number | null;
};

export type ReviewsResponse = {
  reviews: Review[];
  summary: ReviewSummary[];
};

type WithRating = { rating: number | null };

/**
 * Calculates the arithmetic mean of review ratings while ignoring unrated items.
 * Returns `null` when there are no numeric ratings to prevent misleading zero values.
 */
export function calculateAverageRating<T extends WithRating>(
  items: readonly T[],
  precision = 1
): number | null {
  const values = items
    .map((item) => item.rating)
    .filter((value): value is number => typeof value === "number");

  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  const average = total / values.length;

  return Number(average.toFixed(precision));
}
