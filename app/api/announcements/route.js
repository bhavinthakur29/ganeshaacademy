import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase.from("announcements").insert(body).select().single();
    if (error) throw error;
    const { data: instructors } = await supabase.from("instructors").select("auth_id").eq("is_active", true);
    const title = body.title || "New announcement";
    for (const inst of instructors ?? []) {
      if (inst.auth_id) {
        await supabase.from("notifications").insert({
          user_id: inst.auth_id,
          type: "announcement",
          message: title,
          is_read: false,
        });
      }
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
