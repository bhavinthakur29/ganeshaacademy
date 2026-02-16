"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAnnouncements } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

/**
 * @param {{ branchId?: string | number | null; isActive?: boolean; enabled?: boolean }} [filters]
 * @returns {{ data: import("@/types/database").Announcement[]; isLoading: boolean; isError: boolean; error: Error | null; refetch: () => void; Skeleton: () => JSX.Element; createMutation: object; updateMutation: object; deleteMutation: object }}
 */
export function useAnnouncements(filters = {}) {
  const queryClient = useQueryClient();
  const { enabled = true, ...queryFilters } = filters;
  const filtersKey = { branchId: queryFilters.branchId, isActive: queryFilters.isActive };

  const query = useQuery({
    queryKey: queryKeys.announcements(filtersKey),
    queryFn: () => fetchAnnouncements(queryFilters),
    enabled,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create announcement");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update announcement");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete announcement");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    Skeleton: () => <TableSkeleton rows={5} cols={4} />,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
