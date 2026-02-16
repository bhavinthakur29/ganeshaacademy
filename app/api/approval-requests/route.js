import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const instructorId = searchParams.get("instructorId");
    let q = supabase.from("approval_requests").select("*, instructors(first_name, last_name)");
    if (status) q = q.eq("status", status);
    if (instructorId) q = q.eq("instructor_id", instructorId);
    const { data, error } = await q.order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase.from("approval_requests").insert(body).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
