"use client";

import { META_PIXEL_ID } from "@/lib/meta-config";

export type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "Search"
  | "AddToCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase";

export interface MetaEventData {
  content_ids?: string[];
  content_type?: "product";
  contents?: { id: string; quantity: number; item_price: number }[];
  currency?: "INR";
  value?: number;
  search_string?: string;
  payment_method?: string;
  num_items?: number;
}

interface Fbq {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: (...args: unknown[]) => void;
  loaded: boolean;
  version: string;
}

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let initializedPixelId: string | null = null;

function initializePixel(): Fbq | null {
  if (typeof window === "undefined") return null;

  if (!window.fbq) {
    const fbq: Fbq = (...args) => {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    };
    fbq.queue = [];
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  const fbq = window.fbq;
  if (initializedPixelId !== META_PIXEL_ID) {
    fbq("init", META_PIXEL_ID);
    initializedPixelId = META_PIXEL_ID;
  }
  return fbq;
}

function makeEventId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function trackMetaEvent(
  eventName: MetaEventName,
  customData: MetaEventData = {},
  eventId = makeEventId()
): string | null {
  const fbq = initializePixel();
  if (!fbq) return null;

  fbq("track", eventName, customData, { eventID: eventId });

  const source = new URL(window.location.href);
  source.search = "";
  source.hash = "";

  void fetch("/api/meta-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName, eventId, sourceUrl: source.toString(), customData }),
    keepalive: true,
  }).then(async (response) => {
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      console.error("Meta Conversions API event failed:", result?.error ?? response.statusText);
    }
  }).catch((error: unknown) => {
    console.error("Could not send Meta Conversions API event:", error);
  });

  return eventId;
}

export function trackMetaEventOnce(
  storageKey: string,
  eventName: MetaEventName,
  customData: MetaEventData
): void {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(storageKey)) return;
    const eventId = makeEventId();
    window.localStorage.setItem(storageKey, eventId);
    trackMetaEvent(eventName, customData, eventId);
  } catch (error) {
    console.error("Could not persist Meta event deduplication state:", error);
  }
}
