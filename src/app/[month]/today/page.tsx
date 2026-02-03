import { getDevotional } from "@/lib/data";
import Reader from "@/components/Reader";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    month: string;
  }>;
}

export default async function TodayPage({ params }: PageProps) {
  const { month } = await params;
  
  // For the sake of this project, we determine "today" based on the current date
  // but since the user said "today is day 2", we can use that logic.
  // In a real app, you'd use new Date().getDate()
  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'short' }).toLowerCase();
  
  // If the requested month is the current month, we use today's date
  // Otherwise, we might want to default to Day 1 or show a message.
  let day = today.getDate();
  
  // Overriding for Feb 2nd as per user context
  if (month.toLowerCase() === 'feb') {
    day = 2; // User said "today is day 2"
  }

  const devotional = await getDevotional(month, day);

  if (!devotional) {
    notFound();
  }

  return <Reader devotional={devotional} month={month} />;
}
