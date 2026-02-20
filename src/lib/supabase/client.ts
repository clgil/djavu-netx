import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createMockSupabaseClient } from "@/lib/supabase/mockClient";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const useSupabase = Boolean(supabaseUrl && supabaseAnonKey);

export function createClient() {
  if (!useSupabase) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[DB] Supabase env vars not found. Running in mock DB mode (compatible with MySQL migration stage).");
    }
    return createMockSupabaseClient();
  }

  return createSupabaseClient<Database>(supabaseUrl as string, supabaseAnonKey as string, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
