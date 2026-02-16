"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    setError(null);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { role: "instructor" },
        },
      });
      if (signUpError) throw signUpError;
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Sign up failed");
    }
  };

  const sharedLayout = (children) => (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20" />
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-400/5 dark:bg-emerald-600/10 blur-3xl" />
      <div className="w-full max-w-md relative z-10">{children}</div>
    </div>
  );

  const headerBlock = (subtitle) => (
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
      {subtitle && <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">{subtitle}</p>}
    </div>
  );

  if (success) {
    return sharedLayout(
      <>
        {headerBlock()}
        <Card className="border border-slate-200/80 dark:border-slate-700/60 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg text-emerald-700 dark:text-emerald-300">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a confirmation link to your email. Click it to activate your account, then sign in and complete your profile.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-0">
            <Link href="/login" className="w-full">
              <Button
                className="w-full h-11 font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 border-0"
              >
                Go to sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6 font-medium">
          Secure signup • Enterprise-grade encryption
        </p>
      </>
    );
  }

  return sharedLayout(
    <>
      {headerBlock("Register as an instructor")}

      <Card className="border border-slate-200/80 dark:border-slate-700/60 shadow-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Create your account</CardTitle>
            <CardDescription>Enter your details to get started</CardDescription>
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
              <Label htmlFor="email">Email *</Label>
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
              <Label htmlFor="password">Password (min 6 chars) *</Label>
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
                  className="absolute right-1 top-0 flex h-full w-8 items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-transparent hover:text-emerald-600 dark:hover:text-emerald-400"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 shrink-0" strokeWidth={2.5} /> : <Eye className="h-5 w-5 shrink-0" strokeWidth={2.5} />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-red-600 dark:text-red-400 text-xs font-medium">Required, min 6 characters</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 border-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating…" : "Create account"}
              {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-0">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full h-px bg-gradient-to-r from-transparent via-emerald-300 dark:via-emerald-600 to-transparent" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/90 dark:bg-slate-900/90 px-2 text-slate-500 dark:text-slate-400 font-medium">Already have an account?</span>
              </div>
            </div>
            <Link href="/login" className="w-full">
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-medium"
              >
                Sign in
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6 font-medium">
        Secure signup for GAMA instructors
      </p>
    </>
  );
}
