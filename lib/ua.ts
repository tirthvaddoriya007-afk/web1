// User-agent classification for analytics. Detect which in-app browser
// (webview) a visitor arrived with, plus the device class. Falls back to the
// browser family when no webview marker is present.

const BOT_RE =
  /bot|crawl|spider|slurp|preview|headless|phantom|lighthouse|pingdom|uptime|bytespider|gptbot|semrush|ahrefs/i;

// Known in-app browsers (webviews). Order matters: more specific first.
const WEBVIEWS: Array<[RegExp, string]> = [
  [/FBAN|FBAV/, "Facebook"], // Facebook in-app browser (Android + iOS)
  [/Instagram/i, "Instagram"],
  [/WhatsApp/i, "WhatsApp"],
  [/Telegram/i, "Telegram"],
  [/MicroMessenger|WeChat/i, "WeChat"],
  [/Snapchat/i, "Snapchat"],
];

export function isBot(ua: string): boolean {
  return BOT_RE.test(ua);
}

export function classifyUserAgent(ua: string): { client: string; device: string } {
  const s = ua.toLowerCase();

  let client = "";
  for (const [re, name] of WEBVIEWS) {
    if (re.test(s)) {
      client = name;
      break;
    }
  }

  if (!client) {
    // Generic Android webview (any Play Store app that embeds a browser).
    // Checked BEFORE Chrome: webview UAs also contain "Chrome/", so ordering
    // matters. The "; wv)" token appears only in webview platform strings.
    if (/;\s*wv\)/i.test(s)) client = "In-app browser (Android)";
    else if (s.includes("edg/") || s.includes("edge/")) client = "Edge";
    else if (s.includes("crios/")) client = "Chrome";
    // Samsung Internet's UA contains "Chrome/", so it must come first.
    else if (s.includes("samsungbrowser")) client = "Samsung Internet";
    else if (s.includes("chrome/")) client = "Chrome";
    else if (s.includes("safari/")) client = "Safari";
    else if (s.includes("firefox/")) client = "Firefox";
    else if (s.includes("opr/") || s.includes("opera")) client = "Opera";
    // iOS apps embedding WKWebView send a mobile AppleWebKit UA with no
    // browser token at all (real Safari always includes "safari/").
    else if (/applewebkit/i.test(s) && /mobi|ipad|iphone|ipod/i.test(s))
      client = "In-app browser (iOS)";
    else client = "Other";
  }

  let device = "desktop";
  if (/ipad|tablet|tab/i.test(s)) device = "tablet";
  else if (/mobi|android|iphone|ipod|windows phone/i.test(s)) device = "mobile";

  return { client, device };
}
