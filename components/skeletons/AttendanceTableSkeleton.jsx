"use client";

import { TableSkeleton } from "./TableSkeleton";

export function AttendanceTableSkeleton() {
  return (
    <div className="space-y-4">
      <TableSkeleton rows={12} cols={5} />
    </div>
  );
}
