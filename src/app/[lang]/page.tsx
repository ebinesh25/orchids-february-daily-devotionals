import { redirect } from "next/navigation";
import { getAvailableMonths, getTodayDevotional, getAllDevotionalsForMonth, getAllDaysForMonth } from "@/lib/data";
import Reader from "@/components/Reader";
import { MonthTabsWrapper } from "@/components/MonthTabsWrapper";
import { ArticleCard } from "@/components/ArticleCard";
import { LangParams } from "@/types/lang";

interface LangPageProps {
  params: Promise<LangParams>;
}

export async function generateMetadata({ params }: LangPageProps) {
  const { lang } = await params;
  return {
    title: lang === "ta" ? "தமிழ் கிறிஸ்தவ அர்ப்பணன்கள்" : "Christian Devotionals",
    description: lang === "ta"
      ? "தினசரி கிறிஸ்தவ அர்ப்பணன்கள் தமிழில்"
      : "Daily christian devotionals in English and Tamil",
    alternates: {
      canonical: `/${lang}`,
      languages: {
        'en': '/en',
        'ta': '/ta',
      },
    },
  };
}

export default async function LangHome({ params }: LangPageProps) {
  const { lang } = await params;
  const availableMonths = await getAvailableMonths();

  // Validate language
  if (lang !== "en" && lang !== "ta") {
    redirect("/ta");
  }

  // If no months available, show empty state
  if (availableMonths.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className={`text-2xl font-bold text-primary mb-2 ${lang === "ta" ? "lang-ta font-sans" : "lang-en font-serif"}`}>
            {lang === "ta" ? "அர்ப்பணன்கள் இல்லை" : "No Devotionals Available"}
          </h1>
          <p className={`text-muted-foreground ${lang === "ta" ? "lang-ta font-sans" : "lang-en"}`}>
            {lang === "ta" ? "பிறகு சரிபார்க்கவும்." : "Please check back later."}
          </p>
        </div>
      </div>
    );
  }

  // Show today's devotional by default
  const todayData = await getTodayDevotional();

  // If no devotional for today, show the first available
  const monthData = todayData?.month || availableMonths[0];
  const dayData = todayData?.day || 1;

  // Get devotionals and days for the selected month to show in the list
  const devotionals = await getAllDevotionalsForMonth(monthData);
  const days = await getAllDaysForMonth(monthData);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Today's Devotional */}
      <Reader
        devotional={todayData?.devotional || devotionals[0]?.devotional}
        month={monthData}
        day={dayData}
        days={days}
        lang={lang}
        showFooter={false}
      />

      {/* Month Tabs and Article List Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <h2 className={`text-2xl font-bold text-primary mb-4 ${lang === "ta" ? "lang-ta font-sans" : "lang-en font-serif"}`}>
            {lang === "ta" ? "மாதம் வாரியாக தேடுங்கள்" : "Browse by Month"}
          </h2>

          <MonthTabsWrapper
            months={availableMonths}
            activeMonth={monthData}
            lang={lang}
          />

          <div className="grid gap-4 md:grid-cols-2 mt-6">
            {devotionals.map(({ day, devotional }) => (
              <ArticleCard
                key={day}
                month={monthData}
                day={day}
                devotional={devotional}
                language={lang === "ta" ? "tamil" : "english"}
                lang={lang}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Christian Devotionals. May God bless you.</p>
      </footer>
    </div>
  );
}

// Generate static params for both languages
export async function generateStaticParams() {
  return [
    { lang: "ta" },
    { lang: "en" },
  ];
}
