import { NextResponse } from "next/server";

import { loadHostawayReviews } from "@/lib/hostaway-service";

/** API handler */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const source = url.searchParams.get("source");

  const { reviews, summary, meta } = await loadHostawayReviews({ source });

  return NextResponse.json(
    { reviews, summary },
    {
      headers: {
        "Cache-Control": "no-store",
        "x-data-source": meta.dataSource,
        "x-env-use-api": meta.envUseApi,
        "x-hostaway-raw-count": String(meta.hostawayCount),
        "x-hostaway-status": meta.hostawayStatus,
        "x-google-source": meta.googleSource,
        "x-google-status": meta.googleStatus,
        "x-google-count": String(meta.googleCount),
        "x-google-env-use-api": meta.googleEnvUseApi,
      },
    }
  );
}
