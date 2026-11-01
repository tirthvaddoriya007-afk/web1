import { NextRequest, NextResponse } from "next/server";
import { brand } from "@/lib/brand";
import { verifyAndUpdatePaytmOrder } from "@/lib/paytm-order";
import { verifyPaytmCallback } from "@/lib/paytm";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (rawBody.length > 20_000) {
    return NextResponse.json({ error: "Callback is too large." }, { status: 413 });
  }

  const fields: Record<string, string> = {};
  for (const [key, value] of new URLSearchParams(rawBody)) fields[key] = value;

  let callbackIsValid = false;
  try {
    callbackIsValid = await verifyPaytmCallback(fields);
  } catch (error) {
    console.error("Could not validate Paytm callback:", error);
  }
  if (!callbackIsValid) {
    console.error("Rejected Paytm callback with an invalid checksum.");
    return NextResponse.json({ error: "Invalid Paytm callback." }, { status: 400 });
  }

  const orderId = fields.ORDERID;
  if (!orderId || !/^OD[A-F0-9]{32}$/.test(orderId)) {
    return NextResponse.json({ error: "Invalid Paytm order ID." }, { status: 400 });
  }

  try {
    await verifyAndUpdatePaytmOrder(orderId);
  } catch (error) {
    console.error("Paytm callback status verification failed:", error);
  }

  const resultUrl = new URL("/payment/result", brand.siteUrl);
  resultUrl.searchParams.set("order", orderId);
  return NextResponse.redirect(resultUrl, 303);
}
