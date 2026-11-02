/**
 * Language route parameter type
 */
export type LangParams = {
  lang: "en" | "ta";
};

/**
 * Supported languages
 */
export type SupportedLang = "en" | "ta";

/**
 * Language display names
 */
export const LANG_NAMES: Record<SupportedLang, string> = {
  en: "English",
  ta: "தமிழ்",
};

/**
 * Validate if a string is a supported language
 */
export function isValidLang(lang: string): lang is SupportedLang {
  return lang === "en" || lang === "ta";
}

/**
 * Get the alternate language
 */
export function getAlternateLang(lang: SupportedLang): SupportedLang {
  return lang === "en" ? "ta" : "en";
}
