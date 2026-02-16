import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id).select().single();
    if (error) throw error;
    return NextResponse.json(data ?? { ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
