import { getDevotionals } from "@/lib/data";
import Reader from "@/components/Reader";
import { redirect } from "next/navigation";

export default async function TodayPage() {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.toLocaleString('default', { month: 'short' }).toLowerCase();

  const data = await getDevotionals();
  const monthData = data[currentMonth];

  if (!monthData) {
    // If no data for current month, redirect to February as fallback
    const febData = data['feb'];
    if (febData) {
      const dayKey = `day${currentDay}`;
      if (febData[dayKey]) {
        return <Reader devotional={febData[dayKey]} month="feb" day={currentDay} />;
      }
      // Find first available day in Feb
      const firstDay = Object.keys(febData).find(key => key.startsWith('day'));
      if (firstDay) {
        const dayNum = parseInt(firstDay.replace('day', ''));
        return <Reader devotional={febData[firstDay]} month="feb" day={dayNum} />;
      }
    }
    redirect('/feb/day/1');
  }

  // Find today's devotional, if not found, use the first available
  const dayKey = `day${currentDay}`;
  const devotional = monthData[dayKey];

  if (devotional) {
    return <Reader devotional={devotional} month={currentMonth} day={currentDay} />;
  }

  // Find first available day in the month
  const firstDayKey = Object.keys(monthData).find(key => key.startsWith('day'));
  if (firstDayKey) {
    const dayNum = parseInt(firstDayKey.replace('day', ''));
    return <Reader devotional={monthData[firstDayKey]} month={currentMonth} day={dayNum} />;
  }

  redirect('/feb/day/1');
}
