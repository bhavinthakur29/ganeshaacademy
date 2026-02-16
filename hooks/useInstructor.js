"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getInstructorByAuthId } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

const STALE_TIME = 2 * 60 * 1000;

/**
 * Fetches the current user's instructor record by auth ID.
 * @param {string} authId - Auth user ID
 * @param {{ enabled?: boolean }} options
 */
export function useInstructor(authId, { enabled = true } = {}) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["instructors", "profile", authId],
    queryFn: () => getInstructorByAuthId(authId),
    enabled: !!authId && enabled,
    staleTime: STALE_TIME,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
