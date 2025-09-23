"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatDisplayDate } from "@/lib/dates";
import { calculateAverageRating, type ReviewsResponse } from "@/lib/reviews";

function humanize(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ReviewsDashboard() {
  const [data, setData] = useState<ReviewsResponse>({ reviews: [], summary: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // filters / UI state
  const [minRating, setMinRating] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [approved, setApproved] = useState<Record<number, boolean>>({});
  const [category, setCategory] = useState<string>("all");
  const [channel, setChannel] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"all" | "90" | "180" | "365">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "rating-desc" | "rating-asc">("newest");

  // load persisted approvals
  useEffect(() => {
    const s = localStorage.getItem("approved");
    if (s) setApproved(JSON.parse(s));
  }, []);
  useEffect(() => {
    localStorage.setItem("approved", JSON.stringify(approved));
  }, [approved]);

  // fetch reviews
  useEffect(() => {
    let mounted = true;

    setLoading(true);
    fetch("/api/reviews/hostaway")
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        return response.json();
      })
      .then((payload: ReviewsResponse) => {
        if (!mounted) return;
        setData(payload);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        console.error("Failed to load reviews", error);
        if (!mounted) return;
        setLoadError("We couldn't load the latest reviews. Please try again.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // select options
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    data.reviews.forEach((review) => {
      Object.keys(review.categories).forEach((key) => key && set.add(key));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data.reviews]);

  const channelOptions = useMemo(() => {
    const set = new Set<string>();
    data.reviews.forEach((review) => review.channel && set.add(review.channel));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data.reviews]);

  // filtered + sorted list
  const visible = useMemo(() => {
    const needle = search.toLowerCase();
    const since = timeRange === "all" ? null : Date.now() - Number(timeRange) * 86400000;

    const filtered = data.reviews.filter((r) => {
      const ratingOk = minRating === "" || (r.rating ?? 0) >= Number(minRating);
      const haystack = `${r.listing} ${r.guest} ${r.text}`.toLowerCase();
      const searchOk = !needle || haystack.includes(needle);
      const categoryOk = category === "all" || category in r.categories;
      const channelOk = channel === "all" || r.channel.toLowerCase() === channel.toLowerCase();
      const t = new Date(r.date).getTime();
      const timeOk = since === null || (Number.isNaN(t) ? true : t >= since);
      return ratingOk && searchOk && categoryOk && channelOk && timeOk;
    });

    const sorted = [...filtered].sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      const ra = typeof a.rating === "number" ? a.rating : null;
      const rb = typeof b.rating === "number" ? b.rating : null;
      switch (sortOrder) {
        case "oldest":
          return da - db;
        case "rating-desc":
          return (rb ?? -Infinity) - (ra ?? -Infinity);
        case "rating-asc":
          return (ra ?? Infinity) - (rb ?? Infinity);
        default:
          return db - da;
      }
    });

    return sorted;
  }, [data.reviews, minRating, search, category, channel, timeRange, sortOrder]);

  // top KPIs
  const total = data.reviews.length;
  const approvedCount = data.reviews.filter((r) => approved[r.id]).length;
  const avg = useMemo(() => calculateAverageRating(data.reviews, 1), [data.reviews]);

  return (
    <main className="space-y-6">
      {/* KPI row */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="metric">
          <div className="metric-title">Total reviews</div>
          <div className="mt-1 flex items-end justify-between">
            <div className="metric-value">{total}</div>
            <span className="badge badge-up">+ synced</span>
          </div>
        </div>
        <div className="metric">
          <div className="metric-title">Approved</div>
          <div className="mt-1 flex items-end justify-between">
            <div className="metric-value">{approvedCount}</div>
            <span className="badge badge-up">for website</span>
          </div>
        </div>
        <div className="metric">
          <div className="metric-title">Average rating</div>
          <div className="mt-1 flex items-end justify-between">
            <div className="metric-value">{avg ?? "—"}</div>
            <span className="badge badge-up">/ 10</span>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="dash-card p-4 md:p-5">
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <div className="h2">Filters</div>
            <div className="text-sm text-[#6d7b72]">
              Combine score, category, channel, and recency filters to hone in on patterns.
            </div>
          </div>

          {/* changed from flex-wrap to grid via .filter-row */}
          <div className="filter-row">
            <label className="field">
              <span className="text-sm text-[#6d7b72]">Search</span>
              <input
                className="input w-full"
                placeholder="Listing, guest, or keyword…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                onChange={(e) => setMinRating(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </label>

            <label className="field">
              <span className="text-sm text-[#6d7b72]">Category</span>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">All categories</option>
                {categoryOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {humanize(opt)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="text-sm text-[#6d7b72]">Channel</span>
              <select className="input" value={channel} onChange={(e) => setChannel(e.target.value)}>
                <option value="all">All channels</option>
                {channelOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {humanize(opt)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="text-sm text-[#6d7b72]">Time</span>
              <select
                className="input"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              >
                <option value="all">All time</option>
                <option value="90">Last 90 days</option>
                <option value="180">Last 6 months</option>
                <option value="365">Last 12 months</option>
              </select>
            </label>

            <label className="field">
              <span className="text-sm text-[#6d7b72]">Sort by</span>
              <select
                className="input"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="rating-desc">Rating (high → low)</option>
                <option value="rating-asc">Rating (low → high)</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* Listing summaries – now a compact table */}
{(loading || data.summary.length > 0) && (
  <section className="summary-table-wrap" aria-label="Per-listing summary">
    {loading ? (
      <div className="p-4 text-sm text-[#6d7b72]">Loading summaries…</div>
    ) : (
      <table className="summary-table">
        <thead>
          <tr>
            <th scope="col">Listing</th>
            <th scope="col">Reviews</th>
            <th scope="col" className="text-right">Average rating</th>
          </tr>
        </thead>
        <tbody>
          {data.summary.map((s) => (
            <tr key={s.listing}>
              <td className="summary-td-title">{s.listing}</td>
              <td>
                <span className="pill-muted">{s.count} reviews</span>
              </td>
              <td className="text-right">
                <span className="rating-chip">
                  {s.avgRating !== null ? s.avgRating.toFixed(1) : "—"}
                </span>
                <span className="outof"> / 10</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </section>
)}



      {/* Category insights */}
      {/* (unchanged from your version) */}
      {/* ...snip... the rest stays identical ... */}

      {/* Reviews list */}
      <section className="space-y-2">
        <div className="h2">All reviews</div>
        {loadError && (
          <div className="rounded border border-[#f8d3c7] bg-[#fff4ef] p-3 text-sm text-[#a13c22]">
            {loadError}
          </div>
        )}
        {!loading && !loadError && visible.length === 0 && (
          <div className="text-[#6d7b72]">No reviews match the current filters.</div>
        )}

        <div className="grid gap-3">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <article key={`review-skeleton-${index}`} className="dash-card p-4">
                  <div className="animate-pulse space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="h-4 w-32 rounded bg-[#e7f1ec]" />
                        <div className="h-3 w-24 rounded bg-[#edf5ef]" />
                      </div>
                      <div className="h-3 w-20 rounded bg-[#e7f1ec]" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded bg-[#edf5ef]" />
                      <div className="h-3 w-11/12 rounded bg-[#edf5ef]" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="h-6 w-28 rounded-full bg-[#edf5ef]" />
                      <div className="h-6 w-24 rounded-full bg-[#edf5ef]" />
                    </div>
                  </div>
                </article>
              ))
            : visible.map((r) => (
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
                      {Object.entries(r.categories).map(([name, val]) => (
                        <span
                          key={name}
                          className={`rounded-full px-2.5 py-1 ${
                            typeof val === "number" && val < 8.5
                              ? "bg-[#fdece5] text-[#b04c2f]"
                              : "bg-[#edf5ef] text-[#2f3e35]"
                          }`}
                        >
                          {humanize(name)}: {val ?? "—"}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-4">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!approved[r.id]}
                        onChange={() => setApproved((prev) => ({ ...prev, [r.id]: !prev[r.id] }))}
                      />
                      <span>Approved for website</span>
                    </label>

                    <Link
                      href={`/property/${encodeURIComponent(r.listing)}`}
                      className="text-sm text-[color:var(--accent)] hover:underline"
                    >
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
