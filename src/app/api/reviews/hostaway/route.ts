import { NextResponse } from "next/server";

/** --- Types the frontend expects --- */
type Review = {
  id: number;
  listing: string;
  guest: string;
  date: string;
  rating: number | null;
  categories: Record<string, number | null>;
  channel: "hostaway" | string;
  type: string;
  text: string;
  status: string | null;
};

type ReviewSummary = {
  listing: string;
  count: number;
  avgRating: number | null;
};

/** --- Mock data (so UI always works) --- */
const MOCK: any[] = [
  {
    id: 1001,
    type: "guest-to-host",
    status: "published",
    rating: 7.5,
    publicReview: "Check-in was smooth. Wi-Fi could be better.",
    reviewCategory: [
      { category: "cleanliness", rating: 8 },
      { category: "communication", rating: 8 },
    ],
    submittedAt: "2022-06-01 00:00:00",
    guestName: "Priya",
    listingName: "1C Soho Loft",
  },
  {
    id: 1002,
    type: "guest-to-host",
    status: "published",
    rating: 8,
    publicReview: "Great location, a bit noisy at night.",
    reviewCategory: [{ category: "location", rating: 9 }],
    submittedAt: "2021-02-10 00:00:00",
    guestName: "Alex M",
    listingName: "1C Soho Loft",
  },
  {
    id: 1003,
    type: "guest-to-host",
    status: "published",
    rating: 10,
    publicReview: "Lovely modern flat near everything.",
    reviewCategory: [
      { category: "cleanliness", rating: 10 },
      { category: "communication", rating: 10 },
    ],
    submittedAt: "2022-05-20 00:00:00",
    guestName: "Sam",
    listingName: "2B N1 A - 29 Shoreditch Heights",
  },
];

/** Normalize Hostaway (or mock) item to our Review shape */
function normalize(item: any): Review {
  const cats: Record<string, number | null> = {};
  (item.reviewCategory ?? []).forEach((c: any) => {
    if (c?.category) cats[c.category] = c?.rating ?? null;
  });

  return {
    id: Number(item.id),
    listing: String(item.listingName ?? ""),
    guest: String(item.guestName ?? ""),
    date: new Date(item.submittedAt ?? Date.now()).toISOString(),
    rating: item.rating ?? null,
    categories: cats,
    channel: "hostaway",
    type: String(item.type ?? "guest-to-host"),
    text: String(item.publicReview ?? "").trim(),
    status: item.status ?? null,
  };
}

/** Per-listing summary for widgets */
function summarize(reviews: Review[]): ReviewSummary[] {
  const map = new Map<string, { count: number; sum: number; n: number }>();
  for (const r of reviews) {
    const key = r.listing || "Unknown listing";
    if (!map.has(key)) map.set(key, { count: 0, sum: 0, n: 0 });
    const s = map.get(key)!;
    s.count += 1;
    if (typeof r.rating === "number") {
      s.sum += r.rating;
      s.n += 1;
    }
  }
  return Array.from(map.entries()).map(([listing, { count, sum, n }]) => ({
    listing,
    count,
    avgRating: n ? Number((sum / n).toFixed(2)) : null,
  }));
}

/** ===== Hostaway OAuth (Client Credentials) ===== */
let tokenCache: { token: string; exp: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  const base = process.env.HOSTAWAY_BASE_URL || "https://api.hostaway.com/v1";
  const clientId = process.env.HOSTAWAY_ACCOUNT_ID; // per Hostaway: client_id is the account id
  const clientSecret = process.env.HOSTAWAY_API_KEY; // client_secret is the API key
  const scope = process.env.HOSTAWAY_SCOPE || "general";

  if (!clientId || !clientSecret) return null;

  // reuse token if still valid (refresh 60s early)
  if (tokenCache && Date.now() < tokenCache.exp - 60_000) {
    return tokenCache.token;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope,
  });

  const res = await fetch(`${base}/accessTokens`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json: any = await res.json();
  const token = json?.access_token as string | undefined;
  const expiresIn = Number(json?.expires_in) || 3600;

  if (!token) return null;

  tokenCache = {
    token,
    exp: Date.now() + expiresIn * 1000,
  };

  return token;
}

async function fetchFromHostaway(): Promise<{ list: any[]; status: number } | null> {
  try {
    const useApi = process.env.HOSTAWAY_USE_API === "true";
    if (!useApi) return null;

    const base = process.env.HOSTAWAY_BASE_URL || "https://api.hostaway.com/v1";
    const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
    if (!accountId) return null;

    const token = await getAccessToken();
    if (!token) return { list: [], status: 401 };

    const res = await fetch(`${base}/reviews?limit=200&order=desc`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-account-id": accountId,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const status = res.status;
    if (!res.ok) return { list: [], status };

    const json = await res.json();
    const list = json?.result ?? json?.data ?? [];
    if (!Array.isArray(list)) return { list: [], status };

    return { list, status };
  } catch {
    return null;
  }
}

/** API handler */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const source = url.searchParams.get("source"); // "hostaway-only" | "hostaway" | "mock"

  let raw: any[] = [];
  let dataSource = "mock";
  let hostStatus = "n/a";
  let hostCount = 0;

  if (source !== "mock") {
    const hostaway = await fetchFromHostaway();
    if (hostaway) {
      hostStatus = String(hostaway.status);
      hostCount = Array.isArray(hostaway.list) ? hostaway.list.length : 0;
      if (source === "hostaway-only") {
        raw = hostaway.list; // use exactly what the sandbox returned (even if empty)
        dataSource = "hostaway";
      } else {
        // auto mode: prefer hostaway if it returned anything, else mock
        if (hostCount > 0) {
          raw = hostaway.list;
          dataSource = "hostaway";
        }
      }
    }
  }

  if (raw.length === 0 && source !== "hostaway-only") {
    raw = MOCK;
    dataSource = "mock";
  }

  const reviews: Review[] = raw.map(normalize);
  const summary = summarize(reviews);

  return NextResponse.json(
    { reviews, summary },
    {
      headers: {
        "Cache-Control": "no-store",
        "x-data-source": dataSource,
        "x-env-use-api": String(process.env.HOSTAWAY_USE_API === "true"),
        "x-hostaway-raw-count": String(hostCount),
        "x-hostaway-status": hostStatus,
      },
    }
  );
}
