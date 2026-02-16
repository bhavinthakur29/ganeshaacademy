import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { data: req, error: fetchErr } = await supabase
      .from("approval_requests")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchErr || !req) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (req.status !== "pending") return NextResponse.json({ error: "Already reviewed" }, { status: 400 });

    const status = action === "approve" ? "approved" : "rejected";

    if (action === "approve" && req.entity_type === "student") {
      if (req.action === "update" && req.payload) {
        const allowed = ["first_name", "last_name", "email_address", "gender", "contact_number", "father_name", "mother_name", "branch_id", "date_of_birth", "belt_id", "is_active", "updated_at"];
        const clean = Object.fromEntries(Object.entries(req.payload).filter(([k]) => allowed.includes(k)));
        const { error: updErr } = await supabase.from("students").update(clean).eq("id", req.entity_id);
        if (updErr) throw updErr;
      } else if (req.action === "delete") {
        const { error: delErr } = await supabase.from("students").delete().eq("id", req.entity_id);
        if (delErr) throw delErr;
      }
    }

    if (action === "approve" && req.entity_type === "instructor") {
      if (req.action === "update" && req.payload) {
        const allowed = ["first_name", "last_name", "phone", "belt_level_id", "updated_at"];
        const clean = Object.fromEntries(Object.entries(req.payload).filter(([k]) => allowed.includes(k)));
        if (Object.keys(clean).length) {
          clean.updated_at = new Date().toISOString();
          const { error: updErr } = await supabase.from("instructors").update(clean).eq("id", req.entity_id);
          if (updErr) throw updErr;
        }
      }
    }

    const { data, error } = await supabase
      .from("approval_requests")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    const { data: inst } = await supabase.from("instructors").select("auth_id").eq("id", req.instructor_id).single();
    if (inst?.auth_id) {
      const entityLabel = req.entity_type === "instructor" ? "profile" : req.entity_type;
      await supabase.from("notifications").insert({
        user_id: inst.auth_id,
        type: "approval",
        message: `Your ${entityLabel} ${req.action} request was ${status}.`,
        is_read: false,
      });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
