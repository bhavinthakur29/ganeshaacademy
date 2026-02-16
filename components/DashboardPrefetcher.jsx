"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { prefetchDashboardData } from "@/lib/prefetch";

const clearedForUsers = new Set();

/**
 * Prefetches all important dashboard data in the background when user lands.
 * Runs after auth is fully resolved so we have correct branchId (avoids flashing
 * unfiltered data for instructors). Clears any unfiltered students cache for instructors.
 * Uses module-level Set so we only clear once per user (survives Strict Mode remount).
 */
export function DashboardPrefetcher() {
  const { user, loading, branchId, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || loading) return;

    if (!isAdmin && !clearedForUsers.has(user.id)) {
      clearedForUsers.add(user.id);
      const unfilteredPredicate = (query) => {
        const key = query.queryKey;
        const filters = key[1];
        const hasNoBranch = !filters?.branchId && filters?.branchId !== 0;
        const hasNoInstructor = !filters?.instructorId && filters?.instructorId !== 0;
        if (key[0] === "students") return hasNoBranch;
        if (key[0] === "inventory") return hasNoBranch;
        if (key[0] === "orders") return hasNoBranch && hasNoInstructor;
        if (key[0] === "instructors" || key[0] === "announcements") return hasNoBranch;
        return false;
      };
      queryClient.removeQueries({ predicate: unfilteredPredicate });
    }

    prefetchDashboardData(queryClient, { user, branchId, isAdmin });
  }, [user?.id, loading, branchId, isAdmin, queryClient]);

  return null;
}
