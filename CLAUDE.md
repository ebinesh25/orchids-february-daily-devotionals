# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 bilingual (English/Tamil) Christian daily devotional web app. Content is stored in a `data.json` file at the project root, with devotional articles organized by month and day.

## Common Commands

- `npm run dev` - Start dev server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

### Routing Structure

The app uses Next.js App Router with dynamic routes for internationalization:

- `/` - Redirects to `/ta/` (Tamil is default)
- `/[lang]` - Language home page (e.g., `/ta`, `/en`)
- `/[lang]/[month]` - Month view listing all devotionals
- `/[lang]/[month]/today` - Today's devotional for the month
- `/[lang]/[month]/day/[number]` - Specific day devotional

Supported languages: `ta` (Tamil), `en` (English). Month abbreviations are three-letter lowercase: `jan`, `feb`, `mar`, etc.

### Data Layer (`src/lib/data.ts`)

All devotional content is loaded from `data.json` at the project root. Key functions:

- `getDevotional(month, day)` - Get a specific devotional
- `getAllDevotionalsForMonth(month)` - Get all devotionals for a month
- `getTodayDevotional()` - Get today's devotional based on current date
- `getAvailableMonths()` - Get list of available months

Data structure:
```typescript
{
  "jan": {
    "day1": {
      "english": { "title": "...", "data": "..." },
      "tamil": { "title": "...", "data": "..." }
    }
  }
}
```

### Middleware (`src/middleware.ts`)

Handles language routing and legacy URL redirects:
- Redirects root to user's preferred language (defaults to Tamil)
- Handles legacy `?la=en` query parameters
- Redirects legacy paths without language prefix (e.g., `/feb/day/1` → `/ta/feb/day/1`)
- Sets language cookie based on URL path

### Language Types (`src/types/lang.ts`)

- `LangParams` - Type for route params with `lang: "en" | "ta"`
- `isValidLang(lang)` - Type guard for language validation
- `getAlternateLang(lang)` - Get the opposite language

### Styling

- Uses Tailwind CSS v4
- UI components from Radix UI (in `src/components/ui/`)
- Tamil text uses `lang-ta` class, English uses `lang-en`
- Font variables defined in `src/app/fonts.ts`

### Key Components

- `Reader` - Displays a single devotional with navigation
- `ArticleCard` - Card component for devotional listings
- `MonthTabs` / `MonthTabsWrapper` - Month navigation tabs
- `DayPicker` - Day selection component
- `Providers` - App-wide providers (theme, etc.)

### Configuration Notes

- TypeScript errors and ESLint are ignored during builds (see `next.config.ts`)
- Images from any domain are allowed (remote patterns)
- Path alias `@/*` maps to `./src/*`

## Adding New Content

To add devotionals for a new month, update `data.json` with the month key and day entries following the existing structure. The app will automatically generate routes for the new content.
