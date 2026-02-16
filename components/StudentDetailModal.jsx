"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getStudentFullName } from "@/lib/schema";
import { format } from "date-fns";
import { Mail, Phone, Building2, User, Users } from "lucide-react";

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value ?? "-"}</p>
      </div>
    </div>
  );
}

export function StudentDetailModal({ open, onOpenChange, student, branches = [], onEdit }) {
  if (!student) return null;
  const branch = branches?.find((b) => b.id === student.branch_id || b.id === Number(student.branch_id));
  const branchDisplay = branch?.name ?? branch?.branch_name ?? student.branch_id ?? "-";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[min(calc(100%-2rem),42rem)] max-h-[min(90dvh,calc(100vh-2rem))] p-0 gap-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {getStudentFullName(student)}
            <Badge variant={student.is_active ? "success" : "destructive"}>
              {student.is_active ? "Active" : "Inactive"}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[min(60dvh,calc(100vh-200px))]">
          <div className="px-4 sm:px-6 py-4 space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-0">
                <DetailRow icon={Mail} label="Email" value={student.email_address} />
                <DetailRow icon={Phone} label="Contact" value={student.contact_number} />
                <DetailRow icon={Building2} label="Branch" value={branchDisplay} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-0">
                <DetailRow label="Date of Birth" value={student.date_of_birth ? format(new Date(student.date_of_birth), "PP") : null} />
                <DetailRow label="Age" value={student.age} />
                <DetailRow label="Gender" value={student.gender} />
                <DetailRow label="Belt" value={student.belt_id} />
                <DetailRow label="Father Name" value={student.father_name} />
                <DetailRow label="Mother Name" value={student.mother_name} />
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
        <DialogFooter className="px-4 sm:px-6 py-4 border-t border-border gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              onEdit?.(student);
              onOpenChange(false);
            }}
          >
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
