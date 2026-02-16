"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createFee, updateFee } from "@/lib/api";
import { addToast } from "@/lib/toast";

export function FeeForm({ open, onOpenChange, fee, students, onSuccess }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { status: "pending" },
  });

  useEffect(() => {
    if (open) {
      reset(
        fee
          ? {
              student_id: fee.student_id,
              amount: fee.amount,
              due_date: fee.due_date?.split?.("T")?.[0] ?? "",
              status: fee.status ?? "pending",
              payment_method: fee.payment_method ?? "",
              paid_at: fee.paid_at?.split?.("T")?.[0] ?? "",
            }
          : { status: "pending" }
      );
    }
  }, [open, fee, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        student_id: Number(data.student_id),
        amount: Number(data.amount),
        due_date: data.due_date || null,
        status: data.status || "pending",
        payment_method: data.payment_method || null,
        paid_at: data.paid_at ? new Date(data.paid_at).toISOString() : null,
      };
      if (fee) {
        await updateFee(fee.id, payload);
        addToast({ message: "Fee updated", type: "success" });
      } else {
        await createFee(payload);
        addToast({ message: "Fee created", type: "success" });
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      addToast({ message: err.message || "Failed to save fee", type: "error" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{fee ? "Edit Fee" : "Add Fee"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="student_id">Student *</Label>
            <Select id="student_id" {...register("student_id", { required: true })}>
              <option value="">Select</option>
              {(students ?? []).map((s) => (
                <option key={s.id} value={s.id}>{[s.first_name, s.last_name].filter(Boolean).join(" ") || "-"}</option>
              ))}
            </Select>
            {errors.student_id && <span className="text-primary text-xs">Required</span>}
          </div>
          <div>
            <Label htmlFor="amount">Amount *</Label>
            <Input id="amount" type="number" step="0.01" {...register("amount", { required: true })} />
            {errors.amount && <span className="text-primary text-xs">Required</span>}
          </div>
          <div>
            <Label htmlFor="due_date">Due Date</Label>
            <Input id="due_date" type="date" {...register("due_date")} />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register("status")}>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="partial">Partial</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="payment_method">Payment Method</Label>
            <Input id="payment_method" {...register("payment_method")} placeholder="Cash, UPI, etc." />
          </div>
          <div>
            <Label htmlFor="paid_at">Paid At</Label>
            <Input id="paid_at" type="date" {...register("paid_at")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (fee ? "Updating…" : "Creating…") : (fee ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
