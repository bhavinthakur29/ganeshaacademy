"use client";

import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createAttendance } from "@/lib/api";
import { addToOfflineQueue } from "@/lib/offlineQueue";
import { getStudentFullName } from "@/lib/schema";
import { addToast } from "@/lib/toast";
import { supabase } from "@/lib/supabase";

const STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
];

export function AttendanceModal({ open, onOpenChange, student, onSuccess }) {
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      status: "present",
    },
  });

  const status = watch("status");

  const onSubmit = async (data) => {
    if (!student) return;
    const { data: { user } } = await supabase.auth.getUser();
    const record = {
      student_id: student.id,
      class_date: data.date,
      status: data.status,
      marked_by_auth: user?.id ?? null,
    };
    if (!navigator.onLine) {
      addToOfflineQueue(record);
      addToast({ message: "Saved offline. Will sync when back online.", type: "default" });
      onSuccess?.();
      onOpenChange(false);
      return;
    }
    try {
      await createAttendance(record);
      addToast({ message: "Attendance marked for student", type: "success" });
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      addToOfflineQueue(record);
      addToast({ message: err.message || "Failed to record attendance. Saved offline—will sync when back online.", type: err.message ? "error" : "default" });
      onSuccess?.();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[min(calc(100%-2rem),28rem)]">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
          <p className="text-sm text-muted-foreground">{student && getStudentFullName(student)}</p>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="att-date">Date</Label>
              <Input
                id="att-date"
                type="date"
                className="w-full"
                {...register("date", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="att-status">Status</Label>
              <Select
                id="att-status"
                value={status}
                onChange={(e) => setValue("status", e.target.value)}
                className="w-full"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
