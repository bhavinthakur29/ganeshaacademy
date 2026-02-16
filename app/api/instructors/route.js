import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email_address, password, ...rest } = body;

    let authId = null;
    if (email_address && password && supabaseAdmin) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email_address,
        password: String(password),
        email_confirm: true,
      });
      if (authError) throw authError;
      authId = authData.user?.id ?? null;
    }

    const emailVal = email_address || rest.email_address || rest.email || null;
    const payload = {
      ...rest,
      auth_id: authId ?? rest.auth_id ?? null,
      email: emailVal,
    };
    delete payload.email_address;
    delete payload.password;

    const { data, error } = await supabase.from("instructors").insert(payload).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
