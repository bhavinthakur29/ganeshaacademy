"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { addToast } from "@/lib/toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const password = watch("password");

  useEffect(() => {
    const hashParams = typeof window !== "undefined" && window.location.hash
      ? new URLSearchParams(window.location.hash.slice(1))
      : null;
    const hasRecoveryHash = hashParams?.get("type") === "recovery";

    const checkRecovery = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session || hasRecoveryHash) {
        setRecoveryReady(true);
      }
      setChecking(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setRecoveryReady(true);
    });

    checkRecovery();
    return () => subscription?.unsubscribe();
  }, []);

  const onSubmit = async (data) => {
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: data.password });
      if (updateError) throw updateError;
      addToast({ message: "Password updated successfully. Sign in with your new password.", type: "success" });
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to update password");
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20" />
        <div className="relative z-10 h-8 w-32 rounded-md bg-white/80 dark:bg-slate-800/80 animate-pulse backdrop-blur-sm" />
      </div>
    );
  }

  if (!recoveryReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20" />
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl" />
        <div className="w-full max-w-md relative z-10">
          <Card className="border border-slate-200/80 dark:border-slate-700/60 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg">Invalid or expired link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired. Request a new one from the forgot password page.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/forgot-password" className="w-full">
                <Button className="w-full">Request new link</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20" />
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-400/5 dark:bg-emerald-600/10 blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="relative w-[200px] h-[140px] mx-auto mb-2 drop-shadow-lg">
            <Image
              src={`/${siteConfig.siteLogo}`}
              alt="GAMA Management System"
              fill
              priority
              className="object-contain"
              sizes="200px"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {siteConfig.brandName}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1.5 font-medium">Set your new password</p>
        </div>

        <Card className="border border-slate-200/80 dark:border-slate-700/60 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg">New password</CardTitle>
              <CardDescription>
                Enter a strong password. Min 6 characters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-lg border-2 border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-950/90 px-3 py-2.5 text-sm font-medium text-red-800 dark:text-red-100"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-300" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-0 flex h-full w-5 items-center">
                    <Lock className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                  </span>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11"
                    {...register("password", { required: true, minLength: 6 })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-0 flex h-full w-8 items-center justify-center text-emerald-600 dark:text-emerald-400"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 shrink-0" strokeWidth={2.5} /> : <Eye className="h-5 w-5 shrink-0" strokeWidth={2.5} />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-600 dark:text-red-400 text-xs font-medium">
                    Required, min 6 characters
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-0 flex h-full w-5 items-center">
                    <Lock className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                  </span>
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11"
                    {...register("confirm", {
                      required: true,
                      validate: (v) => v === password || "Passwords do not match",
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-0 flex h-full w-8 items-center justify-center text-emerald-600 dark:text-emerald-400"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Hide" : "Show"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirm && (
                  <p className="text-red-600 dark:text-red-400 text-xs font-medium">
                    {errors.confirm.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 border-0"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating…" : "Update password"}
                {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardContent>
          </form>
        </Card>

        <p className="text-center mt-6">
          <Link href="/login" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
