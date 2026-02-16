"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApprovalRequests } from "@/lib/api";

const STALE_TIME = 60 * 1000;

export function useApprovalRequests(filters = {}) {
  const query = useQuery({
    queryKey: ["approval-requests", filters],
    queryFn: () => fetchApprovalRequests(filters),
    staleTime: STALE_TIME,
    enabled: !!filters.status,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
