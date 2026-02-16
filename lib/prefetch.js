/**
 * Background prefetch for dashboard data. Call on login or page load.
 * Runs in idle time to avoid blocking the main thread.
 */
import {
  fetchStudents,
  fetchBranches,
  fetchInstructors,
  fetchAttendance,
  fetchFees,
  fetchAnnouncements,
  fetchInventory,
  fetchOrders,
  fetchBeltRanks,
} from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 10 * 60 * 1000;

const opts = { staleTime: STALE_TIME, gcTime: GC_TIME };

export function prefetchDashboardData(queryClient, { user, branchId, isAdmin }) {
  if (!user?.id) return;

  const bid = branchId ?? user.user_metadata?.branch_id ?? null;
  const canPrefetchStudents = isAdmin ? true : !!bid;

  const run = () => {
    const queries = [
      queryClient.prefetchQuery({ queryKey: queryKeys.branches(), queryFn: fetchBranches, ...opts }),
      queryClient.prefetchQuery({ queryKey: queryKeys.beltRanks(), queryFn: fetchBeltRanks, ...opts }),
      ...(canPrefetchStudents ? [queryClient.prefetchQuery({
        queryKey: queryKeys.students({ branchId: bid, isActive: true }),
        queryFn: () => fetchStudents({ branchId: bid, isActive: true }),
        ...opts,
      })] : []),
      queryClient.prefetchQuery({
        queryKey: queryKeys.instructors({ branchId: bid }),
        queryFn: () => fetchInstructors({ branchId: bid }),
        ...opts,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.attendance({}),
        queryFn: () => fetchAttendance({}),
        ...opts,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.fees({}),
        queryFn: () => fetchFees({}),
        ...opts,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.announcements({ branchId: bid }),
        queryFn: () => fetchAnnouncements({ branchId: bid }),
        ...opts,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.inventory({ branchId: bid }),
        queryFn: () => fetchInventory({ branchId: bid }),
        ...opts,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.orders({ branchId: bid }),
        queryFn: () => fetchOrders({ branchId: bid }),
        ...opts,
      }),
    ];
    Promise.all(queries).catch(() => { });
  };

  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(() => run(), { timeout: 500 });
  } else {
    setTimeout(run, 0);
  }
}
