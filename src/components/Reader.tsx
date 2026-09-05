"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Devotional } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Type, Languages, Moon, Sun, Volume2, Gauge } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

import dynamic from "next/dynamic";
import { DayPicker } from "@/components/DayPicker";
import { useAnalytics, type AnalyticsEventData } from "@/lib/analytics";
import { getAlternateLang } from "@/types/lang";


// Dynamically load non-critical client overlays to eliminate main-thread blocking (TBT)
const OnboardingTour = dynamic(
  () => import("@/components/OnboardingTour").then((mod) => mod.OnboardingTour),
  { ssr: false }
);

const ShareDropdown = dynamic(
  () => import("@/components/ShareDropdown").then((mod) => mod.ShareDropdown),
  { ssr: false }
);


// Audio Player Component
function AudioPlayer({
  src,
  lang,
  track,
  month,
  day,
}: {
  src: string | null;
  lang: "en" | "ta";
  track: <E extends keyof AnalyticsEventData>(event: E, data?: AnalyticsEventData[E]) => void;
  month: string;
  day: number;
}) {
  const [error, setError] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const speeds = [0.5, 0.75, 0.85, 1, 1.25, 1.5, 1.75, 2];

  // Handle audio loaded successfully
  const handleCanPlay = () => {
    setAudioAvailable(true);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Handle audio load error
  const handleError = () => {
    setError(true);
    setAudioAvailable(false);
  };

  // Set playback speed when speed state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Add analytics event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioAvailable) return;

    // Track play event
    const handlePlay = () => {
      track("audio_play", { month, day, lang, speed });
    };

    // Track pause event
    const handlePause = () => {
      track("audio_pause", { month, day, lang, speed });
    };

    // Track audio complete event
    const handleEnded = () => {
      track("audio_complete", { month, day, lang, speed });
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [track, month, day, lang, speed, audioAvailable]);

  // Hide if no src or error
  if (!src || error) {
    return null;
  }

  return (
    <div className="mb-8 p-4 rounded-lg border bg-muted/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-primary" />
          <span className={`text-sm font-medium ${lang === "ta" ? "lang-ta" : "lang-en"}`}>
            {lang === "ta" ? "ஆடியோ" : "Audio"}
          </span>
        </div>
        {audioAvailable && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                <Gauge className="h-4 w-4" />
                <span className="text-xs">{speed}x</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {speeds.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => {
                    setSpeed(s);
                    track("audio_speed_change", { month, day, lang, from: speed, to: s });
                  }}
                  className={speed === s ? "bg-accent" : ""}
                >
                  {s}x
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <audio
        ref={audioRef}
        controls
        preload="none"
        className="w-full"
        onCanPlay={handleCanPlay}
        onError={handleError}
      >
        <source src={src} type="audio/mpeg" />
        {lang === "ta" ? "உங்கள் உலாவி ஆடியோ எலிமன்டை ஆதரிக்கவில்லை." : "Your browser does not support the audio element."}
      </audio>
    </div>
  );
}

interface ReaderProps {
  devotional: Devotional;
  month: string;
  day: number;
  days: number[];
  lang: "en" | "ta";
  showFooter: boolean;
}

const fontSizes = [
  { label: "Small", value: "text-sm" },
  { label: "Normal", value: "text-base" },
  { label: "Large", value: "text-lg" },
  { label: "Extra Large", value: "text-xl" },
  { label: "Maximum", value: "text-2xl" },
];

export default function Reader({ devotional, month, day, days, lang, showFooter=true }: ReaderProps) {
  const [fontSize, setFontSize] = useState("text-lg");
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { track } = useAnalytics();
  const language = lang === "ta" ? "tamil" : "english";
  const readingCompleteRef = useRef<HTMLDivElement>(null);

  // Track language changes when user switches via language toggle
  useEffect(() => {
    const prevLang = sessionStorage.getItem("prevLanguage");

    if (prevLang && prevLang !== lang) {
      track("language_change", { from: prevLang, to: lang });
    }
    sessionStorage.setItem("prevLanguage", lang);
  }, [lang, track]);

  // Track reading completion when user scrolls to bottom
  useEffect(() => {
    const storageKey = `reading-complete-${month}-${day}`;
    const alreadyTracked = sessionStorage.getItem(storageKey);

    if (alreadyTracked || !readingCompleteRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          track("reading_complete", {
            month,
            day,
            language: language === "english" ? "en" : "ta",
          });
          sessionStorage.setItem(storageKey, "true");
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(readingCompleteRef.current);

    return () => {
      observer.disconnect();
    };
  }, [month, day, language, track]);

  // Clean up excessive newlines (more than 2 consecutive newlines)
  const cleanContent = (text: string) => {
    return text.replace(/\n{3,}/g, "\n\n");
  };

  const langData =
    language === "english" ? devotional.english : devotional.tamil;
  const title = langData.title;
  const content = cleanContent(langData.data);

  // Audio file URL directly from Convex storage
  const audioSrc = langData.audioUrl || null;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <OnboardingTour />
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link
            href={`/${lang}`}
            className={`text-xl font-bold text-primary ${lang === "ta" ? "lang-ta font-sans" : "lang-en font-serif tracking-tight"}`}
          >
            {lang === "ta" ? "வேதாகம தொடர்" : "Bible Series"}
          </Link>

          <div className="flex items-center gap-2">
            {/* Language Indicator Badge */}
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
              {lang === "en" ? "EN" : "தமிழ்"}
            </span>

            {/* Language Switcher */}
            <Button id="language-button" variant="ghost" size="sm" asChild>
              <Link href={`/${getAlternateLang(lang)}${pathname.slice(3)}`}>
                <Languages className="h-4 w-4 mr-1" />
                {lang === "en" ? "தமிழ்" : "English"}
              </Link>
            </Button>

            {/* Font Size Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button id="font-button" variant="ghost" size="icon">
                  <Type className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {fontSizes.map((size) => {
                  const sizeValue = size.value === "text-sm" ? "small" :
                                   size.value === "text-base" ? "medium" :
                                   size.value === "text-lg" ? "large" :
                                   size.value === "text-xl" ? "extra-large" : "maximum";
                  return (
                    <DropdownMenuItem
                      key={size.value}
                      onClick={() => {
                        setFontSize(size.value);
                        track("text_size_change", { size: sizeValue as "small" | "medium" | "large" });
                      }}
                      className={fontSize === size.value ? "bg-accent" : ""}
                    >
                      {size.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              id="theme-button"
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
        {/* Title with Share Button */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1
            className={`font-bold text-3xl md:text-4xl text-primary ${fontSize} ${lang === "ta" ? "lang-ta font-sans" : "lang-en font-serif"} flex-1`}
          >
            {title}
          </h1>
          <ShareDropdown
            url={typeof window !== "undefined" ? window.location.href : ""}
            title={title}
          />
        </div>

        {/* Audio Player */}
        <AudioPlayer src={audioSrc} lang={lang} track={track} month={month} day={day} />

        <article
          className={`prose prose-slate dark:prose-invert max-w-none leading-relaxed text-left ${fontSize} ${lang === "ta" ? "lang-ta font-sans" : "lang-en font-serif"}`}
        >
          <div className="whitespace-pre-wrap">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </article>

        {/* Day Picker */}
        <div className="mt-12 border-t pt-8">
          <DayPicker lang={lang} month={month} days={days} currentDay={day} inline={true} />
        </div>

        {/* Reading completion tracking marker */}
        <div ref={readingCompleteRef} aria-hidden="true" />
      </main>

      {/* Footer */}
      {showFooter && 
        <footer className="mt-20 border-t py-8 text-center text-sm text-muted-foreground">
          <p>© 2026 Christian Bible Series. May God bless you.</p>
        </footer>
        }
    </div>
  );
}
