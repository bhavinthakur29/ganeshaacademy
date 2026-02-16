"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInstructors } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

/**
 * @param {{ branchId?: string | number | null; enabled?: boolean }} [filters]
 * @returns {{ data: import("@/types/database").Instructor[]; isLoading: boolean; isError: boolean; error: Error | null; refetch: () => void; Skeleton: () => JSX.Element; createMutation: object; updateMutation: object; deleteMutation: object }}
 */
export function useInstructors(filters = {}) {
  const queryClient = useQueryClient();
  const { enabled = true, ...queryFilters } = filters;
  const filtersKey = { branchId: queryFilters.branchId };

  const query = useQuery({
    queryKey: queryKeys.instructors(filtersKey),
    queryFn: () => fetchInstructors(queryFilters),
    enabled,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create instructor");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructors"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await fetch(`/api/instructors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update instructor");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructors"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/instructors/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete instructor");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructors"] });
    },
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    Skeleton: () => <TableSkeleton rows={6} cols={5} />,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
