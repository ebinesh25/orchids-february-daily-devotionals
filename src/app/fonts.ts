import { Noto_Serif_Tamil, Noto_Sans } from "next/font/google";

export const tamilFont = Noto_Serif_Tamil({
  subsets: ["tamil"],
  weight: ["400", "700"],
  variable: "--font-tamil",
  display: "swap",
});

export const englishFont = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-en",
  display: "swap",
});
