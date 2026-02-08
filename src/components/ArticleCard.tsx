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
}

export function ArticleCard({ month, day, devotional, language = "english" }: ArticleCardProps) {
  const langData = language === "english" ? devotional.english : devotional.tamil;
  // Remove day prefix from title (both English "Day X -" and Tamil "நாள் X -")
  const title = langData.title
    .replace(/^Day \d+\s*[-—]\s*/, "")
    .replace(/^நாள் \d+\s*[-—]\s*/, "");
  const excerpt = generateExcerpt(langData.data, 100);
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/${month}/day/${day}`;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4">
        <div className="flex-1">
          <Link href={`/${month}/day/${day}`} className="hover:underline">
            <h3 className="font-serif font-semibold text-lg leading-tight text-primary">
              {language === "english" ? `Day ${day} - ` : `நாள் ${day} - `}{title}
            </h3>
          </Link>
        </div>
        <ShareDropdown url={url} title={title} />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Link href={`/${month}/day/${day}`}>
          <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors">
            {excerpt}
          </p>
        </Link>
      </CardContent>
    </Card>
  );
}
