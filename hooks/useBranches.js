"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBranches } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { BranchesTableSkeleton } from "@/components/skeletons/BranchesTableSkeleton";

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

/**
 * @returns {{ data: import("@/types/database").Branch[]; isLoading: boolean; isError: boolean; error: Error | null; refetch: () => void; Skeleton: () => JSX.Element; createMutation: object; updateMutation: object }}
 */
export function useBranches() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.branches(),
    queryFn: fetchBranches,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create branch");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await fetch(`/api/branches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update branch");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    Skeleton: BranchesTableSkeleton,
    createMutation,
    updateMutation,
  };
}
