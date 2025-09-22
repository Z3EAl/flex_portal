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

export default function Dashboard() {
  const [data, setData] = useState<{ reviews: Review[]; summary: ReviewSummary[] }>({
    reviews: [],
    summary: [],
  });
  const [minRating, setMinRating] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [approved, setApproved] = useState<Record<number, boolean>>({});

  // load approved from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("approved");
    if (saved) setApproved(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem("approved", JSON.stringify(approved));
  }, [approved]);

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

  return (
    <main className="p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <h1 className="text-2xl font-semibold">Flex Living — Reviews Dashboard</h1>
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm">Min rating</label>
            <input
              className="border rounded px-2 py-1"
              type="number"
              min={0}
              max={10}
              value={minRating}
              onChange={e => setMinRating(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
          <input
            className="border rounded px-2 py-1"
            placeholder="Search listing/guest/text…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </header>

      <section className="grid md:grid-cols-2 gap-4">
        {data.summary.map(s => (
          <div key={s.listing} className="rounded-2xl border p-4">
            <div className="text-sm text-gray-500">{s.listing}</div>
            <div className="text-3xl font-bold">{s.avgRating ?? "—"}</div>
            <div className="text-xs text-gray-500">{s.count} reviews</div>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">All Reviews</h2>

        {filtered.length === 0 && (
          <div className="text-gray-500">No reviews match the current filters.</div>
        )}

        <div className="grid gap-3">
          {filtered.map(r => (
            <article key={r.id} className="rounded-2xl border p-4">
              <div className="flex items-center justify-between">
                {/* Make the listing name link to the property page */}
                <Link
                  href={`/property/${encodeURIComponent(r.listing)}`}
                  className="font-medium text-blue-600 underline"
                >
                  {r.listing}
                </Link>
                <div className="text-sm">{r.date}</div>
              </div>

              <div className="text-sm text-gray-600">{r.guest} • {r.type}</div>
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

                {/* Optional: secondary link at bottom */}
                <Link
                  href={`/property/${encodeURIComponent(r.listing)}`}
                  className="text-blue-600 underline text-sm"
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
