"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBeltRanks } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Skeleton } from "@/components/ui/skeleton";

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

/**
 * @returns {{ data: import("@/types/database").BeltRank[]; isLoading: boolean; isError: boolean; error: Error | null; refetch: () => void; Skeleton: () => JSX.Element }}
 */
export function useBeltRanks() {
  const query = useQuery({
    queryKey: queryKeys.beltRanks(),
    queryFn: fetchBeltRanks,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  });

  function BeltRanksSkeleton() {
    return (
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-md" />
        ))}
      </div>
    );
  }

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    Skeleton: BeltRanksSkeleton,
  };
}
