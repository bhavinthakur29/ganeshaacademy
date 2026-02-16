"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBranch, updateBranch } from "@/lib/api";
import { addToast } from "@/lib/toast";

export function BranchForm({ open, onOpenChange, branch, onSuccess }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (open) {
      reset(
        branch
          ? {
              name: branch.name ?? branch.branch_name ?? "",
              address: branch.address ?? "",
              phone: branch.phone ?? "",
              email: branch.email ?? "",
              manager: branch.manager ?? "",
            }
          : {}
      );
    }
  }, [open, branch, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        manager: data.manager || null,
      };
      if (branch) {
        await updateBranch(branch.id, payload);
        addToast({ message: "Branch updated", type: "success" });
      } else {
        await createBranch(payload);
        addToast({ message: "Branch created", type: "success" });
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      addToast({ message: err.message || "Failed to save branch", type: "error" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{branch ? "Edit Branch" : "Add Branch"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register("name", { required: true })} />
            {errors.name && <span className="text-primary text-xs">Required</span>}
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" {...register("phone")} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
          </div>
          <div>
            <Label htmlFor="manager">Manager</Label>
            <Input id="manager" {...register("manager")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (branch ? "Updating…" : "Creating…") : (branch ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
