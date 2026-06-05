"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Share, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const subscribeResize = (callback: () => void) => {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
};

export function PwaInstallButton({ variant = "default" }: { variant?: "default" | "nav" }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const isMobile = useSyncExternalStore(
    subscribeResize,
    () => window.innerWidth < 768,
    () => false
  );

  const isStandalone = useSyncExternalStore(
    () => () => {},
    () => window.matchMedia("(display-mode: standalone)").matches || !!(window.navigator as any).standalone,
    () => true
  );

  const isIos = useSyncExternalStore(
    () => () => {},
    () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()),
    () => false
  );

  useEffect(() => {
    const savePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", savePrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", savePrompt);
    };
  }, []);

  if (!isMobile || isStandalone) return null;

  const handleAndroidPrompt = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
  };

  // ✨ ELEGANT, SMALLER, AND LIGHTER BUTTON STYLING CONFIGURATIONS
  const buttonStyle = variant === "nav" 
    ? "h-8 w-8 p-0 rounded-full border border-border bg-background/50 hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
    : "rounded-full border border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60 text-[11px] h-7 px-3 flex gap-1.5 items-center font-medium transition-all duration-200 backdrop-blur-sm";

  const buttonContent = variant === "nav" 
    ? <Download className="h-3.5 w-3.5" /> 
    : <><Download className="h-3 w-3" /> Install App</>;

  if (isIos) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className={buttonStyle}>{buttonContent}</button>
        </DialogTrigger>
        <DialogContent className="max-w-[85vw] rounded-xl text-center">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Install Pingly on iOS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-xs text-muted-foreground pt-2">
            <p>Open this page inside Apple Safari to pin full screen applications seamlessly:</p>
            <div className="flex flex-col gap-2 text-left bg-secondary/40 p-3 rounded-lg text-foreground">
              <div className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center font-bold text-[10px]">1</span>
                <p>Tap the default lower Safari <Share className="h-3.5 w-3.5 inline text-primary mx-0.5" /> **Share** menu button panel.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center font-bold text-[10px]">2</span>
                <p>Scroll down the prompt list grid sheet and select **Add to Home Screen** (<PlusSquare className="h-3.5 w-3.5 inline mx-0.5" />).</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (deferredPrompt || variant === "nav") {
    return (
      <button onClick={handleAndroidPrompt} className={buttonStyle}>
        {buttonContent}
      </button>
    );
  }

  return null;
}