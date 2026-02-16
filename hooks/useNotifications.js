"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { NotificationsSkeleton } from "@/components/skeletons/NotificationsSkeleton";

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

/**
 * @param {string} userId - Required for notifications
 * @param {{ unreadOnly?: boolean; enabled?: boolean }} [filters]
 * @returns {{ data: import("@/types/database").Notification[]; isLoading: boolean; isError: boolean; error: Error | null; refetch: () => void; Skeleton: () => JSX.Element; markReadMutation: object; markAllReadMutation: object }}
 */
export function useNotifications(userId, filters = {}) {
  const queryClient = useQueryClient();
  const { unreadOnly: unreadOnlyFilter, enabled: enabledOverride } = filters;
  const filtersKey = { unreadOnly: unreadOnlyFilter };
  const enabled = enabledOverride !== undefined ? enabledOverride : !!userId;

  const query = useQuery({
    queryKey: queryKeys.notifications(userId, filtersKey),
    queryFn: ({ signal }) => fetchNotifications(userId, { unreadOnly: unreadOnlyFilter, signal }),
    enabled,
    staleTime: 30 * 1000,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => error?.name === "AbortError" ? false : failureCount < 2,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to mark notification read");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/mark-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to mark all read");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    Skeleton: NotificationsSkeleton,
    markReadMutation,
    markAllReadMutation,
  };
}
