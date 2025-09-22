"use client";

import { useEffect, useMemo, useState } from "react";
import ReviewCard from "@/components/ReviewCard";

type Review = {
  id: number;
  listing: string;
  guest: string;
  date: string;
  rating: number | null;
  text: string;
};

export default function ApprovedReviews({ listing }: { listing: string }) {
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
    () => reviews.filter(r => r.listing === listing && approved[r.id]),
    [reviews, approved, listing]
  );

  if (visible.length === 0) {
    return <div className="text-gray-500">No approved reviews yet.</div>;
  }

  return (
    <div className="grid gap-3">
      {visible.map(r => (
        <ReviewCard
          key={r.id}
          guest={r.guest}
          date={r.date}
          rating={r.rating}
          text={r.text}
        />
      ))}
    </div>
  );
}
