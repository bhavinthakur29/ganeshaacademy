"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useStudents, useBranches } from "@/hooks";
import { fetchAttendance, saveAttendanceBulk } from "@/lib/api";
import { addToast } from "@/lib/toast";
import { getStudentFullName } from "@/lib/schema";
import { Save, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name A–Z", icon: ArrowUp },
  { value: "name-desc", label: "Name Z–A", icon: ArrowDown },
  { value: "present-first", label: "Present first", icon: ArrowUpDown },
  { value: "absent-first", label: "Absent first", icon: ArrowUpDown },
];

export default function AttendancePage() {
  const { branchId: authBranchId, user, isAdmin } = useAuth();
  const { data: branches } = useBranches();
  const [selectedBranchId, setSelectedBranchId] = useState(authBranchId ?? null);
  const branchId = authBranchId ?? selectedBranchId;
  const isAllBranches = branchId === "all";

  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today);
  const [presentIds, setPresentIds] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [sortBy, setSortBy] = useState("name-asc");

  const studentsQuery = {
    branchId: isAllBranches ? undefined : (branchId || undefined),
    enabled: !!branchId || isAllBranches,
  };
  const { data: students, isLoading: loadingStudents, Skeleton } = useStudents(studentsQuery);
  const { data: attendance, isLoading: loadingAtt } = useQuery({
    queryKey: ["attendance", date, isAllBranches ? "all" : branchId],
    queryFn: () => fetchAttendance({ date, branchId: isAllBranches ? "all" : branchId }),
    enabled: !!date && (!!branchId || isAllBranches),
  });

  const studentStatusMap = useMemo(() => {
    const m = new Map();
    (attendance ?? []).forEach((a) => m.set(a.student_id, a.status));
    return m;
  }, [attendance]);

  const merged = useMemo(() => {
    const list = (students ?? []).map((s) => ({
      ...s,
      status: presentIds.has(s.id) ? "present" : studentStatusMap.get(s.id) ?? "absent",
    }));
    const sorted = [...list].sort((a, b) => {
      const nameA = (getStudentFullName(a) || "").toLowerCase();
      const nameB = (getStudentFullName(b) || "").toLowerCase();
      const presentA = a.status === "present" ? 1 : 0;
      const presentB = b.status === "present" ? 1 : 0;
      if (sortBy === "name-asc") return nameA.localeCompare(nameB);
      if (sortBy === "name-desc") return nameB.localeCompare(nameA);
      if (sortBy === "present-first") return presentB - presentA || nameA.localeCompare(nameB);
      if (sortBy === "absent-first") return presentA - presentB || nameA.localeCompare(nameB);
      return 0;
    });
    return sorted;
  }, [students, presentIds, studentStatusMap, sortBy]);

  useEffect(() => {
    if (attendance?.length) {
      const next = new Set();
      attendance.filter((a) => a.status === "present").forEach((a) => next.add(a.student_id));
      setPresentIds(next);
    } else if (date && !loadingAtt) {
      setPresentIds(new Set());
    }
  }, [date, attendance, loadingAtt]);

  const syncDateToToday = useCallback(() => {
    const now = format(new Date(), "yyyy-MM-dd");
    setDate(now);
    setPresentIds(new Set());
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const now = format(new Date(), "yyyy-MM-dd");
      if (date && date < now) {
        setDate(now);
        setPresentIds(new Set());
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [date]);

  const handleToggle = (studentId, checked) => {
    setPresentIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(studentId);
      else next.delete(studentId);
      return next;
    });
  };

  const handleToggleAll = (checked) => {
    if (!students?.length) return;
    setPresentIds(checked ? new Set(students.map((s) => s.id)) : new Set());
  };

  const handleSave = async () => {
    if (!branchId && !isAllBranches) return;
    setSaving(true);
    try {
      const records = (students ?? []).map((s) => ({
        student_id: s.id,
        status: presentIds.has(s.id) ? "present" : "absent",
        branch_id: s.branch_id,
      }));
      if (isAllBranches) {
        const byBranch = new Map();
        records.forEach((r) => {
          const bid = r.branch_id;
          if (bid != null) {
            if (!byBranch.has(bid)) byBranch.set(bid, []);
            byBranch.get(bid).push({ student_id: r.student_id, status: r.status });
          }
        });
        for (const [bid, recs] of byBranch) {
          await saveAttendanceBulk(date, bid, recs, user?.id ?? null);
        }
      } else {
        await saveAttendanceBulk(date, branchId, records, user?.id ?? null);
      }
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      addToast({ message: "Attendance marked successfully", type: "success" });
    } catch (err) {
      addToast({ message: err.message || "Failed to save attendance", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loadingStudents) return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Attendance</h1>
      <Skeleton />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Attendance</h1>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {!authBranchId && (
          <div className="flex items-center gap-2">
            <label htmlFor="att-branch" className="text-sm font-medium">Branch</label>
            <select
              id="att-branch"
              value={selectedBranchId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedBranchId(v === "all" ? "all" : v ? Number(v) : null);
              }}
              className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select branch</option>
              {isAdmin && <option value="all">All Branches</option>}
              {(branches ?? []).map((b) => (
                <option key={b.id} value={b.id}>{b.name ?? b.branch_name ?? b.id}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center gap-2">
          <label htmlFor="att-date" className="text-sm font-medium">Date</label>
          <Input
            id="att-date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPresentIds(new Set());
            }}
            className="w-40"
          />
          <Button variant="outline" size="sm" onClick={syncDateToToday}>Today</Button>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="att-sort" className="text-sm font-medium">Sort</label>
          <select
            id="att-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex h-10 w-36 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <Button onClick={handleSave} disabled={saving || !students?.length || (!branchId && !isAllBranches)}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      {!branchId && !isAllBranches ? (
        <p className="text-muted-foreground">Select a branch to view attendance.</p>
      ) : !students?.length ? (
        <p className="text-muted-foreground">{isAllBranches ? "No students across all branches." : "No students in this branch."}</p>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={students.length > 0 && presentIds.size === students.length}
                    onChange={(e) => handleToggleAll(e.target.checked)}
                    aria-label="Mark all present"
                  />
                </TableHead>
                <TableHead>Student</TableHead>
                {isAllBranches && (
                  <TableHead>Branch</TableHead>
                )}
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merged.map((student) => {
                const branchName = isAllBranches && branches?.length
                  ? (branches.find((b) => b.id === student.branch_id)?.name ?? branches.find((b) => b.id === student.branch_id)?.branch_name ?? student.branch_id ?? "-")
                  : null;
                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={presentIds.has(student.id)}
                        onChange={(e) => handleToggle(student.id, e.target.checked)}
                        aria-label={`Mark ${getStudentFullName(student)} present`}
                      />
                    </TableCell>
                    <TableCell>{getStudentFullName(student)}</TableCell>
                    {isAllBranches && <TableCell>{branchName}</TableCell>}
                    <TableCell>{presentIds.has(student.id) ? "Present" : "Absent"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
