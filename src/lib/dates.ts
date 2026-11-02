// Existing month/day-only content belongs to this archive year.
// Keep this fixed: legacy links must never change destination when the year changes.
export const CONTENT_YEAR = 2026;
export const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
export const padDate = (value: number) => String(value).padStart(2, "0");
export function monthNumber(month: string): number {
  const index = MONTHS.indexOf(month.toLowerCase().slice(0, 3));
  return index + 1;
}
export function validDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || year < 1000 || year > 9999 || !Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(day) || day < 1) return false;
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
}
export function monthPath(lang: string, month: string | number, year = CONTENT_YEAR) {
  return `/${lang}/${year}/${padDate(typeof month === "number" ? month : monthNumber(month))}`;
}
export function dayPath(lang: string, month: string | number, day: number, year = CONTENT_YEAR) {
  return `${monthPath(lang, month, year)}/${padDate(day)}`;
}
export function monthLabel(month: number, lang: string) {
  return new Intl.DateTimeFormat(lang === "ta" ? "ta-IN" : "en-IN", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2026, month - 1, 1)));
}

export interface ReadingDate { month: string; day: number }
export interface ReadingNavigation { previous?: ReadingDate; next?: ReadingDate }
