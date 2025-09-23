import { z } from "zod";

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  normalizeHostawayReview,
  parseHostawayPayload,
  summarizeReviews,
  type HostawayReview,
} from "./hostaway.ts";
import type { Review, ReviewSummary } from "./reviews.ts";

const tokenResponseSchema = z.object({
  access_token: z.string().optional(),
  expires_in: z.union([z.number(), z.string()]).optional(),
});

const currentDir = dirname(fileURLToPath(import.meta.url));
const hostawaySeedPath = resolve(currentDir, "../../data/reviews.hostaway.json");
const hostawaySeed = JSON.parse(readFileSync(hostawaySeedPath, "utf-8"));

const MOCK: HostawayReview[] = parseHostawayPayload(hostawaySeed);

let tokenCache: { token: string; exp: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  const base = process.env.HOSTAWAY_BASE_URL || "https://api.hostaway.com/v1";
  const clientId = process.env.HOSTAWAY_ACCOUNT_ID;
  const clientSecret = process.env.HOSTAWAY_API_KEY;
  const scope = process.env.HOSTAWAY_SCOPE || "general";

  if (!clientId || !clientSecret) return null;

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
    try {
      const parsed = parseHostawayPayload(json);
      return { list: parsed, status };
    } catch {
      return { list: [], status };
    }
  } catch {
    return null;
  }
}

export type LoadHostawayOptions = {
  source?: string | null;
};

export type HostawayLoadResult = {
  reviews: Review[];
  summary: ReviewSummary[];
  meta: {
    dataSource: string;
    envUseApi: string;
    hostawayStatus: string;
    hostawayCount: number;
  };
};

export async function loadHostawayReviews(
  options: LoadHostawayOptions = {}
): Promise<HostawayLoadResult> {
  const source = options.source ?? null;

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
        raw = hostaway.list;
        dataSource = "hostaway";
      } else if (hostCount > 0) {
        raw = hostaway.list;
        dataSource = "hostaway";
      }
    }
  }

  if (raw.length === 0 && source !== "hostaway-only") {
    raw = MOCK;
    dataSource = "mock";
  }

  const reviews = raw.map(normalizeHostawayReview);
  const summary = summarizeReviews(reviews);

  return {
    reviews,
    summary,
    meta: {
      dataSource,
      envUseApi: String(process.env.HOSTAWAY_USE_API === "true"),
      hostawayStatus: hostStatus,
      hostawayCount: hostCount,
    },
  };
}
