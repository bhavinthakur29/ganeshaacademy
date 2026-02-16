"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchOrders } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

/**
 * @param {{ branchId?: string | number | null; instructorId?: string | number | null; enabled?: boolean }} [filters]
 * @returns {{ data: import("@/types/database").Order[]; isLoading: boolean; isError: boolean; error: Error | null; refetch: () => void; Skeleton: () => JSX.Element; createMutation: object; updateMutation: object }}
 */
export function useOrders(filters = {}) {
  const queryClient = useQueryClient();
  const { enabled = true, ...queryFilters } = filters;
  const filtersKey = { branchId: queryFilters.branchId, instructorId: queryFilters.instructorId };

  const query = useQuery({
    queryKey: queryKeys.orders(filtersKey),
    queryFn: () => fetchOrders(queryFilters),
    enabled,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    Skeleton: () => <TableSkeleton rows={8} cols={5} />,
    createMutation,
    updateMutation,
  };
}
