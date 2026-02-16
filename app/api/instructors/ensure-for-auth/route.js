import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/instructors/ensure-for-auth
 * Called after successful login. For authenticated users with role 'instructor'
 * in user_metadata, ensures an instructor record exists (creates stub if missing).
 * Auth table is for login only; profile data (name, etc.) is filled via complete-profile.
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
      return NextResponse.json({ ok: true, created: false });
    }

    const { data: existing } = await supabase
      .from("instructors")
      .select("id")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, created: false });
    }

    const { data: created, error } = await supabase
      .from("instructors")
      .insert({
        auth_id: user.id,
        email: user.email ?? null,
        first_name: "",
        last_name: "",
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, created: true, instructor: created });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
