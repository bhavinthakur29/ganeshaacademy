"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { processOfflineQueue } from "@/lib/offlineQueue";
import { supabase } from "@/lib/supabase";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // TODO: Process offline queue when back online
      processOfflineQueue(supabase);
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-white/30 dark:border-white/10 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-2 shadow-xl">
      <WifiOff className="h-5 w-5 text-secondary" />
      <span className="text-sm font-medium">You're offline. Changes will sync when connected.</span>
    </div>
  );
}
