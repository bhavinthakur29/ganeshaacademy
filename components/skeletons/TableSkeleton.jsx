"use client";

import { SkeletonTable } from "@/components/ui/SkeletonTable";

/**
 * Generic table skeleton with configurable rows and columns.
 * Use for students, branches, attendance, fees, etc.
 */
export function TableSkeleton({ rows = 8, cols = 6 }) {
  return <SkeletonTable rows={rows} cols={cols} />;
}
