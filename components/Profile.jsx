"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useBranches } from "@/hooks/useBranches";
import { useAuth } from "@/hooks/useAuth";
import { useInstructor } from "@/hooks/useInstructor";
import { useBeltRanks } from "@/hooks/useBeltRanks";
import { InstructorProfileEditDialog } from "@/components/InstructorProfileEditDialog";
import { User, Mail, Calendar, Shield, MapPin, Pencil, Phone, Award } from "lucide-react";
import { cn } from "@/lib/utils";

function getInitials(name, email) {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  if (email) return String(email[0]).toUpperCase();
  return "?";
}

export function Profile() {
  const [user, setUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { data: branches } = useBranches();
  const { data: beltRanks } = useBeltRanks();
  const { isInstructor } = useAuth();
  const { data: instructor, isLoading: instructorLoading, refetch: refetchInstructor } = useInstructor(user?.id, {
    enabled: !!user?.id && isInstructor,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));
  }, []);

  if (!user)
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <div className="max-w-md space-y-4">
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );

  const displayName = (isInstructor && instructor)
    ? [instructor.first_name, instructor.last_name].filter(Boolean).join(" ") || user.email?.split("@")[0]
    : user.email?.split("@")[0] ?? "User";
  const role = user.user_metadata?.role ?? "member";
  const branchId = user.user_metadata?.branch_id;
  const branch = branches?.find((b) => b.id === branchId || b.id === String(branchId));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="flex flex-col sm:flex-row gap-6">
        <Card className="sm:w-72 shrink-0">
          <CardHeader>
            <div className="flex flex-col items-center gap-3">
              <div
                className={cn(
                  "flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold",
                  "bg-primary/15 text-primary ring-2 ring-primary/30"
                )}
              >
                {getInitials(displayName, user.email)}
              </div>
              <div className="text-center">
                <p className="font-semibold">{displayName}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-1">
                <Badge variant={role === "admin" ? "default" : "secondary"}>
                  <Shield className="h-3 w-3 mr-1" />
                  {role}
                </Badge>
                {branch && (
                  <Badge variant="outline">
                    <MapPin className="h-3 w-3 mr-1" />
                    {branch.name ?? branch.branch_name ?? branchId}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Account info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p>{user.created_at ? format(new Date(user.created_at), "PPP") : "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground">Last sign in</p>
                  <p>{user.last_sign_in_at ? format(new Date(user.last_sign_in_at), "PPp") : "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground">User ID</p>
                  <p className="font-mono text-xs break-all">{user.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {isInstructor && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Instructor profile
                </CardTitle>
                {instructor && (
                  <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {instructorLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : instructor ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 text-sm">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-muted-foreground">Name</p>
                        <p>{[instructor.first_name, instructor.last_name].filter(Boolean).join(" ") || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p>{instructor.email ?? instructor.email_address ?? user?.email ?? "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p>{instructor.phone ?? instructor.contact_number ?? "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-muted-foreground">Branch</p>
                        <p>{branches?.find((b) => b.id === instructor.branch_id || String(b.id) === String(instructor.branch_id))?.name ?? "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Award className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-muted-foreground">Belt level</p>
                        <p>
                          {beltRanks?.find((r) => r.id === instructor.belt_level_id || String(r.id) === String(instructor.belt_level_id))?.belt_name ??
                            beltRanks?.find((r) => r.id === instructor.belt_level_id || String(r.id) === String(instructor.belt_level_id))?.name ??
                            instructor.belt_level ??
                            "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant={instructor.is_active ? "default" : "secondary"}>
                        {instructor.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {(instructor.created_at || instructor.updated_at) && (
                      <div className="flex items-center gap-3 text-sm sm:col-span-2">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-muted-foreground">Last updated</p>
                          <p>{instructor.updated_at ? format(new Date(instructor.updated_at), "PPP") : instructor.created_at ? format(new Date(instructor.created_at), "PPP") : "—"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No instructor record found.</p>
                )}
              </CardContent>
            </Card>
          )}

          {isInstructor && instructor && (
            <InstructorProfileEditDialog
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              instructor={instructor}
              branchName={branches?.find((b) => b.id === instructor.branch_id || String(b.id) === String(instructor.branch_id))?.name}
              onSuccess={refetchInstructor}
            />
          )}
        </div>
      </div>
    </div>
  );
}
