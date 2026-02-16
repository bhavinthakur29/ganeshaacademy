"use client";

import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StudentForm } from "@/components/StudentForm";
import { StudentDetailModal } from "@/components/StudentDetailModal";
import { AttendanceModal } from "@/components/AttendanceModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useStudents, useBranches, useBeltRanks } from "@/hooks";
import { addToast } from "@/lib/toast";
import { getStudentFullName } from "@/lib/schema";
import { Search, Plus, Eye, Pencil, Trash2, ClipboardList, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

const SORT_OPTIONS = [
  { key: "first_name", label: "Name" },
  { key: "email_address", label: "Email" },
  { key: "branch_id", label: "Branch" },
  { key: "created_at", label: "Date" },
];

export function StudentsTable({ showAttendance = false, branchFilter = null, isAdmin = true, instructorId = null }) {
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("first_name");
  const [sortAsc, setSortAsc] = useState(true);
  const canFetch = isAdmin || (branchFilter != null && branchFilter !== "");
  const { data: students, isLoading: loading, isError, refetch: refresh, Skeleton } = useStudents({
    branchId: branchFilter,
    enabled: canFetch,
  });
  const { data: branches } = useBranches();
  const { data: beltRanks } = useBeltRanks();

  const filtered = useMemo(() => {
    let list = [...students];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => {
        const b = branches?.find((x) => x.id === s.branch_id || x.id === Number(s.branch_id));
        const branchName = (b?.name ?? b?.branch_name ?? "").toLowerCase();
        return (
          (s.first_name ?? "").toLowerCase().includes(q) ||
          (s.last_name ?? "").toLowerCase().includes(q) ||
          (s.email_address ?? "").toLowerCase().includes(q) ||
          String(s.branch_id ?? "").toLowerCase().includes(q) ||
          (isAdmin && branchName.includes(q))
        );
      });
    }
    list.sort((a, b) => {
      const va = a[sortBy] ?? "";
      const vb = b[sortBy] ?? "";
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [students, search, sortBy, sortAsc]);

  const handleSort = (key) => {
    if (sortBy === key) setSortAsc((a) => !a);
    else {
      setSortBy(key);
      setSortAsc(true);
    }
  };

  if (!canFetch || loading) return <Skeleton />;
  if (isError)
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
        Failed to load students. <Button variant="outline" size="sm" className="mt-2" onClick={() => refresh()}>Retry</Button>
      </div>
    );
  if (students?.length === 0 && !search)
    return (
      <EmptyState
        icon={Users}
        title="No students yet"
        description="Add your first student to get started."
        action={
          <Button onClick={() => { setSelected(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        }
      />
    );

  return (
    <>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-0 flex h-full w-4 items-center">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2.5} />
          </span>
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 max-w-sm"
          />
        </div>
        <Button onClick={() => { setSelected(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      <div className="min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button type="button" onClick={() => handleSort("first_name")} className="hover:text-foreground">
                  Name {sortBy === "first_name" && (sortAsc ? "↑" : "↓")}
                </button>
              </TableHead>
              {isAdmin && (
                <TableHead>
                  <button type="button" onClick={() => handleSort("branch_id")} className="hover:text-foreground">
                    Branch {sortBy === "branch_id" && (sortAsc ? "↑" : "↓")}
                  </button>
                </TableHead>
              )}
              <TableHead>
                <button type="button" onClick={() => handleSort("email_address")} className="hover:text-foreground">
                  Email {sortBy === "email_address" && (sortAsc ? "↑" : "↓")}
                </button>
              </TableHead>
              {showAttendance && <TableHead className="text-right whitespace-nowrap">Actions</TableHead>}
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent even:bg-transparent">
                <TableCell colSpan={(isAdmin ? 1 : 0) + 2 + (showAttendance ? 1 : 0) + 1} className="py-12">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <Search className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">No students match your search</p>
                    <p className="text-sm text-muted-foreground">Try a different search term</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{getStudentFullName(student)}</span>
                    {!student.is_active && <Badge variant="destructive">Inactive</Badge>}
                  </div>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    {(() => {
                      const b = branches?.find((x) => x.id === student.branch_id || x.id === Number(student.branch_id));
                      return (b?.name ?? b?.branch_name ?? student.branch_id ?? "-");
                    })()}
                  </TableCell>
                )}
                <TableCell>{student.email_address ?? "-"}</TableCell>
                {showAttendance && (
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => { setSelected(student); setAttendanceOpen(true); }}>
                      <ClipboardList className="h-4 w-4 mr-1" />
                      Mark
                    </Button>
                  </TableCell>
                )}
                <TableCell className="text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setSelected(student); setDetailOpen(true); }} aria-label="View">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setSelected(student); setFormOpen(true); }} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!isAdmin && instructorId && (
                      <Button size="sm" variant="ghost" onClick={() => { setSelected(student); setDeleteConfirmOpen(true); }} aria-label="Request delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <StudentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        student={selected}
        branches={branches ?? []}
        beltRanks={beltRanks ?? []}
        onSuccess={refresh}
        isAdmin={isAdmin}
        instructorId={instructorId}
      />
      <StudentDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        student={selected}
        branches={branches ?? []}
        onEdit={(s) => { setSelected(s); setFormOpen(true); }}
      />
      <AttendanceModal
        open={attendanceOpen}
        onOpenChange={setAttendanceOpen}
        student={selected}
        onSuccess={() => setAttendanceOpen(false)}
      />
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request student deletion</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Request to delete {selected && getStudentFullName(selected)}? This will be sent to admin for approval.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!selected || !instructorId) return;
                try {
                  const res = await fetch("/api/approval-requests", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      instructor_id: instructorId,
                      entity_type: "student",
                      entity_id: selected.id,
                      action: "delete",
                      payload: null,
                    }),
                  });
                  if (!res.ok) throw new Error((await res.json()).error);
                  addToast({ message: "Delete request sent to admin for approval.", type: "success" });
                  setDeleteConfirmOpen(false);
                  setSelected(null);
                  refresh();
                } catch (err) {
                  addToast({ message: err.message || "Failed to submit request", type: "error" });
                }
              }}
            >
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
