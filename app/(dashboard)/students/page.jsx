"use client";

import { StudentsTable } from "@/components/StudentsTable";
import { useAuth } from "@/hooks/useAuth";

export default function StudentsPage() {
  const { branchId, isAdmin, instructorId } = useAuth();

  return (
    <div className="w-full max-w-full min-w-0">
      <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-6">Students</h1>
      <StudentsTable branchFilter={branchId} isAdmin={isAdmin} instructorId={instructorId} />
    </div>
  );
}
