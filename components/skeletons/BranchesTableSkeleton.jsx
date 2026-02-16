"use client";

import { TableSkeleton } from "./TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function BranchesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Skeleton className="h-10 w-36" />
      </div>
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}
