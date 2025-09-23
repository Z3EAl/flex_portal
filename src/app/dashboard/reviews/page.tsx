"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatDisplayDate } from "@/lib/dates";
import {
  calculateAverageRating,
  type ReviewsResponse,
} from "@/lib/reviews";

function humanize(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function humanize(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ReviewsDashboard() {
  const [data, setData] = useState<ReviewsResponse>({ reviews: [], summary: [] });
  const [minRating, setMinRating] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [approved, setApproved] = useState<Record<number, boolean>>({});
  const [category, setCategory] = useState<string>("all");
  const [channel, setChannel] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"all" | "90" | "180" | "365">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "rating-desc" | "rating-asc">("newest");

  useEffect(() => { const s = localStorage.getItem("approved"); if (s) setApproved(JSON.parse(s)); }, []);
  useEffect(() => { localStorage.setItem("approved", JSON.stringify(approved)); }, [approved]);

  useEffect(() => {
    fetch("/api/reviews/hostaway")
      .then(r => r.json())
      .then((payload: ReviewsResponse) => setData(payload));
  }, []);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    data.reviews.forEach((review) => {
      Object.keys(review.categories).forEach((key) => {
        if (key) set.add(key);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data.reviews]);

  const channelOptions = useMemo(() => {
    const set = new Set<string>();
    data.reviews.forEach((review) => {
      if (review.channel) set.add(review.channel);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data.reviews]);

  const visible = useMemo(() => {
    const searchNeedle = search.toLowerCase();
    const since = timeRange === "all" ? null : Date.now() - Number(timeRange) * 24 * 60 * 60 * 1000;

    const filtered = data.reviews.filter((review) => {
      const ratingOk = minRating === "" || (review.rating ?? 0) >= Number(minRating);
      const haystack = `${review.listing} ${review.guest} ${review.text}`.toLowerCase();
      const searchOk = !searchNeedle || haystack.includes(searchNeedle);
      const categoryOk = category === "all" || category in review.categories;
      const channelOk = channel === "all" || review.channel.toLowerCase() === channel.toLowerCase();

      const submitted = new Date(review.date).getTime();
      const timeOk =
        since === null || (Number.isNaN(submitted) ? true : submitted >= since);

      return ratingOk && searchOk && categoryOk && channelOk && timeOk;
    });

    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      const ratingA = typeof a.rating === "number" ? a.rating : null;
      const ratingB = typeof b.rating === "number" ? b.rating : null;

      switch (sortOrder) {
        case "oldest":
          return dateA - dateB;
        case "rating-desc":
          return (ratingB ?? -Infinity) - (ratingA ?? -Infinity);
        case "rating-asc":
          return (ratingA ?? Infinity) - (ratingB ?? Infinity);
        default:
          return dateB - dateA;
      }
    });

    return sorted;
  }, [data.reviews, minRating, search, category, channel, timeRange, sortOrder]);

  const categoryInsights = useMemo(() => {
    const stats = new Map<string, { sum: number; count: number }>();

    data.reviews.forEach((review) => {
      Object.entries(review.categories).forEach(([name, value]) => {
        if (typeof value === "number") {
          const current = stats.get(name) ?? { sum: 0, count: 0 };
          current.sum += value;
          current.count += 1;
          stats.set(name, current);
        }
      });
    });

    const ranked = Array.from(stats.entries())
      .filter(([, { count }]) => count > 0)
      .map(([name, { sum, count }]) => ({
        category: name,
        avg: Number((sum / count).toFixed(1)),
        count,
      }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 3);

    const attention = ranked.filter((item) => item.avg < 8.5);
    return attention.length > 0 ? attention : ranked;
  }, [data.reviews]);

  const total = data.reviews.length;
  const approvedCount = data.reviews.filter(r => approved[r.id]).length;
  const avg = useMemo(() => calculateAverageRating(data.reviews, 1), [data.reviews]);

  return (
    <main className="space-y-6">
      {/* KPI row like the screenshot */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="metric">
          <div className="metric-title">Total reviews</div>
          <div className="flex items-end justify-between mt-1">
            <div className="metric-value">{total}</div>
            <span className="badge badge-up">+ synced</span>
          </div>
        </div>
        <div className="metric">
          <div className="metric-title">Approved</div>
          <div className="flex items-end justify-between mt-1">
            <div className="metric-value">{approvedCount}</div>
            <span className="badge badge-up">for website</span>
          </div>
        </div>
        <div className="metric">
          <div className="metric-title">Average rating</div>
          <div className="flex items-end justify-between mt-1">
            <div className="metric-value">{avg ?? "—"}</div>
            <span className="badge badge-up">/ 10</span>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="dash-card p-4 md:p-5">
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <div className="h2">Filters</div>
            <div className="text-sm text-[#6d7b72]">
              Combine score, category, channel, and recency filters to hone in on patterns.
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <label className="field flex-1 min-w-[160px]">
              <span className="text-sm text-[#6d7b72]">Search</span>
              <input
                className="input w-full"
                placeholder="Listing, guest, or keyword…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </label>

            <label className="field">
              <span className="text-sm text-[#6d7b72]">Min rating</span>
              <input
                className="input"
                type="number"
                min={0}
                max={10}
                value={minRating}
                onChange={e => setMinRating(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </label>

            <label className="field">
              <span className="text-sm text-[#6d7b72]">Category</span>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="all">All categories</option>
                {categoryOptions.map(option => (
                  <option key={option} value={option}>
                    {humanize(option)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="text-sm text-[#6d7b72]">Channel</span>
              <select className="input" value={channel} onChange={e => setChannel(e.target.value)}>
                <option value="all">All channels</option>
                {channelOptions.map(option => (
                  <option key={option} value={option}>
                    {humanize(option)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="text-sm text-[#6d7b72]">Time</span>
              <select className="input" value={timeRange} onChange={e => setTimeRange(e.target.value as typeof timeRange)}>
                <option value="all">All time</option>
                <option value="90">Last 90 days</option>
                <option value="180">Last 6 months</option>
                <option value="365">Last 12 months</option>
              </select>
            </label>

            <label className="field">
              <span className="text-sm text-[#6d7b72]">Sort by</span>
              <select className="input" value={sortOrder} onChange={e => setSortOrder(e.target.value as typeof sortOrder)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="rating-desc">Rating (high → low)</option>
                <option value="rating-asc">Rating (low → high)</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* Listing summaries */}
      {data.summary.length > 0 && (
        <section className="grid gap-4 md:grid-cols-3">
          {data.summary.map(s => (
            <div key={s.listing} className="dash-card p-4">
              <div className="text-sm text-[#6d7b72]">{s.listing}</div>
              <div className="mt-1 text-3xl font-semibold text-[color:var(--foreground)]">
                {s.avgRating !== null ? s.avgRating.toFixed(1) : "—"}
              </div>
              <div className="text-xs text-[#6d7b72]">{s.count} reviews</div>
            </div>
          ))}
        </section>
      )}

      {categoryInsights.length > 0 && (
        <section className="dash-card space-y-4 p-4 md:p-5">
          <div>
            <div className="h2">Category signals</div>
            <p className="text-sm text-[#6d7b72]">
              Lowest-scoring topics across all reviews. Anything below 8.5 deserves a follow-up.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {categoryInsights.map((insight) => (
              <div key={insight.category} className="rounded-xl border border-[#dbe6dc] bg-[#f8fbf7] p-4">
                <div className="text-sm font-semibold text-[#13392f]">{humanize(insight.category)}</div>
                <div className="mt-2 text-2xl font-semibold text-[#13392f]">{insight.avg.toFixed(1)}</div>
                <div className="text-xs text-[#6d7b72]">{insight.count} ratings logged</div>
                {insight.avg < 8.5 ? (
                  <div className="mt-2 text-xs font-medium text-[#b04c2f]">Needs attention</div>
                ) : (
                  <div className="mt-2 text-xs text-[#6d7b72]">Healthy trend</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews list */}
      <section className="space-y-2">
        <div className="h2">All reviews</div>
        {visible.length === 0 && <div className="text-[#6d7b72]">No reviews match the current filters.</div>}

        <div className="grid gap-3">
          {visible.map(r => (
            <article key={r.id} className="dash-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/property/${encodeURIComponent(r.listing)}`}
                    className="font-medium text-[color:var(--accent)] hover:underline"
                  >
                    {r.listing}
                  </Link>
                  <div className="text-sm text-[#67756f]">
                    {r.guest}
                    <span className="mx-1 text-[#bfcac3]">•</span>
                    {humanize(r.type)}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#6d7b72]">
                  <span>{formatDisplayDate(r.date)}</span>
                  <span className="inline-flex items-center rounded-full bg-[#ecf4ef] px-2.5 py-0.5 text-xs font-medium text-[#134e48]">
                    {humanize(r.channel)}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[#3a4941]">{r.text}</p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-[#f0f5f2] px-3 py-1 font-medium text-[#134e48]">
                  Rating: {r.rating !== null ? r.rating.toFixed(1) : "—"}
                </span>
                {r.status && (
                  <span className="rounded-full bg-[#eef5ef] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#2f3e35]">
                    {humanize(r.status)}
                  </span>
                )}
              </div>

              {Object.keys(r.categories).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {Object.entries(r.categories).map(([categoryName, value]) => (
                    <span
                      key={categoryName}
                      className={`rounded-full px-2.5 py-1 ${
                        typeof value === "number" && value < 8.5
                          ? "bg-[#fdece5] text-[#b04c2f]"
                          : "bg-[#edf5ef] text-[#2f3e35]"
                      }`}
                    >
                      {humanize(categoryName)}: {value ?? "—"}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!approved[r.id]}
                    onChange={() => setApproved(prev => ({ ...prev, [r.id]: !prev[r.id] }))}
                  />
                  <span>Approved for website</span>
                </label>

                <Link href={`/property/${encodeURIComponent(r.listing)}`} className="text-[color:var(--accent)] text-sm hover:underline">
                  View property page
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
