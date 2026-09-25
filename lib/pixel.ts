/**
 * Fire a Meta Pixel event if the pixel is present on the page. Call only from
 * client event handlers — the pixel itself is loaded by <MetaPixel />.
 */
export function trackPixel(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq === "function") fbq("track", event, params);
}
