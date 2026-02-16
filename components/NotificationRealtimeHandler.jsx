"use client";

import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

/**
 * Realtime notifications handler with Firefox support.
 * Uses delayed subscribe, retry logic, and polling fallback when WebSocket fails
 * (e.g. __cf_bm cookie rejected in Firefox).
 */
export function NotificationRealtimeHandler({ userId, onNotification, onRealtimeFailed }) {
  useRealtimeNotifications(userId, {
    onNotification,
    onFallback: onRealtimeFailed,
  });
  return null;
}
