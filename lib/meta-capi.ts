import { createHash } from "crypto";
import { brand } from "@/lib/brand";
import { META_PIXEL_ID } from "@/lib/meta-config";

function hashPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.length === 10 ? `91${digits}` : digits;
  return createHash("sha256").update(normalized).digest("hex");
}

export async function sendPurchaseEvent(order: Record<string, unknown>) {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!META_PIXEL_ID || !accessToken) return "Meta CAPI is not configured.";

  const items = Array.isArray(order.items) ? order.items : [];
  const userData: Record<string, unknown> = {
    ph: [hashPhone(String(order.customer_phone))],
  };
  if (typeof order.meta_fbp === "string" && order.meta_fbp) userData.fbp = order.meta_fbp;
  if (typeof order.meta_fbc === "string" && order.meta_fbc) userData.fbc = order.meta_fbc;
  if (typeof order.meta_client_ip === "string" && order.meta_client_ip) {
    userData.client_ip_address = order.meta_client_ip;
  }
  if (typeof order.meta_user_agent === "string" && order.meta_user_agent) {
    userData.client_user_agent = order.meta_user_agent;
  }

  const event = {
    data: [{
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: `purchase-${String(order.id)}`,
      action_source: "website",
      event_source_url: `${brand.siteUrl}/summary`,
      user_data: userData,
      custom_data: {
        content_ids: items.map((item) => String((item as Record<string, unknown>).hash)),
        content_type: "product",
        contents: items.map((item) => {
          const value = item as Record<string, unknown>;
          return {
            id: String(value.hash),
            quantity: Number(value.qty),
            item_price: Number(value.price),
          };
        }),
        value: Number(order.total),
        currency: "INR",
        num_items: items.reduce((count, item) => count + Number((item as Record<string, unknown>).qty), 0),
      },
    }],
  };

  const graphVersion = process.env.META_GRAPH_API_VERSION || "v24.0";
  let response: Response;
  try {
    response = await fetch(
      `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(META_PIXEL_ID)}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
        signal: AbortSignal.timeout(8000),
      }
    );
  } catch (error) {
    console.error("Verified-order Meta Purchase event request failed:", error);
    return "Could not reach Meta Conversions API.";
  }

  if (!response.ok) {
    console.error("Meta rejected a verified-order Purchase event:", response.status, await response.text());
    return "Meta Conversions API rejected the Purchase event.";
  }
  return null;
}
