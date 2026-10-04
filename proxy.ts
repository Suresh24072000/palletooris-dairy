import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_ROLES = [
  "admin",
  "super_admin",
  "farm_manager",
  "operations",
  "delivery_manager",
  "inventory_manager",
  "support",
];

// Routes that require authentication (any logged-in user)
const PROTECTED_CUSTOMER_ROUTES = ["/profile", "/orders", "/subscriptions", "/checkout"];

// Routes that require admin role
const PROTECTED_ADMIN_ROUTES = ["/admin"];

// Admin login page (public)
const ADMIN_LOGIN_PATH = "/admin/login";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute =
    PROTECTED_ADMIN_ROUTES.some((r) => pathname.startsWith(r)) &&
    pathname !== ADMIN_LOGIN_PATH;

  const isCustomerRoute = PROTECTED_CUSTOMER_ROUTES.some((r) =>
    pathname.startsWith(r)
  );

  // Only run auth checks on protected routes
  if (!isAdminRoute && !isCustomerRoute) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // If Supabase is not configured, allow access in development but warn
  if (!supabaseUrl || !supabaseServiceKey) {
    // In development without Supabase, only block admin routes
    if (isAdminRoute) {
      // Check for dev admin session cookie
      const devAdminSession = request.cookies.get("dev_admin_session");
      if (!devAdminSession || devAdminSession.value !== "authenticated") {
        return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
      }
    }
    return NextResponse.next();
  }

  // Extract access token from Authorization header or cookies
  const accessToken =
    request.cookies.get("sb-access-token")?.value ||
    request.cookies.get(`sb-${supabaseUrl.split("//")[1]?.split(".")[0]}-auth-token`)?.value ||
    extractTokenFromCookies(request);

  if (!accessToken) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
    }
    if (isCustomerRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      if (isAdminRoute) {
        return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
      }
      if (isCustomerRoute) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    // Check role for admin routes
    if (isAdminRoute) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = profile?.role;
      if (!role || !ADMIN_ROLES.includes(role)) {
        // Authenticated but not an admin — redirect to home
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
    }
    return NextResponse.next();
  }
}

function extractTokenFromCookies(request: NextRequest): string | null {
  // Supabase stores auth in cookies named like: sb-<project-ref>-auth-token
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookie.value));
        return parsed?.access_token || parsed?.[0] || null;
      } catch {
        return cookie.value || null;
      }
    }
  }
  return null;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/subscriptions/:path*",
    "/checkout/:path*",
  ],
};
