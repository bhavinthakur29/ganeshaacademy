"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useBeltRanks } from "@/hooks/useBeltRanks";
import { supabase } from "@/lib/supabase";
import { addToast } from "@/lib/toast";

/**
 * Edit dialog for instructors. Creates an approval request instead of
 * updating directly. Email and branch are locked (read-only).
 */
export function InstructorProfileEditDialog({ open, onOpenChange, instructor, branchName, onSuccess }) {
  const { data: beltRanks } = useBeltRanks();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (open && instructor) {
      reset({
        first_name: instructor.first_name ?? "",
        last_name: instructor.last_name ?? "",
        phone: instructor.phone ?? instructor.contact_number ?? "",
        belt_level_id: instructor.belt_level_id ?? instructor.belt_id ?? "",
      });
    }
  }, [open, instructor, reset]);

  const onSubmit = async (data) => {
    if (!instructor) return;
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/instructors/request-edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          belt_level_id: data.belt_level_id,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit");

      addToast({
        message: "Edit request submitted. An admin will review and approve it.",
        type: "success",
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      addToast({ message: err.message || "Failed to submit edit request", type: "error" });
    }
  };

  const email = instructor?.email ?? instructor?.email_address ?? "";
  const displayBranch = branchName ?? "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request profile edit</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Changes require admin approval. Email and branch cannot be changed.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First name *</Label>
              <Input id="first_name" {...register("first_name", { required: true })} />
              {errors.first_name && <span className="text-destructive text-xs">Required</span>}
            </div>
            <div>
              <Label htmlFor="last_name">Last name *</Label>
              <Input id="last_name" {...register("last_name", { required: true })} />
              {errors.last_name && <span className="text-destructive text-xs">Required</span>}
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled className="bg-muted" readOnly />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>
          <div>
            <Label>Branch</Label>
            <Input value={displayBranch} disabled className="bg-muted" readOnly />
            <p className="text-xs text-muted-foreground mt-1">Branch cannot be changed</p>
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" {...register("phone")} placeholder="+1 234 567 8900" />
          </div>
          <div>
            <Label htmlFor="belt_level_id">Belt level</Label>
            <Select id="belt_level_id" {...register("belt_level_id")}>
              <option value="">Select</option>
              {(beltRanks ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.belt_name ?? r.name ?? r.rank ?? `Belt ${r.id}`}
                </option>
              ))}
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit for approval"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
