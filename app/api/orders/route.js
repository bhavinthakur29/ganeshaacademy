import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function notifyAdminsOrderPlaced(orderNumber, total, instructorId) {
  if (!supabaseAdmin) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[orders] supabaseAdmin not available - set SUPABASE_SERVICE_ROLE_KEY for admin notifications");
    }
    return;
  }
  try {
    const { data: { users } = {}, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 500 });
    if (listError) {
      console.warn("[orders] listUsers failed:", listError.message);
      return;
    }
    const admins = (users ?? []).filter(
      (u) => u.user_metadata?.role === "admin" || u.raw_user_meta_data?.role === "admin"
    );
    if (admins.length === 0 && (users ?? []).length > 0) {
      console.warn("[orders] No admin users found. Ensure admin has user_metadata.role = 'admin' in Supabase Auth > Users.");
    }
    const message = `New order ${orderNumber} placed for ₹${Number(total ?? 0).toFixed(2)}.`;
    for (const admin of admins) {
      if (admin.id) {
        const { error: insertError } = await supabaseAdmin.from("notifications").insert({
          user_id: admin.id,
          type: "order",
          message,
          metadata: { order_number: orderNumber, instructor_id: instructorId },
          is_read: false,
        });
        if (insertError) console.warn("[orders] Insert notification failed for admin:", admin.id, insertError.message);
      }
    }
  } catch (e) {
    console.warn("[orders] Failed to notify admins:", e?.message);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const orderNumber = body.order_number ?? generateOrderNumber();
    const payload = {
      ...body,
      order_number: orderNumber,
    };
    const { data, error } = await supabase.from("orders").insert(payload).select().single();
    if (error) throw error;
    await notifyAdminsOrderPlaced(orderNumber, body.total, body.instructor_id);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
