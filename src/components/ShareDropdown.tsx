"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Link, Check, Download, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useAnalytics } from "@/lib/analytics";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SHARE_BACKGROUNDS = [
  "/images/quote-backgrounds/mountains.jpg",
  "/images/quote-backgrounds/misty-forest.jpg",
  "/images/quote-backgrounds/mountain-fog.jpg",
];

interface ShareDropdownProps {
  url: string;
  title?: string;
  shareCard?: {
    verse: string;
    englishUrl: string;
    tamilUrl: string;
    lang: "en" | "ta";
  };
}

export function ShareDropdown({ url, title = "Bible Series", shareCard }: ShareDropdownProps) {
  const [copied, setCopied] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [qrImage, setQrImage] = useState("");
  const [busy, setBusy] = useState(false);
  const { track } = useAnalytics();

  const shareUrl = () => new URL(url, window.location.origin).href;
  const absoluteUrl = (path: string) => new URL(path, window.location.origin).href;
  const articleLinksText = () => shareCard
    ? `English: ${absoluteUrl(shareCard.englishUrl)}\nதமிழ்: ${absoluteUrl(shareCard.tamilUrl)}`
    : shareUrl();
  const shareCaption = () => `${title}\n\n${shareCard?.verse ?? ""}\n\n${articleLinksText()}`;

  useEffect(() => {
    if (!shareCard) return;
    let active = true;
    QRCode.toDataURL(absoluteUrl(url), {
      width: 180,
      margin: 1,
      color: { dark: "#102027", light: "#ffffff" },
    }).then((dataUrl) => { if (active) setQrImage(dataUrl); }).catch(() => undefined);
    return () => { active = false; };
  // URL is stable per reading page; absoluteUrl is intentionally not a dependency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, shareCard?.englishUrl, shareCard?.tamilUrl, shareCard?.lang]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareCaption());
      setCopied(true);
      toast.success(shareCard ? "Devotional links copied" : "Link copied to clipboard!");
      track("share_click", { platform: "copy" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareToWhatsApp = () => {
    const text = shareCard
      ? `${title}\n\n${shareCard.verse}\n\n${articleLinksText()}`
      : `Check out this bible series: ${title}\n${shareUrl()}`;
    track("share_click", { platform: "whatsapp" });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      toast.error("Sharing not supported on this device");
      return;
    }
    try {
      await navigator.share({ title, text: shareCard ? shareCaption() : undefined, url: shareUrl() });
      track("share_click", { platform: "native" });
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") console.error("Share failed", error);
    }
  };

  const createCard = async () => {
    if (!shareCard) throw new Error("Share card details are missing");
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable");
    const photo = new Image();
    photo.src = SHARE_BACKGROUNDS[backgroundIndex];
    await photo.decode();
    const scale = Math.max(canvas.width / photo.width, canvas.height / photo.height);
    const width = photo.width * scale;
    const height = photo.height * scale;
    ctx.drawImage(photo, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    const shade = ctx.createLinearGradient(0, 0, 0, canvas.height);
    shade.addColorStop(0, "rgba(5, 18, 25, .42)");
    shade.addColorStop(.45, "rgba(5, 18, 25, .50)");
    shade.addColorStop(1, "rgba(5, 18, 25, .82)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pad = 90;
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,.78)";
    ctx.font = "600 28px Arial, sans-serif";
    ctx.fillText("BIBLE SERIES  •  DAILY DEVOTIONAL", pad, 124);

    ctx.fillStyle = "#fff";
    ctx.font = `600 58px ${shareCard.lang === "ta" ? '"Noto Serif Tamil", "Latha", serif' : 'Georgia, serif'}`;
    const titleLines = wrapCanvasText(ctx, title, canvas.width - pad * 2).slice(0, 3);
    let y = 250;
    for (const line of titleLines) { ctx.fillText(line, pad, y); y += 78; }

    y += 78;
    ctx.fillStyle = "rgba(255,255,255,.74)";
    ctx.fillRect(pad, y - 52, 5, 620);
    ctx.fillStyle = "#fff";
    ctx.font = `500 46px ${shareCard.lang === "ta" ? '"Noto Serif Tamil", "Latha", serif' : 'Georgia, serif'}`;
    const verseLines = wrapCanvasText(ctx, shareCard.verse, canvas.width - pad * 2 - 42).slice(0, 10);
    for (const line of verseLines) { ctx.fillText(line, pad + 34, y); y += 64; }

    const qr = new Image();
    if (qrImage) {
      qr.src = qrImage;
      await qr.decode();
      ctx.drawImage(qr, pad, 1114, 136, 136);
    }
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.font = "500 25px Arial, sans-serif";
    ctx.fillText("Read the full devotional", pad + 164, 1168);
    ctx.fillStyle = "rgba(255,255,255,.76)";
    ctx.font = "400 20px Arial, sans-serif";
    ctx.fillText(new URL(absoluteUrl(url)).host + new URL(absoluteUrl(url)).pathname, pad + 164, 1212);

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not create image")), "image/png");
    });
  };

  const downloadCard = async () => {
    setBusy(true);
    try {
      const blob = await createCard();
      downloadBlob(blob);
      toast.success("Devotional image downloaded");
    } catch {
      toast.error("Could not create the devotional image");
    } finally { setBusy(false); }
  };

  const shareCardFile = async (platform: "facebook" | "instagram") => {
    setBusy(true);
    try {
      const blob = await createCard();
      const file = new File([blob], "daily-devotional.png", { type: "image/png" });
      const canShareFile = navigator.share && navigator.canShare?.({ files: [file] });

      if (canShareFile) {
        await navigator.share({ files: [file], title, text: shareCaption() });
        track("share_click", { platform });
      } else {
        downloadBlob(blob);
        try { await navigator.clipboard.writeText(shareCaption()); } catch { /* User can still upload the downloaded image. */ }
        if (platform === "facebook") {
          const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl())}&quote=${encodeURIComponent(shareCaption())}`;
          window.open(fb, "_blank", "noopener,noreferrer");
        } else {
          window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
          toast.info("Image downloaded and caption copied. Add them to an Instagram Story or post.");
        }
        track("share_click", { platform });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") toast.error("Could not share the devotional image");
    } finally { setBusy(false); }
  };

  const trigger = (
    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Share devotional">
      <Share2 className="h-4 w-4" />
    </Button>
  );

  if (shareCard) {
    return (
      <>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Share devotional" onClick={() => setCardOpen(true)}>
          <Share2 className="h-4 w-4" />
        </Button>
        <Dialog open={cardOpen} onOpenChange={(isOpen) => {
          setCardOpen(isOpen);
          window.dispatchEvent(new CustomEvent("devotional-share-dialog-state", { detail: isOpen }));
        }}>
          <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Share this devotional</DialogTitle>
              <DialogDescription>The image includes the title, opening verse, and a QR link. WhatsApp text includes English and Tamil article links. Facebook and Instagram use your device’s share options when available; otherwise download the image to upload it manually.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-2">
              {SHARE_BACKGROUNDS.map((src, index) => (
                <button key={src} type="button" onClick={() => setBackgroundIndex(index)} aria-pressed={backgroundIndex === index} className={`overflow-hidden rounded-lg border-2 ${backgroundIndex === index ? "border-primary" : "border-transparent"}`}>
                  <img src={src} alt={`Nature background ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="relative overflow-hidden rounded-xl bg-slate-900">
              <img src={SHARE_BACKGROUNDS[backgroundIndex]} alt="" className="aspect-[4/5] max-h-[42dvh] w-full object-cover opacity-55" />
              <div className="absolute inset-0 flex flex-col justify-center gap-5 bg-gradient-to-b from-slate-950/40 via-slate-950/50 to-slate-950/85 p-7 text-white">
                <p className="text-xs font-semibold tracking-widest text-white/75">BIBLE SERIES · DAILY DEVOTIONAL</p>
                <h2 className={`font-serif text-2xl font-semibold leading-snug ${shareCard.lang === "ta" ? "lang-ta font-sans" : ""}`}>{title}</h2>
                <blockquote className={`border-l-2 border-white/70 pl-4 font-serif text-lg leading-relaxed ${shareCard.lang === "ta" ? "lang-ta font-sans" : ""}`}>{shareCard.verse}</blockquote>
                <div className="mt-auto flex items-center gap-3 border-t border-white/30 pt-3">
                  {qrImage && <img src={qrImage} alt="QR code linking to this devotional" className="h-16 w-16 rounded bg-white p-1" />}
                  <div className="min-w-0 text-xs text-white/85">
                    <p>Read the full devotional</p>
                    <p className="mt-1 break-all">{url}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Button variant="outline" onClick={shareToWhatsApp}>WhatsApp</Button>
              <Button variant="outline" onClick={() => shareCardFile("facebook")}>Facebook</Button>
              <Button variant="outline" onClick={() => shareCardFile("instagram")}>Instagram</Button>
              <Button onClick={downloadCard} disabled={busy} className="gap-2"><Download className="h-4 w-4" />Image</Button>
            </div>
            <Button variant="ghost" onClick={copyToClipboard} className="gap-2"><Check className="h-4 w-4" />Copy English + Tamil links</Button>
            {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
              <Button variant="outline" onClick={nativeShare} className="gap-2"><ImageIcon className="h-4 w-4" />More sharing options</Button>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={copyToClipboard}>
          {copied ? <><Check className="mr-2 h-4 w-4 text-green-500" />Copied!</> : <><Link className="mr-2 h-4 w-4" />Copy Link</>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToWhatsApp}>WhatsApp</DropdownMenuItem>
        {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
          <DropdownMenuItem onClick={nativeShare}><Share2 className="mr-2 h-4 w-4" />Share...</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function downloadBlob(blob: Blob) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = "daily-devotional.png";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(href), 1000);
}
