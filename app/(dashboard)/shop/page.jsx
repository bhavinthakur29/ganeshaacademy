"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useInventory } from "@/hooks/useInventory";
import { useAuth } from "@/hooks/useAuth";
import { addToast } from "@/lib/toast";
import { Package, Plus } from "lucide-react";

export default function ShopPage() {
  const queryClient = useQueryClient();
  const { branchId, instructorId } = useAuth();
  const canFetch = !!(branchId != null && branchId !== "");
  const { data: items, isLoading, Skeleton } = useInventory({
    branchId: branchId ?? undefined,
    activeOnly: true,
    enabled: canFetch,
  });
  const [cart, setCart] = useState({});

  const addToCart = (item, qty = 1) => {
    setCart((c) => ({
      ...c,
      [item.id]: Math.min((c[item.id] ?? 0) + qty, item.quantity ?? 999),
    }));
  };

  const removeFromCart = (itemId) => {
    setCart((c) => {
      const next = { ...c };
      delete next[itemId];
      return next;
    });
  };

  const cartEntries = Object.entries(cart).filter(([, qty]) => qty > 0);
  const cartTotal = cartEntries.reduce((sum, [id, qty]) => {
    const item = items?.find((i) => i.id === Number(id));
    return sum + (item?.unit_price ?? 0) * qty;
  }, 0);

  const handleCheckout = async () => {
    if (cartEntries.length === 0) {
      addToast({ message: "Please add items to cart before placing order", type: "error" });
      return;
    }
    try {
      const orderItems = cartEntries.map(([itemId, qty]) => {
        const item = items.find((i) => i.id === Number(itemId));
        return { item_id: itemId, item_name: item?.item_name, quantity: qty, unit_price: item?.unit_price };
      });
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructor_id: instructorId,
          branch_id: branchId,
          total: cartTotal,
          status: "pending",
          items: orderItems,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to place order");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      addToast({ message: "Order placed successfully. Awaiting admin approval.", type: "success" });
      setCart({});
    } catch (err) {
      addToast({ message: err.message || "Failed to place order. Please try again.", type: "error" });
    }
  };

  if (!canFetch || isLoading) return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Shop</h1>
      <Skeleton />
    </div>
  );

  if (!items?.length)
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Shop</h1>
        <EmptyState icon={Package} title="No items in shop" description="Inventory items will appear here when added by admin." />
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Shop</h1>
      <div className="space-y-6">
        <div className="rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>In Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.item_name ?? "-"}</TableCell>
                  <TableCell>{item.category ?? "-"}</TableCell>
                  <TableCell>{item.unit_price != null ? `₹${item.unit_price}` : "-"}</TableCell>
                  <TableCell>{item.quantity ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {cart[item.id] > 0 ? (
                        <>
                          <Button size="sm" variant="outline" onClick={() => addToCart(item, -1)}>-</Button>
                          <span className="min-w-[1.5rem] text-center">{cart[item.id]}</span>
                          <Button size="sm" variant="outline" onClick={() => addToCart(item, 1)} disabled={(item.quantity ?? 0) <= cart[item.id]}>+</Button>
                          <Button size="sm" variant="ghost" onClick={() => removeFromCart(item.id)}>Remove</Button>
                        </>
                      ) : (
                        <Button size="sm" onClick={() => addToCart(item)} disabled={!(item.quantity > 0)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {cartEntries.length > 0 && (
          <div className="rounded-2xl border border-border bg-muted/30 p-6">
            <h2 className="text-lg font-semibold mb-4">Cart</h2>
            <ul className="space-y-2 mb-4">
              {cartEntries.map(([itemId, qty]) => {
                const item = items.find((i) => i.id === Number(itemId));
                return (
                  <li key={itemId} className="flex justify-between text-sm">
                    <span>{item?.item_name} × {qty}</span>
                    <span>₹{((item?.unit_price ?? 0) * qty).toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <span className="font-medium">Total</span>
              <span className="font-semibold">₹{cartTotal.toFixed(2)}</span>
            </div>
            <Button className="mt-4 w-full" onClick={handleCheckout}>
              Place Order
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
