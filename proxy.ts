import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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
const PROTECTED_CUSTOMER_ROUTES = [
  "/profile",
  "/orders",
  "/subscriptions",
  "/checkout",
];

// Routes that require admin role
const PROTECTED_ADMIN_ROUTES = ["/admin"];

// Admin login page (public)
const ADMIN_LOGIN_PATH = "/admin/login";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const isAdminRoute =
    PROTECTED_ADMIN_ROUTES.some((r) => pathname.startsWith(r)) &&
    pathname !== ADMIN_LOGIN_PATH;

  const isCustomerRoute = PROTECTED_CUSTOMER_ROUTES.some((r) =>
    pathname.startsWith(r)
  );

  // Only run auth checks on protected routes
  if (!isAdminRoute && !isCustomerRoute) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isConfigured = Boolean(
    supabaseUrl &&
      supabaseUrl.trim() !== "" &&
      supabaseUrl !== "https://placeholder-project.supabase.co" &&
      !supabaseUrl.includes("your-project") &&
      supabaseAnonKey &&
      supabaseAnonKey.trim() !== "" &&
      supabaseAnonKey !== "placeholder-anon-key" &&
      !supabaseAnonKey.includes("your-supabase-anon-key")
  );

  const isDevBypassAllowed =
    process.env.NODE_ENV !== "production" &&
    (process.env.ALLOW_DEV_ADMIN_BYPASS === "true" ||
      process.env.NEXT_PUBLIC_ALLOW_DEV_ADMIN_BYPASS === "true");

  // If Supabase is not configured:
  if (!isConfigured) {
    if (isAdminRoute) {
      if (!isDevBypassAllowed) {
        // In production or when dev bypass is disabled, NEVER grant access
        return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
      }
      const devAdminSession = request.cookies.get("dev_admin_session");
      if (!devAdminSession || devAdminSession.value !== "authenticated") {
        return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
      }
    }
    if (isCustomerRoute) {
      if (!isDevBypassAllowed) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
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

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      if (isAdminRoute) {
        return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
      }
      if (isCustomerRoute) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
      return response;
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
        // Authenticated customer/user but not an authorized admin
        const deniedUrl = new URL(ADMIN_LOGIN_PATH, request.url);
        deniedUrl.searchParams.set("error", "access_denied");
        return NextResponse.redirect(deniedUrl);
      }
    }

    return response;
  } catch (err) {
    console.error("Auth proxy error:", err);
    if (isAdminRoute) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
    }
    return response;
  }
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
