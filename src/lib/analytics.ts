import { useCallback } from 'react';

/**
 * Analytics event types for Umami tracking
 */
export type AnalyticsEvent =
  | 'language_change'
  | 'share_click'
  | 'date_navigation'
  | 'reading_complete'
  | 'text_size_change'
  | 'audio_play'
  | 'audio_pause'
  | 'audio_complete'
  | 'audio_speed_change';

/**
 * Payload data for each analytics event type
 */
export interface AnalyticsEventData {
  language_change: {
    from: string;
    to: string;
  };
  share_click: {
    platform: 'whatsapp' | 'telegram' | 'copy' | 'facebook' | 'twitter' | 'native';
  };
  date_navigation: {
    month?: string;
    day?: number;
    action: 'month_select' | 'day_select' | 'today_click' | 'prev_next';
  };
  reading_complete: {
    month: string;
    day: number;
    language: string;
  };
  text_size_change: {
    size: 'small' | 'medium' | 'large' | 'extra-large' | 'maximum';
  };
  audio_play: {
    month: string;
    day: number;
    lang: string;
    speed: number;
  };
  audio_pause: {
    month: string;
    day: number;
    lang: string;
    speed: number;
  };
  audio_complete: {
    month: string;
    day: number;
    lang: string;
    speed: number;
  };
  audio_speed_change: {
    month: string;
    day: number;
    lang: string;
    from: number;
    to: number;
  };
}

/**
 * Custom hook for tracking analytics events using Umami
 *
 * @returns {Object} - Object containing track function
 * @returns {Function} track - Function to track analytics events
 *
 * @example
 * ```tsx
 * const { track } = useAnalytics();
 * track('language_change', { from: 'en', to: 'ta' });
 * ```
 */
export function useAnalytics() {
  const track = useCallback(
    <E extends AnalyticsEvent>(
      event: E,
      data?: AnalyticsEventData[E]
    ) => {
      if (typeof window !== 'undefined' && (window as any).umami) {
        (window as any).umami.track(event, data);
      }
    },
    []
  );

  return { track };
}

/**
 * Type declaration for the global umami object
 */
declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, unknown>) => void;
      identify: (userId: string, data?: Record<string, unknown>) => void;
    };
  }
}
