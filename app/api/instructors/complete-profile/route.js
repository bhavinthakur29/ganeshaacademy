import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/instructors/complete-profile
 * For authenticated users with role instructor. Creates or updates the instructor
 * record (instructors table only — does not touch auth.users). Used for profile completion flow.
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

    const role = user.user_metadata?.role;
    if (role !== "instructor") {
      return NextResponse.json({ error: "Only instructors can complete profile here" }, { status: 403 });
    }

    const body = await request.json();
    const { first_name, last_name, email, phone, belt_level_id } = body;

    if (!first_name?.trim() || !last_name?.trim()) {
      return NextResponse.json({ error: "First name and last name are required" }, { status: 400 });
    }

    const payload = {
      first_name: String(first_name).trim(),
      last_name: String(last_name).trim(),
      auth_id: user.id,
      email: email?.trim() || user.email || null,
      phone: phone?.trim() || null,
      belt_level_id: belt_level_id ? Number(belt_level_id) : null,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase
      .from("instructors")
      .select("id")
      .eq("auth_id", user.id)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from("instructors")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from("instructors")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
