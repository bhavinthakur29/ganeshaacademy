"use client";

import { TableSkeleton } from "./TableSkeleton";

export function FeesTableSkeleton() {
  return (
    <div className="space-y-4">
      <TableSkeleton rows={8} cols={5} />
    </div>
  );
}
