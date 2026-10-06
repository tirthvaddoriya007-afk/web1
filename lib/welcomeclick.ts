/**
 * Fire a welcome-tap beacon to /api/welcome-click. Call only from client
 * event handlers — same fire-and-forget contract as trackPixel / trackPayClick.
 * A tap is any click anywhere on the welcome landing (every tap sends the
 * visitor to /home); the auto-redirect timer does NOT count as a tap.
 */
export function trackWelcomeClick() {
  if (typeof window === "undefined") return;
  fetch("/api/welcome-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    keepalive: true, // survives the immediate navigation to /home
  }).catch(() => {
    /* analytics must never block navigation */
  });
}
