import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Static assets or api bypass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return response;
  }

  const isAuthRoute =
    pathname === "/tutor/login" ||
    pathname === "/tutor/register" ||
    pathname === "/student/login" ||
    pathname === "/student/register" ||
    pathname === "/forgot-password";

  const isTutorRoute = pathname === "/t" || pathname.startsWith("/t/");
  const isStudentRoute = pathname === "/s" || pathname.startsWith("/s/");
  const isResetPasswordRoute = pathname === "/reset-password";

  if (user) {
    // Update profiles.last_seen_at at most once every 10 minutes per user
    const lastSeenCookie = request.cookies.get("classy_last_seen")?.value;
    const now = Date.now();
    if (!lastSeenCookie || now - Number(lastSeenCookie) > 10 * 60 * 1000) {
      response.cookies.set("classy_last_seen", now.toString(), {
        maxAge: 600,
        path: "/",
        sameSite: "lax",
        httpOnly: true,
      });
      // Fire-and-forget update to profiles table
      Promise.resolve(
        supabase
          .from("profiles")
          .update({ last_seen_at: new Date(now).toISOString() })
          .eq("id", user.id)
      ).catch(() => {});
    }

    // Read profile to verify role and must_change_password
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, must_change_password")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role || (user.user_metadata?.role as "tutor" | "student" | undefined);
    const mustChangePassword = profile?.must_change_password ?? false;

    // If forced password change is pending and not already on /reset-password
    if (mustChangePassword && !isResetPasswordRoute) {
      const resetUrl = new URL("/reset-password", request.url);
      return NextResponse.redirect(resetUrl);
    }

    // Logged in user visiting auth pages or landing page -> redirect to dashboard
    if (isAuthRoute || pathname === "/") {
      const homePath = role === "tutor" ? "/t" : "/s";
      return NextResponse.redirect(new URL(homePath, request.url));
    }

    // Tutor route guard
    if (isTutorRoute && role !== "tutor") {
      return NextResponse.redirect(new URL("/s", request.url));
    }

    // Student route guard
    if (isStudentRoute && role !== "student") {
      return NextResponse.redirect(new URL("/t", request.url));
    }
  } else {
    // Unauthenticated user trying to access protected routes
    if (isTutorRoute) {
      const loginUrl = new URL("/tutor/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isStudentRoute) {
      const loginUrl = new URL("/student/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isResetPasswordRoute) {
      return NextResponse.redirect(new URL("/forgot-password", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
