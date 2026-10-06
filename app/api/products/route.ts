import { NextResponse } from "next/server";
import { getProductPage } from "@/lib/catalog";

// Feed pages come from the 10s SWR cache; admin edits invalidate it instantly,
// so the scroll feed is always current and never waits on the database.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  return NextResponse.json(await getProductPage(page));
}
