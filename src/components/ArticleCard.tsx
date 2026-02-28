import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ShareDropdown } from "@/components/ShareDropdown";
import { Devotional } from "@/lib/data";
import { generateExcerpt } from "@/lib/data";

interface ArticleCardProps {
  month: string;
  day: number;
  devotional: Devotional;
  language?: "english" | "tamil";
  lang: "en" | "ta";
}

export function ArticleCard({ month, day, devotional, language = "english", lang }: ArticleCardProps) {
  const langData = language === "english" ? devotional.english : devotional.tamil;
  // Remove day prefix from title (both English "Day X -" and Tamil "நாள் X -")
  const title = langData.title
    .replace(/^Day \d+\s*[-—]\s*/, "")
    .replace(/^நாள் \d+\s*[-—]\s*/, "");
  const excerpt = generateExcerpt(langData.data, 100);
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/${lang}/${month}/day/${day}`;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4">
        <div className="flex-1">
          <Link href={`/${lang}/${month}/day/${day}`} className="hover:underline">
            <h3 className={`font-semibold text-lg leading-tight text-primary ${lang === "ta" ? "lang-ta font-sans" : "lang-en font-serif"}`}>
              {language === "english" ? `Day ${day} - ` : `நாள் ${day} - `}{title}
            </h3>
          </Link>
        </div>
        <ShareDropdown url={url} title={title} />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Link href={`/${lang}/${month}/day/${day}`}>
          <p className={`text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors ${lang === "ta" ? "lang-ta font-sans" : "lang-en"}`}>
            {excerpt}
          </p>
        </Link>
      </CardContent>
    </Card>
  );
}
