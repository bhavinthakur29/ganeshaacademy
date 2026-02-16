"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/lib/api";
import { addToast } from "@/lib/toast";
import { Plus, Pencil, Trash2, Megaphone } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useAnnouncements, useBranches } from "@/hooks";

export default function AnnouncementsPage() {
  const { branchId, isAdmin } = useAuth();
  const canFetch = isAdmin;
  const { data: announcements, isLoading, refetch, Skeleton } = useAnnouncements({ branchId, enabled: canFetch });
  const { data: branches } = useBranches();
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (formOpen) {
      reset(
        selected
          ? {
              title: selected.title ?? "",
              message: selected.message ?? selected.body ?? "",
              branch_id: selected.branch_id ?? "",
              is_active: selected.is_active ?? true,
              start_date: selected.start_date?.split?.("T")?.[0] ?? "",
              end_date: selected.end_date?.split?.("T")?.[0] ?? "",
            }
          : { is_active: true }
      );
    }
  }, [formOpen, selected, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.title,
        body: data.message || data.body || "",
        branch_id: data.branch_id ? Number(data.branch_id) : null,
        is_active: !!data.is_active,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
      };
      if (selected) {
        await updateAnnouncement(selected.id, payload);
        addToast({ message: "Announcement updated successfully", type: "success" });
      } else {
        await createAnnouncement(payload);
        addToast({ message: "Announcement created successfully", type: "success" });
      }
      refetch();
      setFormOpen(false);
      setSelected(null);
      reset();
    } catch (err) {
      addToast({ message: err.message || "Failed to save announcement", type: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await deleteAnnouncement(id);
      addToast({ message: "Announcement deleted", type: "success" });
      refetch();
    } catch (err) {
      addToast({ message: err.message || "Failed to delete announcement", type: "error" });
    }
  };

  if (!canFetch || isLoading) return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Announcements</h1>
      <Skeleton />
    </div>
  );

  if (announcements?.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Announcements</h1>
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="Create an announcement to share with students and staff."
          action={
            <Button type="button" onClick={() => { setSelected(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Announce
            </Button>
          }
        />
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Announce</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input {...register("title", { required: true })} />
              </div>
              <div>
                <Label>Message</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  {...register("message")}
                />
              </div>
              <div>
                <Label>Branch</Label>
                <Select {...register("branch_id")}>
                  <option value="">All branches</option>
                  {(branches ?? []).map((b) => (
                    <option key={b.id} value={b.id}>{b.name ?? b.branch_name}</option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" {...register("start_date")} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" {...register("end_date")} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register("is_active")} />
                <Label>Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Announcing…" : "Announce"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Announcements</h1>
      <div className="mb-4 flex justify-end">
        <Button type="button" onClick={() => { setSelected(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Announce
        </Button>
      </div>
      <div className="min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.title ?? "-"}</TableCell>
                <TableCell>{a.branch_id ?? "All"}</TableCell>
                <TableCell>{a.start_date ? format(new Date(a.start_date), "PP") : "-"}</TableCell>
                <TableCell>{a.end_date ? format(new Date(a.end_date), "PP") : "-"}</TableCell>
                <TableCell>
                  <Badge variant={a.is_active ? "success" : "outline"}>{a.is_active ? "Active" : "Inactive"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button type="button" size="sm" variant="ghost" onClick={() => { setSelected(a); setFormOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => handleDelete(a.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected ? "Edit Announcement" : "Announce"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input {...register("title", { required: true })} />
            </div>
            <div>
              <Label>Message</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                {...register("message")}
              />
            </div>
            <div>
              <Label>Branch</Label>
              <Select {...register("branch_id")}>
                <option value="">All branches</option>
                {(branches ?? []).map((b) => (
                  <option key={b.id} value={b.id}>{b.name ?? b.branch_name}</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" {...register("start_date")} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" {...register("end_date")} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" {...register("is_active")} />
              <Label>Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (selected ? "Updating…" : "Announcing…") : (selected ? "Update" : "Announce")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
