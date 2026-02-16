"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFees } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { FeesTableSkeleton } from "@/components/skeletons/FeesTableSkeleton";

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

/**
 * @param {{ studentId?: string }} [filters]
 * @returns {{ data: import("@/types/database").Fee[]; isLoading: boolean; isError: boolean; error: Error | null; refetch: () => void; Skeleton: () => JSX.Element; createMutation: object; updateMutation: object }}
 */
export function useFees(filters = {}) {
  const queryClient = useQueryClient();
  const filtersKey = { studentId: filters.studentId, branchId: filters.branchId };

  const query = useQuery({
    queryKey: queryKeys.fees(filtersKey),
    queryFn: () => fetchFees(filters),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create fee");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await fetch(`/api/fees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update fee");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
    },
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    Skeleton: FeesTableSkeleton,
    createMutation,
    updateMutation,
  };
}
