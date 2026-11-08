"use client";

import { useEffect, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = { lang: "en" | "ta" };
type DemoPhase = "off" | "select" | "choose" | "image" | "done";

export function ShareFeatureNotice({ lang }: Props) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [phase, setPhase] = useState<DemoPhase>("off");
  const ta = lang === "ta";

  const copy = ta ? {
    noticeTitle: "புதிய வசதி அறிமுகம்",
    noticeBody: "வசனங்களையும் வாசிப்பு உரையையும் உரையாகவோ இயற்கைப் பின்னணியுள்ள படமாகவோ பகிரலாம்.",
    cta: "காட்டுங்கள்",
    later: "பிறகு",
    select: "வசனத்தைத் தேர்ந்தெடுக்க ஒரு பத்தியைத் தட்டுங்கள். தேர்ந்தெடுத்த உரை பகிர்வு வசதியுடன் தோன்றும்.",
    choose: "நன்று! இப்போது உரையாகவோ படமாகவோ பகிர்வதைத் தேர்ந்தெடுக்கவும்.",
    image: "பட முன்னோட்டத்தில் பின்னணியைத் தேர்ந்தெடுத்து, பதிவிறக்கவும் அல்லது பகிரவும்.",
    done: "அருமை! இந்த வசனப் பகிர்வு வசதியை இப்போது நீங்களே முயற்சிக்கலாம்.",
    close: "விளக்கத்தை மூடு",
  } : {
    noticeTitle: "New feature introduced",
    noticeBody: "Share a verse or reading passage as text or as an image with a nature background.",
    cta: "Show me",
    later: "Maybe later",
    select: "Tap a paragraph in the reading to select it. The share controls will appear for that passage.",
    choose: "Great! Now choose whether to share the selected passage as text or an image.",
    image: "Choose a background in the image preview, then download or share it.",
    done: "That’s it! You can now try sharing a passage yourself.",
    close: "Close demo",
  };

  useEffect(() => {
    setUnread(window.localStorage.getItem("share-feature-notice-v4-read") !== "true");
  }, []);

  useEffect(() => {
    if (phase === "off") return;
    const onSelection = () => setPhase("choose");
    const onFormat = (event: Event) => {
      const format = (event as CustomEvent<"text" | "image">).detail;
      setPhase(format === "image" ? "image" : "done");
    };
    const onImageDialog = (event: Event) => {
      const isOpen = (event as CustomEvent<boolean>).detail;
      if (!isOpen && phase === "image") setPhase("done");
    };
    window.addEventListener("devotional-share-selection", onSelection);
    window.addEventListener("devotional-share-format", onFormat);
    window.addEventListener("devotional-share-image-dialog", onImageDialog);
    return () => {
      window.removeEventListener("devotional-share-selection", onSelection);
      window.removeEventListener("devotional-share-format", onFormat);
      window.removeEventListener("devotional-share-image-dialog", onImageDialog);
    };
  }, [phase]);

  useEffect(() => {
    const onShareDialog = (event: Event) => {
      setShareDialogOpen((event as CustomEvent<boolean>).detail);
    };
    window.addEventListener("devotional-share-dialog-state", onShareDialog);
    return () => window.removeEventListener("devotional-share-dialog-state", onShareDialog);
  }, []);

  const startDemo = () => {
    window.localStorage.setItem("share-feature-notice-v4-read", "true");
    setUnread(false);
    setOpen(false);
    setPhase("select");
  };

  return (
    <>
      {!shareDialogOpen && <Button
        type="button"
        variant="default"
        size="icon"
        className="fixed bottom-5 right-5 z-40 h-12 w-12 rounded-full shadow-lg"
        aria-label={ta ? "புதிய வசதியைப் பார்க்கவும்" : "See the new feature"}
        onClick={() => {
          window.localStorage.setItem("share-feature-notice-v4-read", "true");
          setUnread(false);
          setOpen(true);
        }}
      >
        <Bell className="h-5 w-5" />
        {unread && <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-background bg-red-500" aria-label={ta ? "புதியது" : "New"} />}
      </Button>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{copy.noticeTitle}</DialogTitle>
            <DialogDescription>{copy.noticeBody}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>{copy.later}</Button>
            <Button onClick={startDemo}>{copy.cta}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {!shareDialogOpen && phase !== "off" && phase !== "image" && (
        <aside className="fixed bottom-20 right-4 z-40 w-[min(21rem,calc(100vw-2rem))] rounded-xl border bg-popover p-4 text-popover-foreground shadow-xl" role="status" aria-live="polite">
          <div className="flex items-start gap-3">
            <p className="flex-1 text-sm leading-relaxed">{phase === "select" ? copy.select : phase === "choose" ? copy.choose : copy.done}</p>
            <button type="button" aria-label={ta ? "விளக்கத்தை மூடு" : "Close demo"} onClick={() => setPhase("off")} className="rounded p-1 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
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
