"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Building2, ClipboardList, DollarSign, Clock, ShoppingCart, ChevronRight, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks";
import { getPendingApprovalCount, getPendingOrdersCount } from "@/lib/api";
import { cn } from "@/lib/utils";

const ICON_CLASS = "h-7 w-7 text-emerald-600 dark:text-emerald-400 shrink-0";

async function getStats({ isInstructor, branchId }) {
  const today = new Date().toISOString().split("T")[0];

  if (isInstructor && branchId) {
    // Instructor dashboard: branch students only, attendance, pending approvals, pending orders
    const { data: branchStudents } = await supabase.from("students").select("id").eq("branch_id", branchId);
    const studentIds = (branchStudents ?? []).map((s) => s.id);

    const [attendanceRes, approvalsRes, ordersRes] = await Promise.all([
      studentIds.length
        ? supabase
          .from("attendance")
          .select("id", { count: "exact", head: true })
          .in("student_id", studentIds)
          .eq("class_date", today)
          .eq("status", "present")
        : Promise.resolve({ count: 0 }),
      getPendingApprovalCount(),
      getPendingOrdersCount(branchId),
    ]);

    return {
      branchStudents: studentIds.length,
      todayAttendance: attendanceRes?.count ?? 0,
      pendingApprovals: approvalsRes ?? 0,
      pendingOrders: ordersRes ?? 0,
    };
  }

  // Admin dashboard
  const [studentsRes, activeRes, branchesRes, attendanceRes, feesRes, approvalsRes] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("is_active", true),
    branchId ? Promise.resolve({ count: 1 }) : supabase.from("branches").select("id", { count: "exact", head: true }),
    supabase.from("attendance").select("id", { count: "exact", head: true }).eq("class_date", today).eq("status", "present"),
    supabase.from("fees").select("id", { count: "exact", head: true }).gte("due_date", today).neq("status", "paid"),
    getPendingApprovalCount(),
  ]);

  return {
    totalStudents: studentsRes?.count ?? 0,
    activeStudents: activeRes?.count ?? 0,
    branches: branchesRes?.count ?? 1,
    todayAttendance: attendanceRes?.count ?? 0,
    upcomingFees: feesRes?.count ?? 0,
    pendingApprovals: approvalsRes ?? 0,
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const { branchId, isInstructor } = useAuth();
  const { data: branches } = useBranches();
  const branch = branches?.find((b) => b.id === branchId || String(b.id) === String(branchId));
  const branchName = branch?.name ?? branch?.branch_name;

  useEffect(() => {
    getStats({ isInstructor, branchId }).then(setStats).catch(() => {
      if (isInstructor) {
        setStats({ branchStudents: 0, todayAttendance: 0, pendingApprovals: 0, pendingOrders: 0 });
      } else {
        setStats({
          totalStudents: 0, activeStudents: 0, branches: 0,
          todayAttendance: 0, upcomingFees: 0, pendingApprovals: 0,
        });
      }
    });
  }, [branchId, isInstructor]);

  const cardCount = isInstructor ? 4 : 6;

  const cards = stats ? (
    isInstructor
      ? [
        { label: "Students", value: stats.branchStudents, icon: Users, href: "/students" },
        { label: "Attendance", value: stats.todayAttendance, icon: ClipboardList, href: "/attendance" },
        { label: "Pending Approvals", value: stats.pendingApprovals, icon: Clock, href: "/attendance" },
        { label: "Pending Orders", value: stats.pendingOrders, icon: ShoppingCart, href: "/orders" },
      ]
      : [
        { label: "Total Students", value: stats.totalStudents, icon: Users, href: "/students" },
        { label: "Active Students", value: stats.activeStudents, icon: Users, href: "/students" },
        { label: "Branches", value: stats.branches, icon: Building2, href: "/branches" },
        { label: "Today's Attendance", value: stats.todayAttendance, icon: ClipboardList, href: "/attendance" },
        { label: "Upcoming Fees", value: stats.upcomingFees, icon: DollarSign, href: "/fees" },
        { label: "Pending Approvals", value: stats.pendingApprovals, icon: Clock, href: "/attendance" },
      ]
  ) : [];

  if (!stats) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-64 rounded-md bg-muted animate-pulse" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cardCount }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  const totalCards = cards.length;

  return (
    <div className="space-y-8">
      {/* Hero section - Dilatron style */}
      <section className="space-y-3">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          {isInstructor ? ("A unit of GAMA") : "ganesha academy of martial arts"}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {isInstructor ? (branchName ? branchName : "Your branch at a glance") : "Your academy at a glance"}
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          {isInstructor
            ? "Track students, attendance, and orders for your branch."
            : "Manage students, branches, attendance, and fees in one place."}
        </p>
      </section>

      {/* Stats grid - prominent numbers like Dilatron */}
      <div className={cn(
        "grid gap-5",
        totalCards <= 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"
      )}>
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} prefetch>
            <Card className="group relative cursor-pointer transition-all duration-300 border border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-500/40 dark:hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/5 bg-white/90 dark:bg-slate-900/95 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full" />
              <CardHeader className="flex flex-row items-start justify-between pb-1 relative">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 ring-1 ring-emerald-500/20">
                    <Icon className={cn(ICON_CLASS)} />
                  </div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </CardHeader>
              <CardContent className="pt-2 relative">
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {value}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Trust line - Dilatron style */}
      <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5 text-emerald-600/70 dark:text-emerald-400/70" />
        Secure • Reliable • Built by<strong><a href="https://linkedin.com/in/bhavinthakur" target="_blank">Bhavin Thakur</a></strong>
      </p>
    </div>
  );
}
