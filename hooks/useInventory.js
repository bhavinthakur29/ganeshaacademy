"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInventory } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

/**
 * @param {{ branchId?: string | number | null; activeOnly?: boolean; enabled?: boolean }} [filters]
 * @returns {{ data: import("@/types/database").InventoryItem[]; isLoading: boolean; isError: boolean; error: Error | null; refetch: () => void; Skeleton: () => JSX.Element; createMutation: object; updateMutation: object }}
 */
export function useInventory(filters = {}) {
  const queryClient = useQueryClient();
  const { enabled = true, ...queryFilters } = filters;
  const filtersKey = { branchId: queryFilters.branchId, activeOnly: queryFilters.activeOnly };

  const query = useQuery({
    queryKey: queryKeys.inventory(filtersKey),
    queryFn: () => fetchInventory(queryFilters),
    enabled,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create inventory item");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update inventory item");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    Skeleton: () => <TableSkeleton rows={8} cols={6} />,
    createMutation,
    updateMutation,
  };
}
