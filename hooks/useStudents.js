"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchStudents } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { StudentsTableSkeleton } from "@/components/skeletons/StudentsTableSkeleton";

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

/**
 * @param {{ branchId?: string | number | null; isActive?: boolean; enabled?: boolean }} [filters]
 * @returns {{ data: import("@/types/database").Student[]; isLoading: boolean; isError: boolean; error: Error | null; refetch: () => void; Skeleton: () => JSX.Element; createMutation: object; updateMutation: object }}
 */
export function useStudents(filters = {}) {
  const queryClient = useQueryClient();
  const { enabled = true, ...queryFilters } = filters;
  const filtersKey = { branchId: queryFilters.branchId, isActive: queryFilters.isActive };

  const query = useQuery({
    queryKey: queryKeys.students(filtersKey),
    queryFn: () => fetchStudents(queryFilters),
    enabled,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create student");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await fetch(`/api/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update student");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    Skeleton: StudentsTableSkeleton,
    createMutation,
    updateMutation,
  };
}
