import { NextRequest, NextResponse } from "next/server";
import { isValidLang } from "./types/lang";

/**
 * Known month names for route detection
 */
const KNOWN_MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec"
];

/**
 * Middleware to handle language routing and legacy redirects
 *
 * - Redirects `/` to `/ta/` (Tamil as default)
 * - Redirects `?la=en` to `/en/...`
 * - Redirects `?la=ta` to `/ta/...`
 * - Redirects legacy paths like `/feb/day/1` to `/ta/feb/day/1`
 * - Sets language cookie based on URL
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const laParam = searchParams.get("la");
  const pathSegments = pathname.split("/").filter(Boolean);

  // Helper to get preferred language
  const getPreferredLang = (): "en" | "ta" => {
    const langCookie = request.cookies.get("lang")?.value;
    if (langCookie === "en" || langCookie === "ta") {
      return langCookie;
    }
    const acceptLanguage = request.headers.get("accept-language") || "";
    const prefersTamil = acceptLanguage.includes("ta");
    const prefersEnglish = acceptLanguage.includes("en");
    if (prefersEnglish && !prefersTamil) {
      return "en";
    }
    return "ta"; // Default to Tamil
  };

  // Handle legacy query param redirects (e.g., /?la=en, /feb/day/1?la=ta)
  if (laParam === "en" || laParam === "ta") {
    const newUrl = new URL(request.url);
    newUrl.searchParams.delete("la");
    newUrl.pathname = `/${laParam}${pathname === "/" ? "" : pathname}`;

    const response = NextResponse.redirect(newUrl.toString(), 301);
    response.cookies.set("lang", laParam, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  // Handle root path - redirect to preferred language
  if (pathname === "/") {
    const preferredLang = getPreferredLang();
    const url = new URL(`/${preferredLang}`, request.url);
    const response = NextResponse.redirect(url, 302);
    if (!request.cookies.get("lang")?.value) {
      response.cookies.set("lang", preferredLang, {
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
      });
    }
    return response;
  }

  // Handle legacy URL redirects (paths without language prefix)
  // Check if first segment is a known month or "today"
  if (pathSegments.length > 0 && !isValidLang(pathSegments[0])) {
    const firstSegment = pathSegments[0];
    const isMonth = KNOWN_MONTHS.includes(firstSegment.toLowerCase());
    const isToday = firstSegment.toLowerCase() === "today";

    if (isMonth || isToday) {
      // This is a legacy URL, redirect to language-prefixed version
      const preferredLang = getPreferredLang();
      const newPathname = `/${preferredLang}${pathname}`;
      const url = new URL(newPathname, request.url);

      const response = NextResponse.redirect(url.toString(), 301);
      response.cookies.set("lang", preferredLang, {
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
      });
      return response;
    }
  }

  // For paths that start with /en or /ta, set/update the language cookie
  if (pathname.startsWith("/en/") || pathname.startsWith("/ta/") ||
      pathname === "/en" || pathname === "/ta") {
    const lang = pathname.split("/")[1] as "en" | "ta";
    const response = NextResponse.next();
    response.cookies.set("lang", lang, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  return NextResponse.next();
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
