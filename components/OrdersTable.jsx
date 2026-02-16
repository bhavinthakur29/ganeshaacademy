"use client";

import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useOrders } from "@/hooks";
import { getStudentFullName } from "@/lib/schema";
import { ShoppingCart } from "lucide-react";

export function OrdersTable() {
  const { data: orders, isLoading, isError, refetch, Skeleton } = useOrders();

  if (isLoading) return <Skeleton />;
  if (isError)
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
        Failed to load orders. <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  if (orders?.length === 0)
    return (
      <EmptyState
        icon={ShoppingCart}
        title="No orders yet"
        description="Orders will appear here when created."
      />
    );

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{getStudentFullName(order.students) ?? "-"}</TableCell>
              <TableCell>{order.total ?? "-"}</TableCell>
              <TableCell>{order.status ?? "-"}</TableCell>
              <TableCell>{order.created_at ? format(new Date(order.created_at), "PPP") : "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
