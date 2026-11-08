"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Users } from "lucide-react";
import { api } from "../../convex/_generated/api";

export function LiveReaderCount({ lang }: { lang: "en" | "ta" }) {
  const [clientId, setClientId] = useState<string | null>(null);
  const heartbeat = useMutation(api.presence.heartbeat);
  const count = useQuery(api.presence.activeReaders, {});

  useEffect(() => {
    let id = window.localStorage.getItem("reader-presence-id");
    if (!id) {
      id = window.crypto.randomUUID();
      window.localStorage.setItem("reader-presence-id", id);
    }
    setClientId(id);
  }, []);

  useEffect(() => {
    if (!clientId) return;

    const sendHeartbeat = () => {
      if (document.visibilityState === "visible") {
        void heartbeat({ clientId }).catch(() => undefined);
      }
    };

    sendHeartbeat();
    const interval = window.setInterval(sendHeartbeat, 20_000);
    document.addEventListener("visibilitychange", sendHeartbeat);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", sendHeartbeat);
    };
  }, [clientId, heartbeat]);

  return (
    // Keep the same footprint while Convex connects so the content below never shifts.
    <div className="mb-5 flex h-6 items-start">
      {count === undefined ? (
        <span className="invisible inline-flex h-6 items-center rounded-full border px-3 text-xs" aria-hidden="true" />
      ) : <div className="inline-flex h-6 items-center gap-1.5 rounded-full border bg-muted/40 px-3 text-xs text-muted-foreground" aria-live="polite">
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-50" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
      </span>
      <Users className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="tabular-nums">{lang === "ta" ? `இப்போது ${count} பேர் வாசிக்கிறார்கள்` : `${count} ${count === 1 ? "person" : "people"} reading now`}</span>
      </div>}
    </div>
  );
}
