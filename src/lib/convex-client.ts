import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";

if (!convexUrl && typeof window === "undefined") {
  console.warn("NEXT_PUBLIC_CONVEX_URL is not configured.");
}

export const convexClient = new ConvexHttpClient(convexUrl);
