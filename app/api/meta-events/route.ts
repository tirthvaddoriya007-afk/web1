import { NextRequest, NextResponse } from "next/server";
import { META_PIXEL_ID } from "@/lib/meta-config";

export const runtime = "nodejs";

const ALLOWED_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "Search",
  "AddToCart",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Purchase",
]);

interface MetaEventRequest {
  eventName: string;
  eventId: string;
  sourceUrl: string;
  customData?: {
    content_ids?: string[];
    content_type?: "product";
    contents?: { id: string; quantity: number; item_price: number }[];
    currency?: "INR";
    value?: number;
    search_string?: string;
    payment_method?: string;
    num_items?: number;
  };
}

function isValidCustomData(value: unknown): value is MetaEventRequest["customData"] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  if (data.value !== undefined && (typeof data.value !== "number" || !Number.isFinite(data.value) || data.value < 0)) {
    return false;
  }
  if (data.content_ids !== undefined &&
      (!Array.isArray(data.content_ids) || !data.content_ids.every((id) => typeof id === "string" && id.length <= 200))) {
    return false;
  }
  if (data.contents !== undefined &&
      (!Array.isArray(data.contents) || !data.contents.every((item) =>
        typeof item === "object" && item !== null &&
        typeof item.id === "string" &&
        typeof item.quantity === "number" && Number.isInteger(item.quantity) && item.quantity > 0 &&
        typeof item.item_price === "number" && Number.isFinite(item.item_price) && item.item_price >= 0
      ))) {
    return false;
  }
  if (data.search_string !== undefined &&
      (typeof data.search_string !== "string" || data.search_string.length > 200)) {
    return false;
  }
  if (data.payment_method !== undefined &&
      (typeof data.payment_method !== "string" || data.payment_method.length > 80)) {
    return false;
  }
  if (data.num_items !== undefined &&
      (typeof data.num_items !== "number" || !Number.isInteger(data.num_items) || data.num_items < 0)) {
    return false;
  }
  return data.content_type === undefined || data.content_type === "product";
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  let requestOrigin: string;
  try {
    requestOrigin = origin ? new URL(origin).origin : "";
  } catch {
    requestOrigin = "";
  }
  if (!requestOrigin || requestOrigin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const rawBody = await request.text();
  if (rawBody.length > 10_000) {
    return NextResponse.json({ error: "Event payload is too large." }, { status: 413 });
  }

  let event: MetaEventRequest;
  try {
    event = JSON.parse(rawBody) as MetaEventRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (
    !event ||
    !ALLOWED_EVENTS.has(event.eventName) ||
    typeof event.eventId !== "string" ||
    !/^[\w.-]{1,100}$/.test(event.eventId) ||
    typeof event.sourceUrl !== "string" ||
    !isValidCustomData(event.customData ?? {})
  ) {
    return NextResponse.json({ error: "Invalid Meta event payload." }, { status: 400 });
  }

  let sourceUrl: URL;
  try {
    sourceUrl = new URL(event.sourceUrl);
  } catch {
    return NextResponse.json({ error: "Invalid event source URL." }, { status: 400 });
  }
  if (sourceUrl.origin !== request.nextUrl.origin || !["http:", "https:"].includes(sourceUrl.protocol)) {
    return NextResponse.json({ error: "Event source URL must match this site." }, { status: 400 });
  }
  sourceUrl.search = "";
  sourceUrl.hash = "";

  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  const graphVersion = process.env.META_GRAPH_API_VERSION || "v24.0";
  if (!META_PIXEL_ID || !accessToken) {
    console.error("Meta Conversions API is disabled: configure the Pixel ID and server access token.");
    return NextResponse.json({ error: "Meta Conversions API is not configured." }, { status: 503 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
  const cookies = request.cookies;
  const userData: Record<string, string> = {};
  const userAgent = request.headers.get("user-agent");
  const fbp = cookies.get("_fbp")?.value;
  const fbc = cookies.get("_fbc")?.value;
  if (clientIp) userData.client_ip_address = clientIp;
  if (userAgent) userData.client_user_agent = userAgent;
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const payload = {
    data: [{
      event_name: event.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: event.eventId,
      action_source: "website",
      event_source_url: sourceUrl.toString(),
      user_data: userData,
      custom_data: event.customData ?? {},
    }],
  };

  let response: Response;
  try {
    response = await fetch(
      `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(META_PIXEL_ID)}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      }
    );
  } catch (error) {
    console.error("Meta Conversions API request failed:", error);
    return NextResponse.json({ error: "Could not reach Meta Conversions API." }, { status: 502 });
  }

  if (!response.ok) {
    const details = await response.text();
    console.error("Meta Conversions API rejected an event:", response.status, details);
    return NextResponse.json({ error: "Meta Conversions API rejected the event." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
