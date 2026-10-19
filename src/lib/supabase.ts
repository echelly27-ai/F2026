import { parseBoard } from "@/lib/board";
import type { BoardState } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

let client: SupabaseClient | null | undefined;
let clientPromise: Promise<SupabaseClient | null> | null = null;

export function getSupabase() {
  if (client !== undefined) return Promise.resolve(client);
  if (!isSupabaseConfigured()) {
    client = null;
    return Promise.resolve(null);
  }
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
      client = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return client;
    });
  }
  return clientPromise;
}

export async function pullBoard(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("athlete_boards")
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return {
      board: null as BoardState | null,
      warning:
        "Signed in, but athlete_boards is not available yet. Your board stays on this device until the SQL in supabase/schema.sql is applied.",
    };
  }

  if (!data?.state) return { board: null as BoardState | null, warning: null };
  const board = parseBoard(data.state);
  if (!board) {
    return {
      board: null,
      warning: "The cloud board could not be read. Using the copy on this device.",
    };
  }
  return { board, warning: null };
}

export async function pushBoard(supabase: SupabaseClient, userId: string, board: BoardState) {
  const { error } = await supabase.from("athlete_boards").upsert({
    user_id: userId,
    state: board,
    updated_at: new Date().toISOString(),
  });
  return error ? error.message : null;
}
