import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";

export type SupabaseWithSession = { supabase: SupabaseClient; session: Session };

/**
 * Returns a Supabase client and session for the current request.
 * Tries cookie-based session first (Next.js web), then Authorization: Bearer (Expo/mobile).
 * Use in API routes and pass the client to lib/companies and lib/scan.
 */
export async function getSupabaseAndSession(
  request?: Request
): Promise<SupabaseWithSession | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  // 1) Cookie-based session (Next.js)
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const supabaseCookie = createServerClient(url, anonKey, {
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
          // Ignore when cookies cannot be set (e.g. in some edge contexts)
        }
      },
    },
  });
  const {
    data: { session },
  } = await supabaseCookie.auth.getSession();
  if (session) return { supabase: supabaseCookie, session };

  // 2) Bearer token (Expo / mobile)
  if (request) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
    if (token) {
      const supabaseBearer = createSupabaseClient(url, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false },
      });
      const {
        data: { session: sessionBearer },
        error,
      } = await supabaseBearer.auth.getSession();
      if (!error && sessionBearer) return { supabase: supabaseBearer, session: sessionBearer };
    }
  }
  return null;
}
