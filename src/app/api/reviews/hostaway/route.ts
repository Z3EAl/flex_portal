import { NextResponse } from "next/server";
import { z } from "zod";
import hostawaySeed from "../../../../../data/reviews.hostaway.json";

/** --- Types the frontend expects --- */
type Review = {
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

type ReviewSummary = {
  listing: string;
  count: number;
  avgRating: number | null;
};

/** --- Schema helpers (Hostaway response + mock seed) --- */
const ratingValueSchema = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === null || value === undefined || value === "") return null;
    const numeric = typeof value === "string" ? Number(value) : value;
    return Number.isFinite(numeric) ? Number(numeric) : null;
  });

const hostawayReviewSchema = z.object({
  id: z.coerce.number(),
  type: z.string().optional(),
  status: z.union([z.string(), z.null()]).optional(),
  rating: ratingValueSchema,
  publicReview: z.string().optional(),
  reviewCategory: z
    .array(
      z.object({
        category: z.string(),
        rating: ratingValueSchema,
      })
    )
    .optional(),
  submittedAt: z.string().optional(),
  guestName: z.string().optional(),
  listingName: z.string().optional(),
  channel: z.string().optional(),
});

const hostawayPayloadSchema = z
  .object({
    result: z.array(hostawayReviewSchema).optional(),
    data: z.array(hostawayReviewSchema).optional(),
  })
  .transform((payload) => payload.result ?? payload.data ?? []);

type HostawayReview = z.infer<typeof hostawayReviewSchema>;

const tokenResponseSchema = z.object({
  access_token: z.string().optional(),
  expires_in: z.union([z.number(), z.string()]).optional(),
});

/** --- Mock data (parsed from provided Hostaway JSON) --- */
const MOCK: HostawayReview[] = hostawayPayloadSchema.parse(hostawaySeed);

/** Normalize Hostaway (or mock) item to our Review shape */
function normalize(item: HostawayReview): Review {
  const cats: Record<string, number | null> = {};
  (item.reviewCategory ?? []).forEach((category) => {
    if (category?.category) cats[category.category] = category?.rating ?? null;
  });

  const submitted = item.submittedAt ? new Date(item.submittedAt) : new Date();
  const date = Number.isNaN(submitted.getTime()) ? new Date() : submitted;

  return {
    id: Number(item.id),
    listing: String(item.listingName ?? ""),
    guest: String(item.guestName ?? ""),
    date: date.toISOString(),
    rating: item.rating ?? null,
    categories: cats,
    channel: String(item.channel ?? "hostaway"),
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

  const parsed = tokenResponseSchema.safeParse(await res.json());
  if (!parsed.success) return null;

  const token = parsed.data.access_token;
  const rawExpires = parsed.data.expires_in;
  const expiresInValue = rawExpires !== undefined ? Number(rawExpires) : 3600;
  const expiresIn = Number.isFinite(expiresInValue) && expiresInValue > 0 ? expiresInValue : 3600;

  if (!token) return null;

  tokenCache = {
    token,
    exp: Date.now() + expiresIn * 1000,
  };

  return token;
}

async function fetchFromHostaway(): Promise<{ list: HostawayReview[]; status: number } | null> {
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
    const parsed = hostawayPayloadSchema.safeParse(json);
    if (!parsed.success) {
      return { list: [], status };
    }

    return { list: parsed.data, status };
  } catch {
    return null;
  }
}

/** API handler */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const source = url.searchParams.get("source"); // "hostaway-only" | "hostaway" | "mock"

  let raw: HostawayReview[] = [];
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
