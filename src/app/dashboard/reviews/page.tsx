"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Review = {
  id: number;
  listing: string;
  guest: string;
  date: string;
  rating: number | null;
  categories: Record<string, number | null>;
  channel: "hostaway";
  type: string;
  text: string;
  status: string | null;
};

type ReviewSummary = {
  listing: string;
  count: number;
  avgRating: number | null;
};

export default function ReviewsDashboard() {
  const [data, setData] = useState<{ reviews: Review[]; summary: ReviewSummary[] }>({ reviews: [], summary: [] });
  const [minRating, setMinRating] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [approved, setApproved] = useState<Record<number, boolean>>({});

  useEffect(() => { const s = localStorage.getItem("approved"); if (s) setApproved(JSON.parse(s)); }, []);
  useEffect(() => { localStorage.setItem("approved", JSON.stringify(approved)); }, [approved]);

  useEffect(() => {
    fetch("/api/reviews/hostaway")
      .then(r => r.json())
      .then((payload: { reviews: Review[]; summary: ReviewSummary[] }) => setData(payload));
  }, []);

  const filtered = useMemo(() => {
    return data.reviews.filter(r => {
      const okRating = minRating === "" || (r.rating ?? 0) >= Number(minRating);
      const hay = (r.listing + " " + r.guest + " " + r.text).toLowerCase();
      const okSearch = !search || hay.includes(search.toLowerCase());
      return okRating && okSearch;
    });
  }, [data.reviews, minRating, search]);

  const total = data.reviews.length;
  const approvedCount = data.reviews.filter(r => approved[r.id]).length;
  const avg =
    total === 0 ? null : Math.round((data.reviews.reduce((a, r) => a + (r.rating ?? 0), 0) / total) * 10) / 10;

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
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="h2">Filters</div>
            <div className="text-sm text-[#6d7b72]">Refine results by score or text</div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
            <input
              className="input"
              placeholder="Search listing / guest / text…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
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
                {s.avgRating ?? "—"}
              </div>
              <div className="text-xs text-[#6d7b72]">{s.count} reviews</div>
            </div>
          ))}
        </section>
      )}

      {/* Reviews list */}
      <section className="space-y-2">
        <div className="h2">All reviews</div>
        {filtered.length === 0 && <div className="text-[#6d7b72]">No reviews match the current filters.</div>}

        <div className="grid gap-3">
          {filtered.map(r => (
            <article key={r.id} className="dash-card p-4">
              <div className="flex items-center justify-between">
                <Link
                  href={`/property/${encodeURIComponent(r.listing)}`}
                  className="font-medium text-[color:var(--accent)] hover:underline"
                >
                  {r.listing}
                </Link>
                <div className="text-sm text-[#6d7b72]">{r.date}</div>
              </div>

              <div className="text-sm text-[#67756f]">{r.guest} • {r.type}</div>
              <p className="mt-2">{r.text}</p>
              <div className="mt-2 text-sm">Rating: {r.rating ?? "—"}</div>

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
