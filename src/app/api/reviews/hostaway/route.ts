import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

type RawReview = {
  id: number;
  type: string | null;
  status: string | null;
  rating: number | null;
  publicReview: string | null;
  reviewCategory: { category: string; rating: number | null }[] | null;
  submittedAt: string; // "YYYY-MM-DD HH:mm:ss"
  guestName: string | null;
  listingName: string | null;
};

type NormalizedReview = {
  id: number;
  listing: string;
  guest: string;
  date: string;           // YYYY-MM-DD
  rating: number | null;  // overall if present, else avg categories
  categories: Record<string, number | null>;
  channel: "hostaway";
  type: "guest-to-host" | "host-to-guest" | "unknown";
  text: string;
  status: string | null;
};

function normalize(raw: RawReview): NormalizedReview {
  const categories: Record<string, number | null> = {};
  const arr = raw.reviewCategory ?? [];
  for (const c of arr) categories[c.category] = c.rating ?? null;

  let overall: number | null = raw.rating;
  if (overall == null && arr.length) {
    const nums = arr.map(c => c.rating).filter((v): v is number => typeof v === "number");
    overall = nums.length ? Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2)) : null;
  }

  const date = raw.submittedAt?.slice(0, 10) || "1970-01-01";

  return {
    id: raw.id,
    listing: raw.listingName ?? "Unknown listing",
    guest: raw.guestName ?? "Anonymous",
    date,
    rating: overall,
    categories,
    channel: "hostaway",
    type: raw.type === "guest-to-host" || raw.type === "host-to-guest" ? raw.type : "unknown",
    text: raw.publicReview ?? "",
    status: raw.status ?? null
  };
}

export async function GET() {
  const file = path.join(process.cwd(), "data", "reviews.hostaway.json");
  const raw = JSON.parse(await fs.readFile(file, "utf8")) as { result: RawReview[] };
  const reviews = (raw.result ?? []).map(normalize);

  // summaries by listing
  const byListing = new Map<string, NormalizedReview[]>();
  for (const r of reviews) {
    if (!byListing.has(r.listing)) byListing.set(r.listing, []);
    byListing.get(r.listing)!.push(r);
  }
  const summary = [...byListing.entries()].map(([listing, items]) => {
    const nums = items.map(i => i.rating).filter((n): n is number => typeof n === "number");
    const avg = nums.length ? Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2)) : null;
    return { listing, count: items.length, avgRating: avg };
  });

  return NextResponse.json({ reviews, summary });
}

