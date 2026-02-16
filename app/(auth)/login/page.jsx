"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { prefetchDashboardData } from "@/lib/prefetch";
import { addToast } from "@/lib/toast";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    setError(null);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (authError) throw authError;
      if (authData.user?.user_metadata?.role === "instructor") {
        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;
        if (token) {
          await fetch("/api/instructors/ensure-for-auth", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }
      prefetchDashboardData(queryClient, authData.user);
      addToast({ message: "Welcome back! Redirecting to dashboard...", type: "success", duration: 3000 });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Clean gradient background - Dilatron-style */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20" />
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-400/5 dark:bg-emerald-600/10 blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4">
            Ganesha Academy of Martial Arts
          </p>
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
          <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">Sign in to your account</p>
        </div>

        <Card className="border border-slate-200/80 dark:border-slate-700/60 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg">Welcome back</CardTitle>
              <CardDescription>Enter your credentials to continue</CardDescription>
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
                {errors.email && (
                  <p className="text-red-600 dark:text-red-400 text-xs font-medium">Email is required</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-0 flex h-full w-5 items-center">
                    <Lock className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                  </span>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11"
                    {...register("password", { required: true })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-0 flex h-full w-8 items-center justify-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-slate-200"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 shrink-0" strokeWidth={2.5} /> : <Eye className="h-5 w-5 shrink-0" strokeWidth={2.5} />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-600 dark:text-red-400 text-xs font-medium">Password is required</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 border-0"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
                {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-0">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full h-px bg-gradient-to-r from-transparent via-indigo-300 dark:via-indigo-600 to-transparent" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/90 dark:bg-slate-900/90 px-2 text-slate-500 dark:text-slate-400 font-medium">New instructor?</span>
                </div>
              </div>
              <Link href="/signup" className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-medium"
                >
                  Create an account
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>

        <p className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-6 font-medium">
          <Shield className="h-3.5 w-3.5 text-emerald-600/70 dark:text-emerald-400/70" />
          Secure login • Enterprise-grade encryption
        </p>
      </div>
    </div>
  );
}
