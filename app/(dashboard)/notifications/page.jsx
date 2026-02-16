"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useApprovalRequests } from "@/hooks/useApprovalRequests";
import { Bell, Check, X } from "lucide-react";
import { addToast } from "@/lib/toast";

export default function NotificationsPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const { data: items, isLoading, refetch, Skeleton, markReadMutation, markAllReadMutation } = useNotifications(user?.id ?? "");
  const { data: approvals, refetch: refetchApprovals } = useApprovalRequests(isAdmin ? { status: "pending" } : { status: null });

  const markRead = (id) => {
    markReadMutation.mutate(id, { onSuccess: () => refetch() });
  };

  const markAllRead = () => {
    if (!user?.id) return;
    markAllReadMutation.mutate(undefined, { onSuccess: () => refetch() });
  };

  if (authLoading)
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Notifications</h1>
        <Skeleton />
      </div>
    );
  if (!user)
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Notifications</h1>
        <EmptyState icon={Bell} title="Session expired" description="Sign in again to view your notifications." />
      </div>
    );
  if (isLoading) return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Notifications</h1>
      <Skeleton />
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Notifications</h1>
      {isAdmin && approvals?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">Pending approval requests</h2>
          <div className="space-y-3">
            {approvals.map((a) => (
              <Card key={a.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">
                    {a.entity_type === "instructor" ? "Instructor profile" : a.entity_type || "Student"} {a.action} request
                    {a.instructors && (
                      <span className="text-muted-foreground font-normal ml-2">
                        by {a.instructors.first_name} {a.instructors.last_name}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {a.entity_type === "instructor"
                      ? (a.action === "update" ? "Update instructor profile data" : a.action)
                      : a.action === "update"
                        ? "Update student data"
                        : `Delete student #${a.entity_id}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{format(new Date(a.created_at), "PPp")}</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      disabled={approvingId === a.id || rejectingId === a.id}
                      onClick={async () => {
                        setApprovingId(a.id);
                        try {
                          const res = await fetch(`/api/approval-requests/${a.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "approve" }),
                          });
                          if (!res.ok) throw new Error((await res.json()).error);
                          addToast({ message: "Approval request accepted successfully", type: "success" });
                          refetchApprovals();
                        } catch (e) {
                          addToast({ message: e.message || "Failed to approve request", type: "error" });
                        } finally {
                          setApprovingId(null);
                        }
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {approvingId === a.id ? "Approving…" : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={approvingId === a.id || rejectingId === a.id}
                      onClick={async () => {
                        setRejectingId(a.id);
                        try {
                          const res = await fetch(`/api/approval-requests/${a.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "reject" }),
                          });
                          if (!res.ok) throw new Error((await res.json()).error);
                          addToast({ message: "Request rejected successfully", type: "success" });
                          refetchApprovals();
                        } catch (e) {
                          addToast({ message: e.message || "Failed to reject request", type: "error" });
                        } finally {
                          setRejectingId(null);
                        }
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      {rejectingId === a.id ? "Rejecting…" : "Reject"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      {items.some((n) => !n.is_read) && (
        <Button variant="outline" className="mb-4" onClick={markAllRead}>
          Mark all as read
        </Button>
      )}
      <h2 className="text-lg font-medium mb-4">Notifications</h2>
      <div className="space-y-4">
        {items.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up. New notifications will appear here."
          />
        ) : (
          items.map((n) => (
            <Card key={n.id} className={n.is_read ? "" : "border-primary/30"}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{n.type ?? "Notification"}</CardTitle>
                {!n.is_read && <Badge>New</Badge>}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{format(new Date(n.created_at), "PPp")}</p>
                {!n.is_read && (
                  <Button size="sm" variant="ghost" className="mt-2" onClick={() => markRead(n.id)}>
                    Mark as read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
