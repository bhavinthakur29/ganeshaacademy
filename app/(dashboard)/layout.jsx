"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { RoleGuard } from "@/components/RoleGuard";
import { NotificationRealtimeHandler } from "@/components/NotificationRealtimeHandler";

const DashboardPrefetcher = dynamic(() => import("@/components/DashboardPrefetcher").then((m) => m.DashboardPrefetcher), {
  ssr: false,
});
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { getUnreadCount, getPendingApprovalCount } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const COMPLETE_PROFILE_PATH = "/complete-profile";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { user, loading, role, isInstructor, profileComplete } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (isInstructor && !profileComplete) {
      router.replace(COMPLETE_PROFILE_PATH);
    }
  }, [loading, user, isInstructor, profileComplete, router]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollingRef = useRef(null);
  const { theme, toggle } = useTheme();

  const refreshUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      let c = await getUnreadCount(user.id);
      if (user.user_metadata?.role === "admin") c += await getPendingApprovalCount();
      setUnreadCount(c);
    } catch {}
  }, [user]);

  const handleRealtimeNotification = useCallback((payload) => {
    if (payload?.eventType === "INSERT" && payload.new && !payload.new.is_read) {
      setUnreadCount((c) => c + 1);
    } else if (payload?.eventType === "UPDATE" && payload.new?.is_read === true) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();

    const approvalChannel = supabase.channel("ganesha-approvals");
    approvalChannel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "approval_requests" },
      () => setTimeout(refreshUnreadCount, 300)
    );
    approvalChannel.subscribe((status) => {
      if ((status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") && !pollingRef.current) {
        pollingRef.current = setInterval(refreshUnreadCount, 45000);
      }
    });

    return () => {
      supabase.removeChannel(approvalChannel);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [refreshUnreadCount]);

  if (loading || (user && !role)) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-100/90 dark:from-slate-950 dark:via-indigo-950/50 dark:to-slate-900" />
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-indigo-400/30 dark:from-indigo-500/20 dark:to-violet-600/20 blur-3xl" />
        <div className="relative z-10 h-8 w-32 rounded-md bg-white/80 dark:bg-slate-800/80 animate-pulse backdrop-blur-sm" aria-hidden />
      </div>
    );
  }
  if (!user) return null;
  if (isInstructor && !profileComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-100/90 dark:from-slate-950 dark:via-indigo-950/50 dark:to-slate-900" />
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-indigo-400/30 dark:from-indigo-500/20 dark:to-violet-600/20 blur-3xl" />
        <div className="relative z-10 h-8 w-32 rounded-md bg-white/80 dark:bg-slate-800/80 animate-pulse backdrop-blur-sm" aria-hidden />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/15" />
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-400/5 dark:bg-emerald-600/10 blur-3xl" />
      <div className="relative z-10 flex min-h-screen flex-col">
      <NotificationRealtimeHandler
        userId={user?.id}
        onNotification={handleRealtimeNotification}
        onRealtimeFailed={refreshUnreadCount}
      />
      <DashboardPrefetcher />
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsed={setSidebarCollapsed}
        open={sidebarOpen}
        onOpen={setSidebarOpen}
      />
      <div
        className={cn(
          "flex flex-col min-h-screen w-full min-w-0 transition-all duration-300",
          "pl-0",
          sidebarCollapsed ? "lg:pl-14" : "lg:pl-64"
        )}
      >
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          theme={theme}
          onThemeToggle={toggle}
          unreadCount={unreadCount}
          onReadUpdate={user ? async () => {
            try {
              let c = await getUnreadCount(user.id);
              if (user.user_metadata?.role === "admin") c += await getPendingApprovalCount();
              setUnreadCount(c);
            } catch {}
          } : undefined}
        />
        <main className="flex-1 overflow-auto overflow-x-auto p-4 md:p-6 min-h-0 w-full min-w-0">
          <RoleGuard>{children}</RoleGuard>
        </main>
      </div>
      </div>
    </div>
  );
}
