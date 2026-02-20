import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/integrations/supabase/types";
import { createMockSupabaseClient } from "@/lib/supabase/mockClient";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return createMockSupabaseClient();
  }

  const cookieHeader = cookies().getAll().map((c) => `${c.name}=${c.value}`).join("; ");

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Cookie: cookieHeader,
      },
    },
  });
}
