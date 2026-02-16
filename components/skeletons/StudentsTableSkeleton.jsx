"use client";

import { TableSkeleton } from "./TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function StudentsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-32" />
      </div>
      <TableSkeleton rows={10} cols={6} />
    </div>
  );
}
