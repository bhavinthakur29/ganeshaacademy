"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { addToast } from "@/lib/toast";
import { Pencil, ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks";

function getStudentName(s) {
  if (!s) return "-";
  return `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() || "-";
}

function getInstructorName(i) {
  if (!i) return "-";
  return `${i.first_name ?? ""} ${i.last_name ?? ""}`.trim() || "-";
}

export default function OrdersPage() {
  const { branchId, instructorId, isAdmin } = useAuth();
  const canFetch = isAdmin || !!(instructorId != null && instructorId !== "");
  const { data: orders, isLoading, refetch, Skeleton } = useOrders({
    ...(isAdmin ? { branchId } : { instructorId }),
    enabled: canFetch,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/orders/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: data.status || "pending" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update order status");
      addToast({ message: "Order status updated successfully", type: "success" });
      refetch();
      setFormOpen(false);
      setSelected(null);
      reset();
    } catch (err) {
      addToast({ message: err.message || "Failed to update order status", type: "error" });
    }
  };

  if (!canFetch || isLoading) return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Orders</h1>
      <Skeleton />
    </div>
  );

  if (orders?.length === 0)
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Orders</h1>
        <EmptyState
          icon={ShoppingCart}
          title="No orders yet"
          description={isAdmin ? "Orders from instructors will appear here." : "Create orders from the Shop."}
        />
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Orders</h1>
      <div className="min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isAdmin ? "Student" : "Placed by"}</TableHead>
              {isAdmin && <TableHead>Placed by</TableHead>}
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead>Branch</TableHead>}
              <TableHead>Date</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{isAdmin ? getStudentName(order.students) : getInstructorName(order.instructors)}</TableCell>
                {isAdmin && <TableCell>{getInstructorName(order.instructors)}</TableCell>}
                <TableCell>{order.total ?? "-"}</TableCell>
                <TableCell><Badge variant={order.status === "delivered" ? "success" : order.status === "cancelled" ? "destructive" : "warning"}>{order.status ?? "pending"}</Badge></TableCell>
                {isAdmin && <TableCell>{order.branch_id ?? "-"}</TableCell>}
                <TableCell>{order.created_at ? format(new Date(order.created_at), "PP") : "-"}</TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => { setSelected(order); setFormOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select {...register("status")} defaultValue={selected?.status}>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating…" : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
