"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createStudent, updateStudent } from "@/lib/api";
import { addToast } from "@/lib/toast";

function toFormValue(v) {
  if (v == null || v === "") return "";
  return String(v);
}

export function StudentForm({ open, onOpenChange, student, branches, beltRanks = [], onSuccess, isAdmin = true, instructorId = null }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {},
  });

  useEffect(() => {
    if (open) {
      reset(
        student
          ? {
              first_name: student.first_name ?? "",
              last_name: student.last_name ?? "",
              membership_id: toFormValue(student.membership_id),
              email_address: student.email_address ?? "",
              gender: student.gender ?? "",
              date_of_birth: student.date_of_birth?.split?.("T")?.[0] ?? "",
              contact_number: toFormValue(student.contact_number),
              address: student.address ?? "",
              branch_id: student.branch_id ?? "",
              belt_id: student.belt_id ?? "",
              father_name: student.father_name ?? "",
              father_contact_number: toFormValue(student.father_contact_number),
              father_occupation: student.father_occupation ?? "",
              mother_name: student.mother_name ?? "",
              mother_contact_number: toFormValue(student.mother_contact_number),
              mother_occupation: student.mother_occupation ?? "",
              whatsapp_number: toFormValue(student.whatsapp_number),
              school_college_name: student.school_college_name ?? "",
              class_or_semester: student.class_or_semester ?? "",
              notes: student.notes ?? "",
              is_active: student.is_active ?? true,
            }
          : {
              is_active: true,
              branch_id: "",
              belt_id: "",
            }
      );
    }
  }, [open, student, reset]);

  const onSubmit = async (data) => {
    try {
      const num = (v) => (v !== "" && v != null ? Number(v) : null);
      const str = (v) => (v && String(v).trim() ? String(v).trim() : null);
      const payload = {
        first_name: str(data.first_name),
        last_name: str(data.last_name),
        membership_id: str(data.membership_id),
        email_address: str(data.email_address),
        gender: str(data.gender),
        date_of_birth: str(data.date_of_birth) || null,
        contact_number: num(data.contact_number),
        address: str(data.address),
        branch_id: num(data.branch_id),
        belt_id: num(data.belt_id),
        father_name: str(data.father_name),
        father_contact_number: num(data.father_contact_number),
        father_occupation: str(data.father_occupation),
        mother_name: str(data.mother_name),
        mother_contact_number: num(data.mother_contact_number),
        mother_occupation: str(data.mother_occupation),
        whatsapp_number: num(data.whatsapp_number),
        school_college_name: str(data.school_college_name),
        class_or_semester: str(data.class_or_semester),
        notes: str(data.notes),
        is_active: !!data.is_active,
      };
      if (student) payload.updated_at = new Date().toISOString();
      if (student && !isAdmin && instructorId) {
        const res = await fetch("/api/approval-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instructor_id: instructorId,
            entity_type: "student",
            entity_id: student.id,
            action: "update",
            payload,
          }),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Failed to submit request");
        addToast({ message: "Update request sent to admin for approval.", type: "success" });
      } else if (student) {
        await updateStudent(student.id, payload);
        addToast({ message: "Student updated", type: "success" });
      } else {
        await createStudent(payload);
        addToast({ message: "Student created", type: "success" });
      }
      onSuccess?.();
      onOpenChange(false);
      reset();
    } catch (err) {
      addToast({ message: err.message || "Failed to save student", type: "error" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,calc(100vh-2rem))] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student ? "Edit Student" : "Add Student"}</DialogTitle>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="membership_id">Membership ID</Label>
              <Input id="membership_id" {...register("membership_id")} placeholder="e.g. M001" />
            </div>
            <div>
              <Label htmlFor="email_address">Email</Label>
              <Input id="email_address" type="email" {...register("email_address")} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_number">Contact Number</Label>
              <Input id="contact_number" type="tel" {...register("contact_number")} />
            </div>
            <div>
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <Input id="whatsapp_number" type="tel" {...register("whatsapp_number")} />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select id="gender" {...register("gender")}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="branch_id">Branch *</Label>
              <Select id="branch_id" {...register("branch_id", { required: true })}>
                <option value="">Select</option>
                {(branches ?? []).map((b) => (
                  <option key={b.id} value={b.id}>{b.name ?? b.branch_name}</option>
                ))}
              </Select>
              {errors.branch_id && <span className="text-primary text-xs">Required</span>}
            </div>
            <div>
              <Label htmlFor="belt_id">Belt</Label>
              <Select id="belt_id" {...register("belt_id")}>
                <option value="">Select</option>
                {(beltRanks ?? []).map((b) => (
                  <option key={b.id} value={b.id}>{b.belt_name ?? b.belt_color ?? b.id}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium mb-2">Parent / Guardian</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="father_name">Father Name</Label>
                <Input id="father_name" {...register("father_name")} />
              </div>
              <div>
                <Label htmlFor="father_contact_number">Father Contact</Label>
                <Input id="father_contact_number" type="tel" {...register("father_contact_number")} />
              </div>
              <div className="col-span-2">
                <Label htmlFor="father_occupation">Father Occupation</Label>
                <Input id="father_occupation" {...register("father_occupation")} />
              </div>
              <div>
                <Label htmlFor="mother_name">Mother Name</Label>
                <Input id="mother_name" {...register("mother_name")} />
              </div>
              <div>
                <Label htmlFor="mother_contact_number">Mother Contact</Label>
                <Input id="mother_contact_number" type="tel" {...register("mother_contact_number")} />
              </div>
              <div className="col-span-2">
                <Label htmlFor="mother_occupation">Mother Occupation</Label>
                <Input id="mother_occupation" {...register("mother_occupation")} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="school_college_name">School / College</Label>
              <Input id="school_college_name" {...register("school_college_name")} />
            </div>
            <div>
              <Label htmlFor="class_or_semester">Class / Semester</Label>
              <Input id="class_or_semester" {...register("class_or_semester")} />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...register("notes")} placeholder="Optional notes" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" {...register("is_active")} />
            <Label htmlFor="is_active">Active</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (student ? "Updating…" : "Creating…") : (student ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
