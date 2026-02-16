import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const protectedPaths = [
    "/",
    "/dashboard",
    "/students",
    "/attendance",
    "/fees",
    "/instructors",
    "/announcements",
    "/notifications",
    "/complete-profile",
    "/inventory",
    "/orders",
    "/shop",
    "/branches",
    "/profile",
  ];
  const isProtected = protectedPaths.some(
    (p) => pathname === p || (p !== "/" && pathname.startsWith(p + "/"))
  );

  const authPaths = ["/login", "/signup", "/forgot-password", "/reset-password"];
  const redirectToDashboardPaths = ["/login", "/signup", "/forgot-password"];
  const isAuthPage = authPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const shouldRedirectAuthToDashboard = redirectToDashboardPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect logged-in users away from login/signup/forgot-password (but NOT /reset-password - they need to set new password)
  if (user && shouldRedirectAuthToDashboard) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
