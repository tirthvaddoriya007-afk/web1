import { NextRequest, NextResponse } from "next/server";
import type { Address, CartItem, Order } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PAYMENT_MODES = new Set(["Cash on Delivery"]);
const MAX_ITEMS = 50;
const MAX_QUANTITY = 50;
const MAX_TOTAL_ITEMS = 100;
const round2 = (value: number) => Math.round(value * 100) / 100;

interface CreateOrderRequest {
  items: { hash: string; qty: number; size?: string }[];
  address: Address;
  paymentMode: string;
}

function isAddress(value: unknown): value is Address {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const address = value as Record<string, unknown>;
  return (
    typeof address.name === "string" && address.name.trim().length >= 3 && address.name.length <= 100 &&
    typeof address.number === "string" && /^[6-9]\d{9}$/.test(address.number) &&
    typeof address.pin === "string" && /^\d{6}$/.test(address.pin) &&
    typeof address.city === "string" && address.city.trim().length > 0 && address.city.length <= 100 &&
    typeof address.flat === "string" && address.flat.trim().length > 0 && address.flat.length <= 200 &&
    typeof address.area === "string" && address.area.trim().length > 0 && address.area.length <= 200 &&
    (address.state === undefined || (typeof address.state === "string" && address.state.length <= 100))
  );
}

function isOrderRequest(value: unknown): value is CreateOrderRequest {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const request = value as Record<string, unknown>;
  return (
    Array.isArray(request.items) &&
    request.items.length > 0 &&
    request.items.length <= MAX_ITEMS &&
    request.items.every((item) =>
      typeof item === "object" && item !== null &&
      typeof item.hash === "string" && /^[\w-]{1,128}$/.test(item.hash) &&
      typeof item.qty === "number" && Number.isInteger(item.qty) && item.qty > 0 && item.qty <= MAX_QUANTITY &&
      (item.size === undefined || (typeof item.size === "string" && /^(S|M|L|XL|XXL|XXXL)$/.test(item.size)))
    ) &&
    isAddress(request.address) &&
    typeof request.paymentMode === "string" && PAYMENT_MODES.has(request.paymentMode)
  );
}

function responseError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
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
    return responseError("Invalid request origin.", 403);
  }

  const rawBody = await request.text();
  if (rawBody.length > 20_000) return responseError("Order payload is too large.", 413);

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return responseError("Invalid JSON payload.", 400);
  }
  if (!isOrderRequest(payload)) return responseError("Invalid order details.", 400);

  const totalItems = payload.items.reduce((sum, item) => sum + item.qty, 0);
  if (totalItems > MAX_TOTAL_ITEMS) return responseError("Too many items in this order.", 400);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Order persistence is not configured: Supabase server credentials are missing.");
    return responseError("Order storage is not configured.", 503);
  }

  try {
    const supabase = createAdminClient();
    const hashes = [...new Set(payload.items.map((item) => item.hash))];
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("hash, name, price, mrp, image")
      .in("hash", hashes);

    if (productsError) {
      console.error("Could not verify order products:", productsError.message);
      return responseError("Could not verify products for this order.", 502);
    }

    const productByHash = new Map((products ?? []).map((product) => [product.hash, product]));
    if (hashes.some((hash) => !productByHash.has(hash))) {
      return responseError("One or more products are no longer available.", 400);
    }

    const items: CartItem[] = payload.items.map((item) => {
      const product = productByHash.get(item.hash)!;
      return {
        hash: product.hash,
        name: product.name,
        price: Number(product.price),
        mrp: Number(product.mrp),
        image: product.image,
        qty: item.qty,
        ...(item.size ? { size: item.size } : {}),
      };
    });

    if (items.some((item) => !Number.isFinite(item.price) || item.price < 0 || !Number.isFinite(item.mrp))) {
      console.error("Supabase returned invalid product prices while creating an order.");
      return responseError("Could not verify product prices.", 502);
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discountPercent = totalItems >= 4 ? 30 : totalItems === 3 ? 20 : totalItems === 2 ? 10 : 0;
    const total = round2(subtotal - round2((subtotal * discountPercent) / 100));
    const placedAt = new Date().toISOString();
    const order: Order = {
      id: `OD${crypto.randomUUID().replace(/-/g, "").toUpperCase()}`,
      items,
      total,
      address: payload.address,
      paymentMode: payload.paymentMode,
      status: "Confirmed",
      placedAt,
    };

    const { error: insertError } = await supabase.from("orders").insert({
      id: order.id,
      customer_name: order.address.name.trim(),
      customer_phone: order.address.number,
      address: order.address,
      items: order.items,
      total: order.total,
      payment_mode: order.paymentMode,
      status: order.status,
      placed_at: order.placedAt,
    });

    if (insertError) {
      console.error("Could not save order to Supabase:", insertError.message);
      return responseError("Could not save your order. Please try again.", 502);
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Order creation failed:", error);
    return responseError("Could not save your order. Please try again.", 500);
  }
}
