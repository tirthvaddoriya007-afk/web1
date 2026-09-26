/**
 * Fire a Pay Now / Place Order click beacon to /api/pay-click. Call only from
 * client event handlers — same fire-and-forget contract as trackPixel.
 */
export function trackPayClick(method: string, amount: number) {
  if (typeof window === "undefined") return;
  fetch("/api/pay-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method, amount }),
    keepalive: true, // survives the UPI handoff closing the tab
  }).catch(() => {
    /* analytics must never break checkout */
  });
}
