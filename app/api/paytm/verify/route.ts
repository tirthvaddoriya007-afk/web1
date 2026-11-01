import { NextRequest, NextResponse } from "next/server";
import { verifyAndUpdatePaytmOrder } from "@/lib/paytm-order";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return errorResponse("Invalid request origin.", 403);
  }

  const rawBody = await request.text();
  if (rawBody.length > 2_000) return errorResponse("Request is too large.", 413);

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return errorResponse("Invalid JSON payload.", 400);
  }
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload) ||
    typeof (payload as Record<string, unknown>).orderId !== "string" ||
    !/^OD[A-F0-9]{32}$/.test((payload as Record<string, string>).orderId)
  ) {
    return errorResponse("Invalid order ID.", 400);
  }

  try {
    const result = await verifyAndUpdatePaytmOrder((payload as { orderId: string }).orderId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Could not verify Paytm order:", error);
    const message = error instanceof Error ? error.message : "Could not verify this payment.";
    const status = message === "Order not found." ? 404 : 502;
    return errorResponse(message, status);
  }
}
