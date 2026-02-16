"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Bell, CheckCheck, ChevronRight, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useApprovalRequests } from "@/hooks/useApprovalRequests";
import { cn } from "@/lib/utils";

function truncate(str, len = 60) {
  if (!str) return "";
  return str.length <= len ? str : str.slice(0, len) + "…";
}

export function NotificationPopover({ unreadCount = 0, onReadUpdate }) {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [open, setOpen] = React.useState(false);
  const { data: items, isLoading, refetch, markReadMutation, markAllReadMutation } = useNotifications(user?.id ?? "");
  const { data: approvals = [], isLoading: approvalsLoading } = useApprovalRequests(isAdmin ? { status: "pending" } : { status: null });

  const handleMarkRead = (id) => {
    markReadMutation.mutate(id, {
      onSuccess: () => {
        refetch();
        onReadUpdate?.();
      },
    });
  };

  const handleMarkAllRead = () => {
    if (!user?.id) return;
    markAllReadMutation.mutate(undefined, {
      onSuccess: () => {
        refetch();
        onReadUpdate?.();
      },
    });
  };

  const unread = typeof unreadCount === "number" ? unreadCount : (items?.filter((n) => !n.is_read)?.length ?? 0);
  const hasApprovals = isAdmin && approvals?.length > 0;
  const hasItems = (items?.length ?? 0) > 0;
  const hasAny = hasApprovals || hasItems;
  const loadingAny = authLoading || isLoading || (isAdmin && approvalsLoading);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" title="Notifications" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <Badge className="absolute -right-1 -top-1 h-4 min-w-4 items-center justify-center rounded-full p-0 text-[10px]">
              {unread > 99 ? "99+" : unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleMarkAllRead}>
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-[320px] overflow-y-auto">
          {authLoading ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-2 rounded-lg border border-border p-2.5">
                  <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground" aria-hidden />
              <p className="text-sm font-medium text-foreground">Session expired</p>
              <p className="text-xs text-muted-foreground">Sign in again to view your notifications</p>
            </div>
          ) : loadingAny ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-2 rounded-lg border border-border p-2.5">
                  <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : !hasAny ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground" aria-hidden />
              <p className="text-sm font-medium text-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground">You're all caught up</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {hasApprovals && approvals.slice(0, 4).map((a) => (
                <Link
                  key={a.id}
                  href="/notifications"
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-2 px-3 py-2.5 transition-colors hover:bg-muted/50 bg-amber-500/10 dark:bg-amber-600/10"
                >
                  <FileCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Approval request</p>
                    <p className="mt-0.5 line-clamp-2 text-sm">
                      {a.entity_type === "instructor" ? "Instructor profile" : a.entity_type || "Student"} {a.action}
                      {a.instructors && ` by ${a.instructors.first_name} ${a.instructors.last_name}`}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {a.created_at ? format(new Date(a.created_at), "MMM d, h:mm a") : ""}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
              {items.slice(0, hasApprovals ? 4 : 8).map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "cursor-pointer px-3 py-2.5 transition-colors hover:bg-muted/50",
                    !n.is_read && "bg-primary/5"
                  )}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-muted-foreground">{n.type ?? "Notification"}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm">{truncate(n.message, 80)}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {n.created_at ? format(new Date(n.created_at), "MMM d, h:mm a") : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {hasAny && (
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1 border-t border-border py-2.5 text-sm font-medium text-primary hover:bg-muted/50"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </PopoverContent>
    </Popover>
  );
}
