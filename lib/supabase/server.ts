import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      url.trim() !== "" &&
      url !== "https://placeholder-project.supabase.co" &&
      !url.includes("your-project") &&
      key &&
      key.trim() !== "" &&
      key !== "placeholder-anon-key" &&
      !key.includes("your-supabase-anon-key")
  );
}

export function isAdminClientConfigured(): boolean {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    isSupabaseConfigured() &&
      serviceKey &&
      serviceKey.trim() !== "" &&
      serviceKey !== "placeholder-service-role-key" &&
      !serviceKey.includes("your-supabase-service-role-key")
  );
}

/**
 * Server-side Supabase client using the service role key.
 * IMPORTANT: This must ONLY be used in server-side code (API routes, server actions).
 * NEVER expose this in browser/client code.
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Server-side Supabase client with user context and cookies.
 * Used in Server Actions and Route Handlers with authenticated user session.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Can be ignored if called from a Server Component
        }
      },
    },
  });
}
