"use client";

import { useEffect, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAnalytics } from "@/lib/analytics";

type Props = { lang: "en" | "ta" };
type DemoPhase = "off" | "select" | "choose" | "text" | "image" | "done";
const READ_KEY = "share-feature-notice-v4-read";
const COMPLETE_KEY = "share-feature-demo-v1-complete";

export function ShareFeatureNotice({ lang }: Props) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [phase, setPhase] = useState<DemoPhase>("off");
  const [demoCompleted, setDemoCompleted] = useState(false);
  const { track } = useAnalytics();
  const ta = lang === "ta";

  const copy = ta ? {
    noticeTitle: "புதிய வசதி அறிமுகம்",
    noticeBody: "வசனங்களையும் வாசிப்பு உரையையும் உரையாகவோ இயற்கைப் பின்னணியுள்ள படமாகவோ பகிரலாம்.",
    cta: "காட்டுங்கள்", later: "பிறகு",
    select: "வசனத்தைத் தேர்ந்தெடுக்க ஒரு பத்தியைத் தட்டுங்கள். தேர்ந்தெடுத்த உரை பகிர்வு வசதியுடன் தோன்றும்.",
    choose: "நன்று! இப்போது உரையாகவோ படமாகவோ பகிர்வதைத் தேர்ந்தெடுக்கவும்.",
    text: "உரையைப் பகிர அல்லது நகலெடுக்கத் தேர்ந்தெடுக்கவும். இதைச் செய்ததும் விளக்கம் முடியும்.",
    image: "பட முன்னோட்டத்தில் பின்னணியைத் தேர்ந்தெடுத்து, பதிவிறக்கவும் அல்லது பகிரவும்.",
    done: "அருமை! பகிர்வு விளக்கம் முடிந்தது. இந்த வசதியை இப்போது நீங்களே முயற்சிக்கலாம்.",
    close: "விளக்கத்தை மூடு", closeDialog: "மூடு",
  } : {
    noticeTitle: "New feature introduced",
    noticeBody: "Share a verse or reading passage as text or as an image with a nature background.",
    cta: "Show me", later: "Maybe later",
    select: "Tap a paragraph in the reading to select it. The share controls will appear for that passage.",
    choose: "Great! Now choose whether to share the selected passage as text or an image.",
    text: "Choose Share or Copy to finish this demo. The demo completes after the action succeeds.",
    image: "Choose a background in the image preview, then download or share it to finish the demo.",
    done: "That’s it! The sharing demo is complete. You can now try sharing a passage yourself.",
    close: "Close demo", closeDialog: "Close",
  };

  useEffect(() => {
    setUnread(window.localStorage.getItem(READ_KEY) !== "true");
    setDemoCompleted(window.localStorage.getItem(COMPLETE_KEY) === "true");
  }, []);

  useEffect(() => {
    if (phase === "off") return;
    const onSelection = () => {
      setPhase((current) => {
        if (current === "select") track("share_demo_step", { lang, step: "passage_selected" });
        return current === "select" ? "choose" : current;
      });
    };
    const onFormat = (event: Event) => {
      const format = (event as CustomEvent<"text" | "image">).detail;
      if (phase === "choose") track("share_demo_step", { lang, step: "format_selected", format });
      setPhase(format === "image" ? "image" : "text");
    };
    const onAction = (event: Event) => {
      const format = (event as CustomEvent<"text" | "image">).detail;
      setPhase((current) => {
        if (current === "text" && format === "text" || current === "image" && format === "image") {
          if (!demoCompleted) {
            track("share_demo_complete", { lang, format });
            window.localStorage.setItem(COMPLETE_KEY, "true");
            setDemoCompleted(true);
          }
          return "done";
        }
        return current;
      });
    };
    window.addEventListener("devotional-share-selection", onSelection);
    window.addEventListener("devotional-share-format", onFormat);
    window.addEventListener("devotional-share-action", onAction);
    return () => {
      window.removeEventListener("devotional-share-selection", onSelection);
      window.removeEventListener("devotional-share-format", onFormat);
      window.removeEventListener("devotional-share-action", onAction);
    };
  }, [phase, lang, track, demoCompleted]);

  useEffect(() => {
    const onShareDialog = (event: Event) => setShareDialogOpen((event as CustomEvent<boolean>).detail);
    window.addEventListener("devotional-share-dialog-state", onShareDialog);
    return () => window.removeEventListener("devotional-share-dialog-state", onShareDialog);
  }, []);

  const dismiss = () => {
    track("feature_notification_dismiss", { lang });
    setOpen(false);
  };
  const startDemo = () => {
    window.localStorage.setItem(READ_KEY, "true");
    setUnread(false);
    setOpen(false);
    setPhase("select");
    track("share_demo_start", { lang });
  };

  return (
    <>
      {!shareDialogOpen && !demoCompleted && <Button
        type="button" variant="default" size="icon"
        className="fixed bottom-5 right-5 z-40 h-12 w-12 rounded-full shadow-lg"
        aria-label={ta ? "புதிய வசதியைப் பார்க்கவும்" : "See the new feature"}
        onClick={() => {
          window.localStorage.setItem(READ_KEY, "true");
          setUnread(false);
          track("feature_notification_click", { lang });
          setOpen(true);
        }}
      >
        <Bell className="h-5 w-5" />
        {unread && <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-background bg-red-500" aria-label={ta ? "புதியது" : "New"} />}
      </Button>}

      <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen && open) dismiss(); else setOpen(nextOpen); }}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{copy.noticeTitle}</DialogTitle>
            <DialogDescription>{copy.noticeBody}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={dismiss}>{copy.later}</Button>
            <Button onClick={startDemo}>{copy.cta}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {!shareDialogOpen && phase !== "off" && phase !== "image" && (
        <aside className="fixed bottom-20 right-4 z-40 w-[min(21rem,calc(100vw-2rem))] rounded-xl border bg-popover p-4 text-popover-foreground shadow-xl" role="status" aria-live="polite">
          <div className="flex items-start gap-3">
            <p className="flex-1 text-sm leading-relaxed">{phase === "select" ? copy.select : phase === "choose" ? copy.choose : phase === "text" ? copy.text : copy.done}</p>
            <button type="button" aria-label={copy.closeDialog} onClick={() => setPhase("off")} className="rounded p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
          {phase === "done" && <Button size="sm" className="mt-3 w-full" onClick={() => setPhase("off")}><Check className="mr-2 h-4 w-4" />{copy.close}</Button>}
        </aside>
      )}
      {!shareDialogOpen && phase === "image" && (
        <div className="fixed bottom-5 left-4 z-40 max-w-[calc(100vw-6rem)] rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-lg" role="status" aria-live="polite">{copy.image}</div>
      )}
    </>
  );
}
