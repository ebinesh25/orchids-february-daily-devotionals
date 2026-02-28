import Link, { LinkProps } from "next/link";
import { MouseEvent, ReactNode } from "react";
import { useAnalytics } from "@/lib/analytics";

interface TrackedLinkProps extends LinkProps {
  children: ReactNode;
  eventName?: string;
  eventPayload?: Record<string, unknown>;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Link component with analytics tracking support.
 * Tracks events before navigation occurs.
 */
export function TrackedLink({
  children,
  eventName,
  eventPayload,
  onClick,
  ...props
}: TrackedLinkProps) {
  const { track } = useAnalytics();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (eventName) {
      track(eventName as any, eventPayload as any);
    }
    onClick?.(e);
  };

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
