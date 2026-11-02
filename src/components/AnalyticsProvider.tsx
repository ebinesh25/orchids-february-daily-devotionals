'use client';

import Script from 'next/script';

/**
 * AnalyticsProvider component
 *
 * Adds Umami analytics script using Next.js Script component.
 * This should be placed in the root layout.
 *
 * @example
 * ```tsx
 * // In src/app/layout.tsx
 * import { AnalyticsProvider } from '@/components/AnalyticsProvider';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AnalyticsProvider />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function AnalyticsProvider() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  if (!websiteId) {
    // Log warning in development only
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[Analytics] NEXT_PUBLIC_UMAMI_WEBSITE_ID is not set. ' +
          'Analytics will not be tracked.'
      );
    }
    return null;
  }

  return (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}
