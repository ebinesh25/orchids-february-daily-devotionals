import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to today's devotional for the current month
  redirect("/today");
}
