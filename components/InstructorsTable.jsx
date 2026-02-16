"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InstructorForm } from "@/components/InstructorForm";
import { useInstructors, useBranches, useBeltRanks } from "@/hooks";
import { Plus, Pencil, GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/hooks/useAuth";

function getInstructorName(i) {
  if (!i) return "";
  return `${i.first_name ?? ""} ${i.last_name ?? ""}`.trim() || (i.name ?? "-");
}

export function InstructorsTable() {
  const { branchId, isAdmin } = useAuth();
  const canFetch = isAdmin;
  const { data: instructors, isLoading, isError, refetch, Skeleton } = useInstructors({ branchId, enabled: canFetch });
  const { data: branches } = useBranches();
  const { data: beltRanks } = useBeltRanks();
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  if (!canFetch || isLoading) return <Skeleton />;
  if (isError)
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
        Failed to load instructors. <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  if (instructors?.length === 0)
    return (
      <EmptyState
        icon={GraduationCap}
        title="No instructors yet"
        description="Add your first instructor to get started."
        action={
          <Button onClick={() => { setSelected(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Instructor
          </Button>
        }
      />
    );

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => { setSelected(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Instructor
        </Button>
      </div>
      <div className="min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Belt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instructors.map((instructor) => (
              <TableRow key={instructor.id}>
                <TableCell>{getInstructorName(instructor)}</TableCell>
                <TableCell>{instructor.email ?? instructor.email_address ?? "-"}</TableCell>
                <TableCell>{instructor.phone ?? instructor.contact_number ?? "-"}</TableCell>
                <TableCell>{(branches?.find((b) => b.id === instructor.branch_id)?.name ?? branches?.find((b) => b.id === instructor.branch_id)?.branch_name ?? instructor.branch_id) ?? "-"}</TableCell>
                <TableCell>
                  {beltRanks?.find((r) => r.id === instructor.belt_level_id)?.belt_name ?? beltRanks?.find((r) => r.id === instructor.belt_level_id)?.name ?? beltRanks?.find((r) => r.id === instructor.belt_level_id)?.rank ?? instructor.belt_level ?? "-"}
                </TableCell>
                <TableCell>
                  <span className="flex flex-wrap gap-1">
                    <Badge variant={instructor.is_active ? "success" : "destructive"}>{instructor.is_active ? "Active" : "Inactive"}</Badge>
                    {(!instructor.first_name?.trim() || !instructor.last_name?.trim()) && (
                      <Badge variant="warning">Profile incomplete</Badge>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => { setSelected(instructor); setFormOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <InstructorForm open={formOpen} onOpenChange={setFormOpen} instructor={selected} branches={branches ?? []} onSuccess={refetch} />
    </>
  );
}
