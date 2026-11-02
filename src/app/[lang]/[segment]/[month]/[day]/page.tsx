import { notFound, permanentRedirect } from "next/navigation";
import { getDevotionals, getReadingNavigation } from "@/lib/data";
import { CONTENT_YEAR, MONTHS, dayPath, validDate } from "@/lib/dates";
import { isValidLang } from "@/types/lang";
import Reader from "@/components/Reader";
type Props = { params: Promise<{ lang: string; segment: string; month: string; day: string }> };
export async function generateMetadata({ params }: Props) {
  const { lang, segment: year, month, day } = await params;
  const valid = year === String(CONTENT_YEAR) && /^\d{1,2}$/.test(month) && /^\d{1,2}$/.test(day) && validDate(+year, +month, +day);
  const devotional = valid ? (await getDevotionals())[MONTHS[+month - 1]]?.[`day${+day}`] : null;
  return { title: devotional ? devotional[lang === "ta" ? "tamil" : "english"].title : "Bible Series", alternates: { canonical: dayPath(lang, +month, +day, +year), languages: { en: dayPath("en", +month, +day, +year), ta: dayPath("ta", +month, +day, +year) } } };
}
export default async function DayPage({ params }: Props) {
  const { lang, segment: year, month, day } = await params;
  if (!isValidLang(lang) || year !== String(CONTENT_YEAR) || !/^\d{1,2}$/.test(month) || !/^\d{1,2}$/.test(day) || !validDate(+year, +month, +day)) notFound();
  const canonical = dayPath(lang, +month, +day, +year);
  if (`/${lang}/${year}/${month}/${day}` !== canonical) permanentRedirect(canonical);
  const key = MONTHS[+month - 1];
  const archive = await getDevotionals();
  const devotional = archive[key]?.[`day${+day}`];
  if (!devotional) notFound();
  const days = Object.keys(archive[key]).map(key => Number(key.replace(/^day/, ""))).sort((a, b) => a - b);
  const navigation = await getReadingNavigation(key, +day, archive);
  return <Reader devotional={devotional} month={key} day={+day} days={days.filter(d => validDate(+year, +month, d))} lang={lang} navigation={navigation} />;
}
