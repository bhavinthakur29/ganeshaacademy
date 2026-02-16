"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("pwa-install-dismissed", "1");
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 flex items-center justify-between gap-4 rounded-xl border border-white/30 dark:border-white/10 bg-white/85 dark:bg-slate-900/90 backdrop-blur-xl p-4 shadow-xl sm:left-auto sm:right-4 sm:max-w-sm">
      <p className="text-sm">Install app for offline access</p>
      <div className="flex gap-2 shrink-0">
        <Button size="sm" variant="outline" onClick={dismiss}>Later</Button>
        <Button size="sm" onClick={handleInstall}>
          <Download className="h-4 w-4 mr-1" />
          Install
        </Button>
      </div>
    </div>
  );
}
