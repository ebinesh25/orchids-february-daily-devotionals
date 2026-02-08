import { getAvailableMonths, getTodayDevotional, getAllDevotionalsForMonth, getAllDaysForMonth } from "@/lib/data";
import Reader from "@/components/Reader";
import { MonthTabsWrapper } from "@/components/MonthTabsWrapper";
import { ArticleCard } from "@/components/ArticleCard";

type Props = {
  searchParams: Promise<{ month?: string; la?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const availableMonths = await getAvailableMonths();
  const language = params.la === "ta" ? "tamil" : "english";

  // If no months available, show empty state
  if (availableMonths.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold text-primary mb-2">No Devotionals Available</h1>
          <p className="text-muted-foreground">Please check back later.</p>
        </div>
      </div>
    );
  }

  // Get selected month from query params or use first available
  const selectedMonth = params.month || availableMonths[0];

  // If viewing a specific month, redirect to that month's page
  if (params.month && params.month !== availableMonths[0]) {
    // Show the month list view
    const devotionals = await getAllDevotionalsForMonth(selectedMonth);

    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
          <div className="container mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
            <a href="/" className="font-serif text-xl font-bold tracking-tight text-primary">
              Devotional
            </a>
            <div className="text-sm text-muted-foreground">
              {selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)} Devotionals
            </div>
          </div>
        </header>

        {/* Month Tabs */}
        <MonthTabsWrapper
          months={availableMonths}
          activeMonth={selectedMonth}
        />

        {/* Articles List */}
        <main className="container mx-auto max-w-4xl px-4 py-8">
          <h1 className="font-serif text-3xl font-bold text-primary mb-6">
            {selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)} Articles
          </h1>
          <div className="grid gap-4 md:grid-cols-2">
            {devotionals.map(({ day, devotional }) => (
              <ArticleCard
                key={day}
                month={selectedMonth}
                day={day}
                devotional={devotional}
                language={language}
              />
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-20 border-t py-8 text-center text-sm text-muted-foreground">
          <p>© 2026 Christian Devotionals. May God bless you.</p>
        </footer>
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
      />

      {/* Month Tabs and Article List Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <h2 className="font-serif text-2xl font-bold text-primary mb-4">
            Browse by Month
          </h2>

          <MonthTabsWrapper
            months={availableMonths}
            activeMonth={monthData}
          />

          <div className="grid gap-4 md:grid-cols-2 mt-6">
            {devotionals.map(({ day, devotional }) => (
              <ArticleCard
                key={day}
                month={monthData}
                day={day}
                devotional={devotional}
                language={language}
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
