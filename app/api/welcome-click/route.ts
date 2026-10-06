import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isBot } from "@/lib/ua";

// Welcome-tap beacon. WelcomeClient fires this fire-and-forget POST the moment
// the visitor taps anywhere on the welcome landing (which immediately sends
// them to /home); this route stores one row in welcome_clicks and reuses the
// same visitor cookie as /api/track. Always answers 204, even when the insert
// fails — analytics must never block navigation.

export const runtime = "nodejs";

const VISITOR_COOKIE = "hs_vid";

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || isBot(ua)) return new NextResponse(null, { status: 204 });

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

  try {
    const supabase = createClient();
    await supabase.from("welcome_clicks").insert({ visitor_id: visitorId });
  } catch {
    // Never block navigation because analytics is down.
  }

  return response;
}
