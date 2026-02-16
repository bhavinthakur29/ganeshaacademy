"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAttendance } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { AttendanceTableSkeleton } from "@/components/skeletons/AttendanceTableSkeleton";

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

/**
 * @param {{ date?: string }} [filters]
 * @returns {{ data: import("@/types/database").Attendance[]; isLoading: boolean; isError: boolean; error: Error | null; refetch: () => void; Skeleton: () => JSX.Element; createMutation: object; updateMutation: object }}
 */
export function useAttendance(filters = {}) {
  const queryClient = useQueryClient();
  const filtersKey = { date: filters.date };

  const query = useQuery({
    queryKey: queryKeys.attendance(filtersKey),
    queryFn: () => fetchAttendance(filters),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create attendance");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await fetch(`/api/attendance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update attendance");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    Skeleton: AttendanceTableSkeleton,
    createMutation,
    updateMutation,
  };
}
