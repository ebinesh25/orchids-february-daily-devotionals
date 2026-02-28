import { redirect } from "next/navigation";

/**
 * Root page - redirects to /ta/ (Tamil as default language)
 * The middleware handles language detection and cookie-based preferences
 */
export default function RootPage() {
  // Redirect to Tamil by default
  // Middleware will handle cookie-based preferences and browser language detection
  redirect("/ta");
}
