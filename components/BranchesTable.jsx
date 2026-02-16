"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BranchForm } from "@/components/BranchForm";
import { getBranchStats } from "@/lib/api";
import { addToast } from "@/lib/toast";
import { useBranches } from "@/hooks/useBranches";
import { Plus, Pencil, Building2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export function BranchesTable() {
  const { data: branches, isLoading, isError, refetch, Skeleton } = useBranches();
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (branches.length === 0) return;
    Promise.all(branches.map((b) => getBranchStats(b.id).then((s) => [b.id, s]).catch(() => [b.id, { students: 0, instructors: 0 }])))
      .then((pairs) => {
        const map = {};
        pairs.forEach(([id, s]) => (map[id] = s));
        setStats(map);
      })
      .catch(() => {});
  }, [branches]);

  if (isLoading) return <Skeleton />;
  if (isError)
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
        Failed to load branches. <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  if (branches?.length === 0)
    return (
      <EmptyState
        icon={Building2}
        title="No branches yet"
        description="Add your first branch to get started."
        action={
          <Button onClick={() => { setSelected(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Branch
          </Button>
        }
      />
    );

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => { setSelected(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Branch
        </Button>
      </div>
      <div className="min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Instructors</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell>{branch.name ?? branch.branch_name ?? "-"}</TableCell>
                <TableCell>{branch.address ?? "-"}</TableCell>
                <TableCell>{branch.phone ?? "-"}</TableCell>
                <TableCell>{branch.manager ?? "-"}</TableCell>
                <TableCell>{stats[branch.id]?.students ?? "-"}</TableCell>
                <TableCell>{stats[branch.id]?.instructors ?? "-"}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => { setSelected(branch); setFormOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <BranchForm open={formOpen} onOpenChange={setFormOpen} branch={selected} onSuccess={refetch} />
    </>
  );
}
