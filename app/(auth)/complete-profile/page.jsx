"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { addToast } from "@/lib/toast";
import { useBeltRanks } from "@/hooks/useBeltRanks";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { UserCircle, LogOut, AlertCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, role, isInstructor, profileComplete, instructor } = useAuth();
  const { data: beltRanks } = useBeltRanks();
  const [loading, setLoading] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    if (user) {
      setValue("email", user.email ?? "");
      if (instructor) {
        setValue("first_name", instructor.first_name ?? "");
        setValue("last_name", instructor.last_name ?? "");
      }
    }
  }, [user, instructor, setValue]);

  useEffect(() => {
    if (authLoading || !role) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isInstructor || profileComplete) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, role, isInstructor, profileComplete, router]);

  const onSubmit = async (data) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) throw new Error("No session");

      const res = await fetch("/api/instructors/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email || user.email,
          phone: data.phone || null,
          belt_level_id: data.belt_level_id ? Number(data.belt_level_id) : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save profile");
      addToast({ message: "Profile completed successfully", type: "success" });
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      addToast({ message: err.message || "Failed to save profile", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLogoutOpen(false);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (authLoading || !user || !role || (!isInstructor || profileComplete)) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-100/90 dark:from-slate-950 dark:via-indigo-950/50 dark:to-slate-900" />
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-indigo-400/30 dark:from-indigo-500/20 dark:to-violet-600/20 blur-3xl" />
        <p className="relative z-10 text-slate-600 dark:text-slate-400 font-medium">Loading...</p>
      </div>
    );
  }

  const hasNoBranch = instructor != null && (instructor.branch_id === undefined || instructor.branch_id === null);

  if (hasNoBranch) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-100/90 dark:from-slate-950 dark:via-indigo-950/50 dark:to-slate-900" />
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-indigo-400/30 dark:from-indigo-500/20 dark:to-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-amber-200/40 to-orange-300/30 dark:from-amber-900/20 dark:to-orange-800/10 blur-3xl" />
        <header className="relative z-10 flex h-14 items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md px-4">
          <div className="flex items-center gap-2">
            <Image src={`/${siteConfig.siteLogo}`} alt={siteConfig.brandName} width={32} height={32} className="object-contain" />
            <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{siteConfig.brandName}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setLogoutOpen(true)} title="Sign out" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <div className="relative z-10 flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 backdrop-blur-sm">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-600 dark:text-amber-400" />
              <h1 className="text-xl font-semibold">Branch assignment pending</h1>
              <p className="text-muted-foreground mt-2">
                Your administrator needs to assign you to a branch before you can access the app. Please contact them to complete your setup.
              </p>
            </div>
            <Button variant="outline" onClick={() => setLogoutOpen(true)} className="w-full">
              Sign out
            </Button>
          </div>
        </div>
        <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign out</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground text-sm">Are you sure you want to sign out?</p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setLogoutOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleSignOut}>Sign out</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-100/90 dark:from-slate-950 dark:via-indigo-950/50 dark:to-slate-900" />
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-indigo-400/30 dark:from-indigo-500/20 dark:to-violet-600/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-amber-200/40 to-orange-300/30 dark:from-amber-900/20 dark:to-orange-800/10 blur-3xl" />
      <header className="relative z-10 flex h-14 items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md px-4">
        <div className="flex items-center gap-2">
          <Image src={`/${siteConfig.siteLogo}`} alt={siteConfig.brandName} width={32} height={32} className="object-contain" />
          <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{siteConfig.brandName}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setLogoutOpen(true)} title="Sign out" aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </header>
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="max-w-xl w-full space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">Complete your profile</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Please provide your details before accessing the app.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-6 shadow-xl shadow-indigo-500/10 ring-1 ring-slate-200/60 dark:ring-slate-700/60">
            <h2 className="text-base font-medium flex items-center gap-2 mb-4">
              <UserCircle className="h-5 w-5" />
              Instructor profile
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First name *</Label>
                  <Input id="first_name" {...register("first_name", { required: true })} placeholder="John" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="last_name">Last name *</Label>
                  <Input id="last_name" {...register("last_name", { required: true })} placeholder="Doe" className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} className="mt-1" placeholder={user.email} />
                <p className="text-xs text-muted-foreground mt-1">Pre-filled from your account</p>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" {...register("phone")} className="mt-1" placeholder="+1 234 567 8900" />
              </div>
              <div>
                <Label htmlFor="belt_level_id">Belt level</Label>
                <select
                  id="belt_level_id"
                  {...register("belt_level_id")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="">Select</option>
                  {(beltRanks ?? []).map((r) => (
                    <option key={r.id} value={r.id}>{r.belt_name ?? r.name ?? r.rank ?? `Belt ${r.id}`}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Complete profile & continue"}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">Are you sure you want to sign out?</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLogoutOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleSignOut}>Sign out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
