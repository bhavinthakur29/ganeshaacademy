"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Building2,
  GraduationCap,
  ClipboardList,
  DollarSign,
  Megaphone,
  ShoppingCart,
  Package,
  Bell,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { filterNavItemsByRole } from "@/lib/roles";
import { siteConfig } from "@/config/site";

const allNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/students", label: "Students", icon: Users },
  { href: "/branches", label: "Branches", icon: Building2, adminOnly: true },
  { href: "/instructors", label: "Instructors", icon: GraduationCap, adminOnly: true },
  { href: "/attendance", label: "Attendance", icon: ClipboardList },
  { href: "/fees", label: "Fees", icon: DollarSign },
  { href: "/announcements", label: "Announcements", icon: Megaphone, adminOnly: true },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/inventory", label: "Inventory", icon: Package, adminOnly: true },
  { href: "/shop", label: "Shop", icon: ShoppingCart, instructorOnly: true },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar({ collapsed, onCollapsed, open, onOpen }) {
  const pathname = usePathname();
  const { role } = useAuth();
  const navItems = filterNavItemsByRole(allNavItems, role);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => onOpen?.(false)}
          aria-hidden="true"
        />
      )}
      {/* Sidebar - visible on desktop, drawer on mobile */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-200/60 dark:border-slate-700/50 bg-white/85 dark:bg-slate-900/90 backdrop-blur-2xl shadow-[4px_0_24px_-4px_rgba(0,0,0,0.08)] dark:shadow-[4px_0_24px_-4px_rgba(0,0,0,0.4)] transition-all duration-300 ease-in-out",
          // Mobile: slide in/out
          open ? "translate-x-0 w-64" : "-translate-x-full w-64 lg:translate-x-0",
          // Desktop: always visible, width from collapsed
          "lg:w-14",
          !collapsed && "lg:w-64"
        )}
      >
        <div className="flex h-14 min-h-[3.5rem] shrink-0 items-center justify-between border-b border-slate-200/60 dark:border-slate-700/50 px-3 bg-gradient-to-r from-white/50 to-transparent dark:from-slate-800/50 dark:to-transparent">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden rounded-lg px-1 py-1.5 -mx-1 -my-1.5 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/60">
            <div
              className={cn(
                "relative shrink-0 flex items-center justify-center overflow-hidden flex-shrink-0 transition-all duration-300",
                collapsed
                  ? "size-9 rounded-lg"
                  : "size-10 rounded-xl bg-white dark:bg-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.25)] border border-slate-100 dark:border-slate-700/80"
              )}
            >
              <Image
                src={`/${siteConfig.siteLogo}`}
                alt={siteConfig.brandName}
                width={collapsed ? 28 : 30}
                height={collapsed ? 28 : 30}
                className="shrink-0 object-contain"
              />
            </div>
            {!collapsed && (
              <span className="font-bold text-base text-emerald-700 dark:text-emerald-400 whitespace-nowrap truncate">
                {siteConfig.brandName}
              </span>
            )}
          </Link>
          <div className="flex shrink-0 gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
              onClick={() => onCollapsed?.(!collapsed)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => onOpen?.(false)}
              aria-label="Close menu"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} prefetch onClick={() => onOpen?.(false)}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  pathname === href
                    ? "bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-800 dark:text-emerald-200 shadow-sm ring-1 ring-emerald-500/20 dark:ring-emerald-400/30"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 shrink-0 flex-shrink-0",
                  pathname === href && "text-emerald-600 dark:text-emerald-400"
                )} />
                {!collapsed && <span className="truncate">{label}</span>}
              </div>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
