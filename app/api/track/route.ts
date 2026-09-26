import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { classifyUserAgent, isBot } from "@/lib/ua";

// Fire-and-forget analytics beacon. The storefront's PageViewTracker POSTs
// {path, referrer, utm_*} here on every navigation; this route stores one row
// in page_views and sets a visitor cookie so unique visitors can be counted.
// Bots and admin/api/asset paths are ignored. Always answers 204, even when
// the insert fails — analytics must never break the storefront.

export const runtime = "nodejs";

const VISITOR_COOKIE = "hs_vid";
const BLOCKED_PREFIXES = ["/api/", "/_next/", "/admin", "/favicon"];
const ASSET_RE = /\.[a-z0-9]{2,5}(\?|$)/i;

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || isBot(ua)) return new NextResponse(null, { status: 204 });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const path = typeof body.path === "string" ? body.path.slice(0, 500) : "";
  if (
    !path.startsWith("/") ||
    BLOCKED_PREFIXES.some((p) => path.startsWith(p)) ||
    ASSET_RE.test(path)
  ) {
    return new NextResponse(null, { status: 204 });
  }

  // Visitor identity: reuse the cookie, otherwise mint one for two years.
  let visitorId = req.cookies.get(VISITOR_COOKIE)?.value ?? "";
  const response = new NextResponse(null, { status: 204 });
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365 * 2,
    });
  }

  // Referrer: keep the domain only; drop same-site navigations.
  let referrer = "";
  try {
    const raw = typeof body.referrer === "string" ? body.referrer : "";
    if (raw) {
      const url = new URL(raw);
      if (url.hostname && url.hostname !== req.nextUrl.hostname) {
        referrer = url.hostname.slice(0, 200);
      }
    }
  } catch {
    referrer = "";
  }

  const s = (v: unknown) =>
    typeof v === "string" ? v.trim().slice(0, 200) : "";

  const { client, device } = classifyUserAgent(ua);

  try {
    const supabase = createClient();
    await supabase.from("page_views").insert({
      visitor_id: visitorId,
      path,
      referrer,
      utm_source: s(body.utm_source),
      utm_medium: s(body.utm_medium),
      utm_campaign: s(body.utm_campaign),
      client,
      device,
    });
  } catch {
    // Never fail the visitor's request because analytics is down.
  }

  return response;
}
