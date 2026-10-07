import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isCrawler, isPhone } from "@/lib/ua";

// Two jobs:
//  1. /admin/* — refresh the Supabase session cookie and gate the panel behind
//     a login. The real authorisation check (is this user in public.admins?)
//     happens in app/admin/layout.tsx; this only keeps unauthenticated
//     visitors out early.
//  2. Storefront — phone-only gate. Phones get the full site; desktop/tablet
//     visitors (iPad included) are rewritten to /mobile-only, an endless
//     loader. SEO/social crawlers still see the real site so ad and link
//     previews work. Admin paths are never gated.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  // Dummy entry layer — the Vercel preview URL (and any other domain pointed
  // at this app) is just a door: a 302 that converts the URL to the main
  // store domain, exactly like the reference's Hostinger preview link
  // → tracker link. The path is kept, so /cvft4r/OFFER/... works on both.
  const isMainHost =
    /^(www\.)?big-deal\.online$/i.test(host) ||
    /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host);

  if (!isMainHost) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = "big-deal.online";
    url.port = "";
    return NextResponse.redirect(url, 302);
  }

  if (pathname.startsWith("/admin")) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (pathname !== "/admin/login" && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (pathname === "/admin/login" && user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return response;
  }

  // Storefront device gate (the loader route itself is exempt).
  if (pathname !== "/mobile-only") {
    const ua = request.headers.get("user-agent") ?? "";
    if (!isPhone(ua) && !isCrawler(ua)) {
      const url = request.nextUrl.clone();
      url.pathname = "/mobile-only";
      url.search = "";
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next({ request });
}

// Everything except API routes and Next internals. /admin is included — the
// branch above handles it. Static assets (public/*) never reach middleware.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
