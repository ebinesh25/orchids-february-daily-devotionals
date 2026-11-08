"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Download, Image as ImageIcon, Link2, Share2 } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const BACKGROUNDS = [
  { src: "/images/quote-backgrounds/mountains.jpg", name: "Mountain light", credit: "Photo by Diljot Singh on Unsplash" },
  { src: "/images/quote-backgrounds/misty-forest.jpg", name: "Misty forest", credit: "Photo by Pascal Debrunner on Unsplash" },
  { src: "/images/quote-backgrounds/mountain-fog.jpg", name: "Forest mountains", credit: "Photo by Arindam Saha on Unsplash" },
];

type Props = {
  children: ReactNode;
  lang: "en" | "ta";
  title: string;
  articleUrl: string;
};

export function QuoteShare({ children, lang, title, articleUrl }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [quote, setQuote] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [qrImage, setQrImage] = useState("");

  const isTamil = lang === "ta";
  const articleLink = typeof window === "undefined" ? articleUrl : new URL(articleUrl, window.location.origin).href;

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(articleLink, { width: 180, margin: 1, color: { dark: "#102027", light: "#ffffff" } })
      .then((dataUrl) => { if (active) setQrImage(dataUrl); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [articleLink]);

  useEffect(() => {
    const updateSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim() ?? "";
      if (!selection || !selectedText || !contentRef.current?.contains(selection.anchorNode)) {
        setQuote("");
        return;
      }
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setQuote(selectedText.slice(0, 500));
      setPosition({
        x: Math.max(120, Math.min(rect.left + rect.width / 2, window.innerWidth - 120)),
        y: Math.max(12, rect.top),
      });
      window.dispatchEvent(new Event("devotional-share-selection"));
    };

    document.addEventListener("mouseup", updateSelection);
    document.addEventListener("keyup", updateSelection);
    document.addEventListener("touchend", updateSelection);
    return () => {
      document.removeEventListener("mouseup", updateSelection);
      document.removeEventListener("keyup", updateSelection);
      document.removeEventListener("touchend", updateSelection);
    };
  }, []);

  const handleTapToSelect = (event: MouseEvent<HTMLDivElement>) => {
    const mobileInput = window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(max-width: 767px)").matches;
    if (!mobileInput) return;
    const target = event.target;
    if (!(target instanceof HTMLElement) || target.closest("a, button")) return;
    const block = target.closest("p, li, blockquote");
    if (!block || !contentRef.current?.contains(block)) return;
    const selectedText = block.textContent?.trim() ?? "";
    if (!selectedText) return;
    const rect = block.getBoundingClientRect();
    setQuote(selectedText.slice(0, 500));
    setPosition({
      x: Math.max(120, Math.min(rect.left + rect.width / 2, window.innerWidth - 120)),
      y: Math.max(12, rect.top),
    });
    window.dispatchEvent(new Event("devotional-share-selection"));
  };

  const setImageDialogOpen = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    window.dispatchEvent(new CustomEvent("devotional-share-dialog-state", { detail: isOpen }));
    window.dispatchEvent(new CustomEvent("devotional-share-image-dialog", { detail: isOpen }));
  };

  const makeShareText = () => `${quote}${quote.length >= 500 ? "…" : ""}\n\n${title}\n${articleLink}`;

  const shareText = async () => {
    if (!quote) return;
    window.dispatchEvent(new CustomEvent("devotional-share-format", { detail: "text" }));
    const text = makeShareText();
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: articleLink });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success(isTamil ? "வசனமும் இணைப்பும் நகலெடுக்கப்பட்டன" : "Quote and article link copied");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(text);
        toast.success(isTamil ? "வசனமும் இணைப்பும் நகலெடுக்கப்பட்டன" : "Quote and article link copied");
      } catch {
        toast.error(isTamil ? "பகிர முடியவில்லை" : "Could not share the quote");
      }
    }
  };

  const renderCard = async () => {
    const width = 1080;
    const padding = 92;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable");

    const photo = new Image();
    photo.src = BACKGROUNDS[backgroundIndex].src;
    await photo.decode();
    const scale = Math.max(width / photo.width, canvas.height / photo.height);
    const imageWidth = photo.width * scale;
    const imageHeight = photo.height * scale;
    ctx.drawImage(photo, (width - imageWidth) / 2, (canvas.height - imageHeight) / 2, imageWidth, imageHeight);

    const shade = ctx.createLinearGradient(0, 0, 0, canvas.height);
    shade.addColorStop(0, "rgba(6, 19, 25, .38)");
    shade.addColorStop(.25, "rgba(6, 19, 25, .54)");
    shade.addColorStop(.72, "rgba(6, 19, 25, .64)");
    shade.addColorStop(1, "rgba(6, 19, 25, .78)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, width, canvas.height);

    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,.78)";
    ctx.font = "600 26px Arial, sans-serif";
    ctx.fillText("BIBLE SERIES  •  DAILY DEVOTIONAL", padding, 112);
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 58px ${isTamil ? '"Noto Serif Tamil", "Latha", serif' : 'Georgia, serif'}`;

    const words = quote.split(/\s+/);
    const lines: string[] = [];
    let line = "";
    const maxWidth = width - padding * 2;
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else line = candidate;
    }
    if (line) lines.push(line);
    const visibleLines = lines.slice(0, 12);
    if (lines.length > visibleLines.length) visibleLines[visibleLines.length - 1] = `${visibleLines.at(-1)}…`;
    const lineHeight = 78;
    const quoteHeight = visibleLines.length * lineHeight;
    let y = Math.max(420, (canvas.height - quoteHeight) / 2 - 36);
    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.fillRect(padding, y - 58, 5, quoteHeight + 48);
    ctx.fillStyle = "#ffffff";
    for (const textLine of visibleLines) {
      ctx.fillText(textLine, padding + 34, y);
      y += lineHeight;
    }

    const footerY = 1120;
    if (qrImage) {
      const qr = new Image();
      qr.src = qrImage;
      await qr.decode();
      ctx.drawImage(qr, padding, footerY - 30, 130, 130);
    }
    const footerTextX = padding + 164;
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.font = `500 30px ${isTamil ? '"Noto Serif Tamil", "Latha", serif' : 'Georgia, serif'}`;
    ctx.fillText(title.slice(0, 48), footerTextX, footerY);
    ctx.fillStyle = "rgba(255,255,255,.82)";
    ctx.font = "500 24px Arial, sans-serif";
    ctx.fillText(articleLink.slice(0, 60), footerTextX, footerY + 50);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not create image")), "image/png");
    });
  };

  const downloadImage = async () => {
    setBusy(true);
    try {
      const blob = await renderCard();
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = "daily-devotional-quote.png";
      link.click();
      URL.revokeObjectURL(href);
      toast.success(isTamil ? "படம் பதிவிறக்கப்பட்டது" : "Quote image downloaded");
    } catch {
      toast.error(isTamil ? "படத்தை உருவாக்க முடியவில்லை" : "Could not create the quote image");
    } finally {
      setBusy(false);
    }
  };

  const shareImage = async () => {
    setBusy(true);
    try {
      const blob = await renderCard();
      const file = new File([blob], "daily-devotional-quote.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({ title, text: `${title}\n${articleLink}`, url: articleLink, files: [file] });
      } else {
        const href = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = href;
        link.download = "daily-devotional-quote.png";
        link.click();
        URL.revokeObjectURL(href);
        await navigator.clipboard.writeText(`${title}\n${articleLink}`);
        toast.success(isTamil ? "படம் பதிவிறக்கப்பட்டது; இணைப்பு நகலெடுக்கப்பட்டது" : "Image downloaded and article link copied");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error(isTamil ? "பகிர முடியவில்லை" : "Could not share the quote image");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div ref={contentRef} onClick={handleTapToSelect}>{children}</div>
      {quote && !dialogOpen && (
        <div
          className="fixed z-[60] flex -translate-x-1/2 -translate-y-full items-center gap-1 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lg"
          style={{ left: position.x, top: position.y - 12 }}
          role="toolbar"
          aria-label={isTamil ? "தேர்ந்தெடுத்த உரையைப் பகிர்" : "Share selected text"}
        >
          <Button size="sm" variant="ghost" className="h-9 gap-1.5" onMouseDown={(event) => event.preventDefault()} onClick={shareText}>
            <Link2 className="h-4 w-4" />{isTamil ? "உரையாக" : "Text"}
          </Button>
          <Button size="sm" variant="ghost" className="h-9 gap-1.5" onMouseDown={(event) => event.preventDefault()} onClick={() => {
            window.dispatchEvent(new CustomEvent("devotional-share-format", { detail: "image" }));
            setImageDialogOpen(true);
          }}>
            <ImageIcon className="h-4 w-4" />{isTamil ? "படமாக" : "Image"}
          </Button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isTamil ? "வசனப் படத்தைப் பகிருங்கள்" : "Share a quote image"}</DialogTitle>
            <DialogDescription>{isTamil ? "இயற்கைப் பின்னணியைத் தேர்ந்தெடுத்து பதிவிறக்கவும் அல்லது பகிரவும். கட்டுரையின் இணைப்பு படத்திலும் பகிர்வு உரையிலும் சேர்க்கப்படும்." : "Choose a nature background, then download or share. The article link appears on the image and in the share text."}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2">
            {BACKGROUNDS.map((background, index) => (
              <button key={background.src} type="button" onClick={() => setBackgroundIndex(index)} aria-pressed={backgroundIndex === index} className={`overflow-hidden rounded-lg border-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${backgroundIndex === index ? "border-primary" : "border-transparent"}`}>
                <img src={background.src} alt={background.name} className="aspect-[4/3] w-full object-cover" />
                <span className="block truncate px-2 py-1 text-xs">{background.name}</span>
              </button>
            ))}
          </div>
          <div className="relative overflow-hidden rounded-xl bg-slate-900">
            <img src={BACKGROUNDS[backgroundIndex].src} alt="" className="aspect-[4/5] max-h-[38dvh] w-full object-cover opacity-55" />
            <div className="absolute inset-0 flex flex-col justify-center gap-4 bg-gradient-to-b from-slate-950/30 via-slate-950/55 to-slate-950/80 p-6 text-white">
              <p className="text-xs font-semibold tracking-widest text-white/75">BIBLE SERIES · DAILY DEVOTIONAL</p>
              <blockquote className="line-clamp-7 border-l-2 border-white/70 pl-4 font-serif text-lg leading-relaxed">{quote}{quote.length >= 500 ? "…" : ""}</blockquote>
              <div className="mt-auto flex items-center gap-3 border-t border-white/30 pt-3 text-xs text-white/85">
                {qrImage && <img src={qrImage} alt="QR code linking to this devotional" className="h-16 w-16 rounded bg-white p-1" />}
                <div className="min-w-0">
                  <p className="line-clamp-1 font-medium">{title}</p>
                  <p className="mt-1 flex items-center gap-1"><Link2 className="h-3 w-3 shrink-0" /><span className="break-all">{articleUrl}</span></p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={downloadImage} disabled={busy} className="gap-2"><Download className="h-4 w-4" />{isTamil ? "பதிவிறக்கு" : "Download image"}</Button>
            <Button onClick={shareImage} disabled={busy} className="gap-2"><Share2 className="h-4 w-4" />{busy ? (isTamil ? "தயாராகிறது…" : "Preparing…") : (isTamil ? "பகிர்" : "Share image")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
