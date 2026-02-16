import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/instructors/request-edit
 * Instructors can submit profile edit requests for admin approval.
 * Email and branch_id cannot be changed (validated server-side).
 */
export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.slice(7);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.user_metadata?.role !== "instructor") {
      return NextResponse.json({ error: "Only instructors can request profile edits" }, { status: 403 });
    }

    const body = await request.json();
    const { first_name, last_name, phone, belt_level_id } = body;

    if (!first_name?.trim() || !last_name?.trim()) {
      return NextResponse.json({ error: "First name and last name are required" }, { status: 400 });
    }

    const { data: instructor, error: instErr } = await supabase
      .from("instructors")
      .select("id")
      .eq("auth_id", user.id)
      .single();
    if (instErr || !instructor) {
      return NextResponse.json({ error: "Instructor record not found" }, { status: 404 });
    }

    const payload = {
      first_name: String(first_name).trim(),
      last_name: String(last_name).trim(),
      phone: phone?.trim() || null,
      belt_level_id: belt_level_id ? Number(belt_level_id) : null,
    };

    const { data: approval, error } = await supabase
      .from("approval_requests")
      .insert({
        entity_type: "instructor",
        entity_id: instructor.id,
        instructor_id: instructor.id,
        action: "update",
        payload,
        status: "pending",
      })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(approval);
  } catch (err) {
    return NextResponse.json({ error: err.message || "Failed to submit edit request" }, { status: 400 });
  }
}
