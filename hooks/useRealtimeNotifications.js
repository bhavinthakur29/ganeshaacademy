"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const POLL_INTERVAL_MS = 25000;
const REALTIME_INIT_DELAY_MS = 300;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 3000;

/**
 * Robust Realtime subscription with Firefox fallback.
 *
 * - Delays initial subscribe to avoid Firefox __cf_bm / load timing issues
 * - Retries channel subscribe on CHANNEL_ERROR / TIMED_OUT (up to MAX_RETRIES)
 * - Falls back to polling when WebSocket fails repeatedly
 * - Reconnects on visibility change when in fallback mode
 */
export function useRealtimeNotifications(userId, { onNotification, onFallback, onSubscribed }) {
  const queryClient = useQueryClient();
  const onNotificationRef = useRef(onNotification);
  const onFallbackRef = useRef(onFallback);
  const onSubscribedRef = useRef(onSubscribed);
  onNotificationRef.current = onNotification;
  onFallbackRef.current = onFallback;
  onSubscribedRef.current = onSubscribed;

  const channelRef = useRef(null);
  const pollIdRef = useRef(null);
  const retryCountRef = useRef(0);
  const isFallbackRef = useRef(false);
  const NOTIFICATION_EVENT = "ganesha-notification-realtime";

  const startPolling = useCallback(() => {
    if (pollIdRef.current) return;
    isFallbackRef.current = true;
    onFallbackRef.current?.();
    pollIdRef.current = setInterval(() => onFallbackRef.current?.(), POLL_INTERVAL_MS);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollIdRef.current) {
      clearInterval(pollIdRef.current);
      pollIdRef.current = null;
    }
    isFallbackRef.current = false;
  }, []);

  const dispatchPayload = useCallback(
    (payload) => {
      if (!payload) return;
      const row = payload?.new ?? payload?.old;
      const uid = row?.user_id;
      if (!uid) return;

      onNotificationRef.current?.(payload);

      if (payload.eventType === "INSERT" && payload.new) {
        const n = payload.new;
        queryClient.setQueriesData(
          { queryKey: ["notifications"], predicate: (q) => q.queryKey[1] === uid },
          (old) => {
            const list = Array.isArray(old) ? old : [];
            if (list.some((x) => x.id === n.id)) return old;
            return [{ ...n }, ...list];
          }
        );
      } else if (payload.eventType === "UPDATE" && payload.new) {
        const n = payload.new;
        const isMarkedRead = n.is_read === true;
        queryClient.setQueriesData(
          { queryKey: ["notifications"], predicate: (q) => q.queryKey[1] === uid && q.queryKey[2]?.unreadOnly === true },
          (old) =>
            !old || !Array.isArray(old)
              ? old
              : isMarkedRead
                ? old.filter((x) => x.id !== n.id)
                : old.map((x) => (x.id === n.id ? { ...x, ...n } : x))
        );
        queryClient.setQueriesData(
          { queryKey: ["notifications"], predicate: (q) => q.queryKey[1] === uid && q.queryKey[2]?.unreadOnly !== true },
          (old) =>
            !old || !Array.isArray(old) ? old : old.map((x) => (x.id === n.id ? { ...x, ...n } : x))
        );
      } else if (payload.eventType === "DELETE" && payload.old) {
        queryClient.setQueriesData(
          { queryKey: ["notifications"], predicate: (q) => q.queryKey[1] === uid },
          (old) => (old?.filter((x) => x.id !== payload.old.id) ?? old)
        );
      }
    },
    [queryClient]
  );

  useEffect(() => {
    const handler = (e) => dispatchPayload(e.detail);
    window.addEventListener(NOTIFICATION_EVENT, handler);
    return () => window.removeEventListener(NOTIFICATION_EVENT, handler);
  }, [dispatchPayload]);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    let initTimeoutId = null;
    let retryTimeoutId = null;

    const subscribe = () => {
      if (!mounted || !userId) return;

      const ch = supabase.channel(`ganesha-notifications-${userId}`);
      channelRef.current = ch;

      ch.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          setTimeout(
            () => window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: payload })),
            0
          );
        }
      );

      ch.subscribe((status) => {
        if (!mounted) return;

        if (status === "SUBSCRIBED") {
          retryCountRef.current = 0;
          stopPolling();
          onSubscribedRef.current?.();
          return;
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          channelRef.current = null;
          // Do NOT call removeChannel here - we're inside the channel's callback,
          // which causes "too much recursion" (removeChannel → unsubscribe → onClose → _trigger)

          if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current += 1;
            if (retryTimeoutId) clearTimeout(retryTimeoutId);
            retryTimeoutId = setTimeout(() => {
              retryTimeoutId = null;
              subscribe();
            }, RETRY_DELAY_MS);
          } else {
            startPolling();
          }
        }
      });
    };

    initTimeoutId = setTimeout(subscribe, REALTIME_INIT_DELAY_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isFallbackRef.current) {
        retryCountRef.current = 0;
        stopPolling();
        supabase.realtime.connect();
        retryTimeoutId = setTimeout(subscribe, 500);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (initTimeoutId) clearTimeout(initTimeoutId);
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      stopPolling();
    };
  }, [userId, startPolling, stopPolling]);
}
