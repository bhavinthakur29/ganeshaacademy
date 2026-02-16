"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { canAccessRoute } from "@/lib/roles";

const COMPLETE_PROFILE_PATH = "/complete-profile";

export function RoleGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, role, isInstructor, profileComplete } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (isInstructor && !profileComplete && pathname !== COMPLETE_PROFILE_PATH) {
      router.replace(COMPLETE_PROFILE_PATH);
      return;
    }
    if (role && !canAccessRoute(role, pathname) && pathname !== COMPLETE_PROFILE_PATH) {
      router.replace("/dashboard");
    }
  }, [user, loading, role, isInstructor, profileComplete, pathname, router]);

  if (loading || !role) return null;
  if (!user) return null;
  if (isInstructor && !profileComplete && pathname !== COMPLETE_PROFILE_PATH) return null;
  if (role && !canAccessRoute(role, pathname) && pathname !== COMPLETE_PROFILE_PATH) return null;

  return children;
}
