"use client";

import { useEffect } from "react";

export function SwRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV === "development") {
      navigator.serviceWorker.getRegistrations().then((regs) =>
        regs.forEach((r) => r.unregister())
      );
      return;
    }
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("SW registered", reg.scope))
      .catch((err) => console.warn("SW registration failed", err));
  }, []);
  return null;
}
