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

// Phones only — iPad/tablets are deliberately NOT phones here: the store is
// phone-only and desktop/iPad visitors get the loader screen instead. This
// also correctly excludes iPadOS 13+ which reports as "Macintosh", and
// Android tablets whose Chrome UA drops the "Mobile" token.
const PHONE_RE =
  /iphone|ipod|android[\s\S]*?mobile|windows phone|iemobile|blackberry|opera mini|webos/i;

export function isPhone(ua: string): boolean {
  if (!ua) return false;
  const s = ua.toLowerCase();
  if (/ipad|macintosh|tablet/i.test(s)) return false;
  return PHONE_RE.test(s);
}

// SEO + social crawlers that must see the real storefront (search indexing and
// ad/link previews). Wider than isBot: several preview crawlers have no "bot"
// token in their UA (facebookexternalhit, WhatsApp, Telegram, …).
const CRAWLER_RE =
  /facebookexternalhit|metaexternalagent|whatsapp|telegram|pinterest|linkedin|discord|viber/i;

export function isCrawler(ua: string): boolean {
  return isBot(ua) || CRAWLER_RE.test(ua);
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
