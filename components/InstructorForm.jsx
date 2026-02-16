"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createInstructor, updateInstructor } from "@/lib/api";
import { useBeltRanks } from "@/hooks/useBeltRanks";
import { addToast } from "@/lib/toast";

export function InstructorForm({ open, onOpenChange, instructor, branches, onSuccess }) {
  const { data: beltRanks } = useBeltRanks();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (open) {
      reset(
        instructor
          ? {
              first_name: instructor.first_name ?? "",
              last_name: instructor.last_name ?? "",
              email: instructor.email ?? instructor.email_address ?? "",
              password: "",
              phone: instructor.phone ?? instructor.contact_number ?? "",
              belt_level_id: instructor.belt_level_id ?? instructor.belt_id ?? "",
              branch_id: instructor.branch_id ?? "",
              is_active: instructor.is_active ?? true,
            }
          : { email: "", password: "", is_active: true }
      );
    }
  }, [open, instructor, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || null,
        phone: data.phone || null,
        belt_level_id: data.belt_level_id ? Number(data.belt_level_id) : null,
        branch_id: data.branch_id ? Number(data.branch_id) : null,
        is_active: !!data.is_active,
      };
      if (instructor) {
        await updateInstructor(instructor.id, payload);
        addToast({ message: "Instructor updated", type: "success" });
      } else {
        if (data.email && data.password) {
          payload.password = data.password;
        }
        const res = await fetch("/api/instructors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to create instructor");
        addToast({ message: "Instructor created. They can log in with email and password.", type: "success" });
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      addToast({ message: err.message || "Failed to save instructor", type: "error" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{instructor ? "Edit Instructor" : "Add Instructor"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input id="first_name" {...register("first_name", { required: true })} />
              {errors.first_name && <span className="text-primary text-xs">Required</span>}
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input id="last_name" {...register("last_name", { required: true })} />
              {errors.last_name && <span className="text-primary text-xs">Required</span>}
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
          </div>
          {!instructor && (
            <div>
              <Label htmlFor="password">Password (required for login)</Label>
              <Input id="password" type="password" {...register("password")} placeholder="Min 6 characters" />
            </div>
          )}
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" {...register("phone")} />
          </div>
          <div>
            <Label htmlFor="branch_id">Branch</Label>
            <Select id="branch_id" {...register("branch_id")}>
              <option value="">Select</option>
              {(branches ?? []).map((b) => (
                <option key={b.id} value={b.id}>{b.name ?? b.branch_name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="belt_level_id">Belt Level</Label>
            <Select id="belt_level_id" {...register("belt_level_id")}>
              <option value="">Select</option>
              {(beltRanks ?? []).map((r) => (
                <option key={r.id} value={r.id}>{r.belt_name ?? r.name ?? r.rank ?? r.id}</option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" {...register("is_active")} />
            <Label htmlFor="is_active">Active</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (instructor ? "Updating…" : "Creating…") : (instructor ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
