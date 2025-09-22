"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Review = {
  id: number;
  listing: string;
  guest: string;
  date: string;
  rating: number | null;
  text: string;
};

export default function Property() {
  const params = useParams<{ slug: string }>();
  const rawSlug = Array.isArray(params.slug) ? params.slug.join("/") : params.slug;
  const slug = decodeURIComponent(rawSlug || "");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [approved, setApproved] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("approved");
    if (saved) setApproved(JSON.parse(saved));
    fetch("/api/reviews/hostaway")
      .then(r => r.json())
      .then(d => setReviews(d.reviews ?? []));
  }, []);

  const visible = useMemo(
    () => reviews.filter(r => r.listing === slug && approved[r.id]),
    [reviews, approved, slug]
  );

  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{slug}</h1>
        <p className="text-sm text-gray-600">Guest Reviews</p>
      </header>

      {visible.length === 0 ? (
        <div className="text-gray-500">No approved reviews yet.</div>
      ) : (
        <div className="grid gap-3">
          {visible.map(r => (
            <div key={r.id} className="rounded-2xl border p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{r.guest}</div>
                <div className="text-sm">{r.date}</div>
              </div>
              <div className="text-sm">Rating: {r.rating ?? "—"}</div>
              <p className="mt-2">{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
