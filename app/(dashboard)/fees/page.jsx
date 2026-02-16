"use client";

import { useState, useMemo, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useStudents, useBranches } from "@/hooks";
import { fetchFeesForMonth, saveFeesBulk } from "@/lib/api";
import { addToast } from "@/lib/toast";
import { getStudentFullName } from "@/lib/schema";
import { Save, DollarSign, Plus, Pencil } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FeeForm } from "@/components/FeeForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { siteConfig } from "@/config/site";

const DEFAULT_AMOUNT = siteConfig.defaultFees ?? 500;

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getMonthOptions() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const options = [];
  for (let y = currentYear - 1; y <= currentYear; y++) {
    for (let m = 1; m <= 12; m++) {
      const value = `${y}-${String(m).padStart(2, "0")}`;
      const label = `${MONTH_NAMES[m - 1]} ${y}`;
      options.push({ value, label });
    }
  }
  return options.reverse();
}

export default function FeesPage() {
  const { branchId: authBranchId, isAdmin } = useAuth();
  const { data: branches } = useBranches();
  const [selectedBranchId, setSelectedBranchId] = useState(authBranchId ?? null);
  const branchId = authBranchId ?? selectedBranchId;

  const now = new Date();
  const [yearMonth, setYearMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );
  const [amounts, setAmounts] = useState({});
  const [paidIds, setPaidIds] = useState(new Set());
  const [paymentMethods, setPaymentMethods] = useState({});
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [defaultAmount, setDefaultAmount] = useState(DEFAULT_AMOUNT);

  const queryClient = useQueryClient();
  const canFetchStudents = isAdmin || !!(branchId != null && branchId !== "");
  const { data: students, isLoading: loadingStudents, Skeleton } = useStudents({
    branchId: branchId || undefined,
    isActive: true,
    enabled: canFetchStudents,
  });
  const { data: existingFees, isLoading: loadingFees } = useQuery({
    queryKey: ["fees-month", yearMonth, branchId],
    queryFn: () => fetchFeesForMonth(branchId, yearMonth),
    enabled: !!yearMonth && !!branchId,
  });

  const feeMap = useMemo(() => {
    const m = new Map();
    (existingFees ?? []).forEach((f) => m.set(f.student_id, f));
    return m;
  }, [existingFees]);

  const merged = useMemo(() => {
    return (students ?? []).map((s) => {
      const fee = feeMap.get(s.id);
      return {
        ...s,
        amount: amounts[s.id] ?? fee?.amount ?? defaultAmount,
        status: paidIds.has(s.id) ? "paid" : (fee?.status ?? "pending"),
        payment_method: paymentMethods[s.id] ?? fee?.payment_method ?? "Cash",
      };
    });
  }, [students, amounts, paidIds, paymentMethods, feeMap, defaultAmount]);

  useEffect(() => {
    if (existingFees?.length || (yearMonth && !loadingFees)) {
      const nextPaid = new Set();
      const nextAmt = {};
      const nextPm = {};
      (existingFees ?? []).forEach((f) => {
        if (f.status === "paid") nextPaid.add(f.student_id);
        nextAmt[f.student_id] = f.amount;
        if (f.payment_method) nextPm[f.student_id] = f.payment_method;
      });
      setPaidIds(nextPaid);
      setAmounts((prev) => ({ ...prev, ...nextAmt }));
      setPaymentMethods((prev) => ({ ...prev, ...nextPm }));
    }
  }, [yearMonth, existingFees, loadingFees]);

  const handleAmountChange = (studentId, value) => {
    setAmounts((prev) => ({ ...prev, [studentId]: value }));
  };

  const handlePaidToggle = (studentId, checked) => {
    setPaidIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(studentId);
      else next.delete(studentId);
      return next;
    });
  };

  const handlePaymentMethodChange = (studentId, value) => {
    setPaymentMethods((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSave = async () => {
    if (!branchId || !students?.length) return;
    setSaving(true);
    try {
      const records = merged.map((s) => ({
        student_id: s.id,
        amount: Number(s.amount) || defaultAmount,
        status: paidIds.has(s.id) ? "paid" : "pending",
        payment_method: paidIds.has(s.id) ? (paymentMethods[s.id] || "Cash") : null,
      }));
      await saveFeesBulk(yearMonth, branchId, records, defaultAmount);
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      queryClient.invalidateQueries({ queryKey: ["fees-month"] });
      addToast({ message: "Fees saved successfully", type: "success" });
    } catch (err) {
      addToast({ message: err.message || "Failed to save fees", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSingleFee = () => {
    setSelectedFee(null);
    setFormOpen(true);
  };

  if (!canFetchStudents || loadingStudents) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Fees</h1>
        <Skeleton />
      </div>
    );
  }

  if (!branchId) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Fees</h1>
        {!authBranchId && (
          <div className="mb-4">
            <label htmlFor="fee-branch" className="text-sm font-medium mr-2">Branch</label>
            <select
              id="fee-branch"
              value={selectedBranchId ?? ""}
              onChange={(e) => setSelectedBranchId(e.target.value ? Number(e.target.value) : null)}
              className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select branch</option>
              {(branches ?? []).map((b) => (
                <option key={b.id} value={b.id}>{b.name ?? b.branch_name ?? b.id}</option>
              ))}
            </select>
          </div>
        )}
        <p className="text-muted-foreground">Select a branch to manage fees.</p>
      </div>
    );
  }

  if (!students?.length) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Fees</h1>
        <EmptyState
          icon={DollarSign}
          title="No students in this branch"
          description="Add students first to record fees."
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Fees</h1>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {!authBranchId && (
          <div className="flex items-center gap-2">
            <label htmlFor="fee-branch" className="text-sm font-medium">Branch</label>
            <select
              id="fee-branch"
              value={selectedBranchId ?? ""}
              onChange={(e) => {
                setSelectedBranchId(e.target.value ? Number(e.target.value) : null);
                setPaidIds(new Set());
                setAmounts({});
              }}
              className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select branch</option>
              {(branches ?? []).map((b) => (
                <option key={b.id} value={b.id}>{b.name ?? b.branch_name ?? b.id}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center gap-2">
          <label htmlFor="fee-month" className="text-sm font-medium">Month</label>
          <Select
            id="fee-month"
            value={yearMonth}
            onChange={(e) => {
              setYearMonth(e.target.value);
              setPaidIds(new Set());
              setAmounts({});
            }}
            className="w-44"
          >
            {getMonthOptions().map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="default-amount" className="text-sm font-medium">Default amount</label>
          <Input
            id="default-amount"
            type="number"
            value={defaultAmount}
            onChange={(e) => setDefaultAmount(Number(e.target.value) || DEFAULT_AMOUNT)}
            className="w-24"
          />
        </div>
        <Button onClick={handleSave} disabled={saving || !students?.length}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        {isAdmin && (
          <Button variant="outline" onClick={handleAddSingleFee}>
            <Plus className="h-4 w-4 mr-2" />
            Add single fee
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead className="w-28">Amount (₹)</TableHead>
              <TableHead className="w-24">Paid</TableHead>
              <TableHead className="w-32">Payment</TableHead>
              {isAdmin && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {merged.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{getStudentFullName(row)}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    step="1"
                    value={row.amount}
                    onChange={(e) => handleAmountChange(row.id, e.target.value)}
                    className="h-8 w-24"
                  />
                </TableCell>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={paidIds.has(row.id)}
                    onChange={(e) => handlePaidToggle(row.id, e.target.checked)}
                    aria-label={`Mark ${getStudentFullName(row)} paid`}
                  />
                </TableCell>
                <TableCell>
                  <select
                    value={paymentMethods[row.id] ?? "Cash"}
                    onChange={(e) => handlePaymentMethodChange(row.id, e.target.value)}
                    className="h-8 w-full max-w-[120px] rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    {feeMap.get(row.id)?.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedFee(feeMap.get(row.id));
                          setFormOpen(true);
                        }}
                        aria-label="Edit fee"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <FeeForm
        key={selectedFee?.id ?? "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        fee={selectedFee}
        students={students ?? []}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["fees"] });
          queryClient.invalidateQueries({ queryKey: ["fees-month"] });
        }}
      />
    </div>
  );
}
