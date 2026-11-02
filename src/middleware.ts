import { NextRequest, NextResponse } from "next/server";
import { isValidLang } from "./types/lang";
import { CONTENT_YEAR, dayPath, monthNumber, monthPath, validDate } from "./lib/dates";

// Legacy month URLs always map to 2026, including in future years.
const MONTH_NAMES = /^(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(tember)?|oct(ober)?|nov(ember)?|dec(ember)?)$/i;
export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const queryLang = url.searchParams.get("la");
  const cookieLang = request.cookies.get("lang")?.value;
  const accept = request.headers.get("accept-language") || "";
  const preferred = isValidLang(cookieLang || "") ? cookieLang! : accept.includes("en") && !accept.includes("ta") ? "en" : "ta";
  const hasLang = isValidLang(parts[0] || "");
  const lang = isValidLang(queryLang || "") ? queryLang! : hasLang ? parts[0] : preferred;
  const route = hasLang ? parts.slice(1) : parts;
  let destination: string | null = null;
  let status = 308;
  if (route[0] && MONTH_NAMES.test(route[0])) {
    const month = monthNumber(route[0]);
    if (route.length === 1) destination = monthPath(lang, month);
    if (route.length === 3 && route[1] === "day" && /^\d{1,2}$/.test(route[2]) && validDate(CONTENT_YEAR, month, +route[2])) {
      destination = dayPath(lang, month, +route[2]);
    }
    if (route.length === 2 && route[1] === "today") {
      const day = Number(new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "Asia/Kolkata" }).format(new Date()));
      if (validDate(CONTENT_YEAR, month, day)) destination = dayPath(lang, month, day);
      status = 307;
    }
  }
  if (!destination && (isValidLang(queryLang || "") || (!hasLang && (route[0] === "today" || /^\d{4}$/.test(route[0] || ""))))) {
    destination = `/${lang}${route.length ? `/${route.join("/")}` : ""}`;
  }
  if (!destination && hasLang && /^\d{4}$/.test(route[0] || "") && url.pathname.endsWith("/")) {
    destination = `/${lang}/${route.join("/")}`;
  }
  if (url.pathname === "/") {
    destination = `/${lang}`;
    status = 307;
  }
  if (isValidLang(queryLang || "")) url.searchParams.delete("la");
  if (destination) url.pathname = destination;
  const response = destination && (url.pathname !== request.nextUrl.pathname || url.search !== request.nextUrl.search)
    ? NextResponse.redirect(url, status)
    : NextResponse.next();
  if (hasLang || destination) response.cookies.set("lang", lang, { maxAge: 60 * 60 * 24 * 365, path: "/", sameSite: "lax" });
  return response;
}
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)"],
};
