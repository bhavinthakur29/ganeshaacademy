"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ROLES } from "@/lib/roles";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [branchId, setBranchId] = useState(null);
  const [instructorId, setInstructorId] = useState(null);
  const [instructor, setInstructor] = useState(null);
  const [profileComplete, setProfileComplete] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveRole = async (authUser) => {
      if (!authUser) {
        setRole(null);
        setBranchId(null);
        setInstructorId(null);
        setInstructor(null);
        setProfileComplete(true);
        return;
      }
      const metaRole = authUser.user_metadata?.role;
      const metaBranch = authUser.user_metadata?.branch_id ?? null;

      if (metaRole === ROLES.ADMIN) {
        setRole(ROLES.ADMIN);
        setBranchId(metaBranch);
        setInstructorId(null);
        setInstructor(null);
        setProfileComplete(true);
        return;
      }

      const { data: instructorRow } = await supabase
        .from("instructors")
        .select("id, branch_id, first_name, last_name")
        .eq("auth_id", authUser.id)
        .maybeSingle();

      if (instructorRow) {
        setRole(ROLES.INSTRUCTOR);
        setBranchId(instructorRow.branch_id ?? metaBranch);
        setInstructorId(instructorRow.id);
        setInstructor(instructorRow);
        const hasName = !!(instructorRow.first_name?.trim() && instructorRow.last_name?.trim());
        const hasBranch = instructorRow.branch_id != null;
        setProfileComplete(hasName && hasBranch);
      } else if (metaRole === ROLES.INSTRUCTOR) {
        setRole(ROLES.INSTRUCTOR);
        setBranchId(metaBranch);
        setInstructorId(null);
        setInstructor(null);
        setProfileComplete(false);
      } else {
        setRole(metaRole || null);
        setBranchId(metaBranch);
        setInstructorId(null);
        setInstructor(null);
        setProfileComplete(true);
      }
    };

    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      setUser(u);
      await resolveRole(u);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_ev, session) => {
      const u = session?.user ?? null;
      setUser(u);
      await resolveRole(u);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const isAdmin = role === ROLES.ADMIN;
  const isInstructor = role === ROLES.INSTRUCTOR;

  return { user, loading, role, isAdmin, isInstructor, branchId, instructorId, instructor, profileComplete };
}
