"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { useForm } from "react-hook-form";
import { Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

function getRedirectUrl() {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/reset-password`;
}

export default function ForgotPasswordPage() {
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: getRedirectUrl(),
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    }
  };

  if (sent) {
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
              GAMA Management System
            </h1>
          </div>

          <Card className="border border-slate-200/80 dark:border-slate-700/60 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
            <CardHeader className="space-y-1 pb-4">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg text-center">Check your email</CardTitle>
              <CardDescription className="text-center">
                We&apos;ve sent a password reset link. Click it to set a new password. The link expires in 1 hour.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-0">
              <Link href="/login" className="w-full">
                <Button
                  className="w-full h-11 font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 border-0"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Button>
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
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4">Trusted by academies nationwide</p>
          <div className="relative w-[180px] h-[126px] mx-auto mb-4 drop-shadow-lg">
            <Image
              src={`/${siteConfig.siteLogo}`}
              alt="GAMA Management System"
              fill
              priority
              className="object-contain"
              sizes="180px"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            GAMA Management System
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">Reset your password</p>
        </div>

        <Card className="border border-slate-200/80 dark:border-slate-700/60 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg">Forgot password?</CardTitle>
              <CardDescription>
                Enter your email and we&apos;ll send you a link to reset your password.
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
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-0 flex h-full w-5 items-center">
                    <Mail className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 h-11"
                    {...register("email", { required: true })}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 border-0"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending…" : "Send reset link"}
                {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardContent>
            <CardFooter className="pt-0">
              <Link href="/login" className="w-full">
                <Button type="button" variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>

        <p className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-6 font-medium">
          <Shield className="h-3.5 w-3.5 text-emerald-600/70 dark:text-emerald-400/70" />
          Secure • Enterprise-grade encryption
        </p>
      </div>
    </div>
  );
}
