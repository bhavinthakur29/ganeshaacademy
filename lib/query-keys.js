/**
 * Centralized query keys for React Query.
 * Use these in hooks and invalidation logic for consistency.
 */
export const queryKeys = {
  students: (filters) => ["students", filters],
  student: (id) => ["students", id],
  branches: () => ["branches"],
  branch: (id) => ["branches", id],
  instructors: (filters) => ["instructors", filters],
  instructor: (id) => ["instructors", id],
  attendance: (filters) => ["attendance", filters],
  fees: (filters) => ["fees", filters],
  announcements: (filters) => ["announcements", filters],
  inventory: (filters) => ["inventory", filters],
  orders: (filters) => ["orders", filters],
  notifications: (userId, filters) => ["notifications", userId, filters],
  beltRanks: () => ["belt_ranks"],
};
