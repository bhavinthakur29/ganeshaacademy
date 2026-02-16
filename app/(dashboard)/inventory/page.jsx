"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createInventoryItem, updateInventoryItem } from "@/lib/api";
import { addToast } from "@/lib/toast";
import { Plus, Pencil, Package } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useInventory, useBranches } from "@/hooks";

export default function InventoryPage() {
  const { branchId, isAdmin } = useAuth();
  const canFetch = isAdmin;
  const { data: items, isLoading, refetch, Skeleton } = useInventory({ branchId, enabled: canFetch });
  const { data: branches } = useBranches();
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (formOpen) {
      reset(
        selected
          ? {
              item_name: selected.item_name ?? "",
              category: selected.category ?? "",
              quantity: selected.quantity ?? "",
              unit_price: selected.unit_price ?? "",
              branch_id: selected.branch_id ?? "",
              supplier: selected.supplier ?? "",
              last_restocked: selected.last_restocked?.split?.("T")?.[0] ?? "",
              is_active: selected.is_active !== false,
            }
          : { is_active: true }
      );
    }
  }, [formOpen, selected, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        item_name: data.item_name,
        category: data.category || null,
        quantity: data.quantity !== "" ? Number(data.quantity) : null,
        unit_price: data.unit_price !== "" ? Number(data.unit_price) : null,
        branch_id: data.branch_id ? Number(data.branch_id) : null,
        supplier: data.supplier || null,
        last_restocked: data.last_restocked || null,
        is_active: data.is_active !== false,
      };
      if (selected) {
        payload.updated_at = new Date().toISOString();
        await updateInventoryItem(selected.id, payload);
        addToast({ message: "Inventory item updated successfully", type: "success" });
      } else {
        await createInventoryItem(payload);
        addToast({ message: "Inventory item added successfully", type: "success" });
      }
      refetch();
      setFormOpen(false);
      setSelected(null);
      reset();
    } catch (err) {
      addToast({ message: err.message || "Failed to save inventory item", type: "error" });
    }
  };

  if (!canFetch || isLoading) return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Inventory</h1>
      <Skeleton />
    </div>
  );

  const renderDialog = () => (
    <Dialog open={formOpen} onOpenChange={setFormOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selected ? "Edit Item" : "Add Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Item name *</Label>
            <Input {...register("item_name", { required: true })} />
          </div>
          <div>
            <Label>Category</Label>
            <Input {...register("category")} placeholder="e.g. Uniforms, Equipment" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Quantity</Label>
              <Input type="number" {...register("quantity")} />
            </div>
            <div>
              <Label>Unit price</Label>
              <Input type="number" step="0.01" {...register("unit_price")} />
            </div>
          </div>
          <div>
            <Label>Branch</Label>
            <Select {...register("branch_id")}>
              <option value="">Select</option>
              {(branches ?? []).map((b) => (
                <option key={b.id} value={b.id}>{b.name ?? b.branch_name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Supplier</Label>
            <Input {...register("supplier")} />
          </div>
          <div>
            <Label>Last restocked</Label>
            <Input
              type="date"
              {...register("last_restocked")}
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" {...register("is_active")} />
            <Label htmlFor="is_active">Active (visible in Shop)</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (selected ? "Updating…" : "Creating…") : (selected ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  if (items?.length === 0)
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Inventory</h1>
        <EmptyState
          icon={Package}
          title="No inventory items"
          description="Add your first item to track stock."
          action={
            <Button onClick={() => { setSelected(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          }
        />
        {renderDialog()}
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Inventory</h1>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => { setSelected(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
      <div className="min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Last Restocked</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.item_name ?? "-"}</TableCell>
                <TableCell>{item.category ?? "-"}</TableCell>
                <TableCell>{item.quantity ?? "-"}</TableCell>
                <TableCell>{item.unit_price ?? "-"}</TableCell>
                <TableCell>{item.is_active !== false ? "Yes" : "No"}</TableCell>
                <TableCell>{item.branch_id ?? "-"}</TableCell>
                <TableCell>
                  {item.last_restocked ? format(new Date(item.last_restocked), "PP") : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => { setSelected(item); setFormOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {renderDialog()}
    </div>
  );
}
