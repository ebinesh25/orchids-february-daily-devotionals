import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to today's devotional for the current month
  // Since we only have data for February right now, we default to feb
  redirect("/feb/today");
}
