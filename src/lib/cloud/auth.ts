// ── Supabase Auth + Cloud Save ─────────────────────────────────────

import { createClient, type User } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// ── Auth Functions ────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  if (!supabase) return { user: null, error: "Cloud services not configured." };

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { user: null, error: error.message };
  return { user: data.user, error: null };
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  if (!supabase) return { user: null, error: "Cloud services not configured." };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { user: null, error: error.message };
  return { user: data.user, error: null };
}

export async function signOut(): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Cloud services not configured." };

  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}

export async function getUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!supabase) return () => {};

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => data.subscription.unsubscribe();
}

// ── Cloud Save Functions ──────────────────────────────────────────

/**
 * Save game data to the cloud.
 * `saveData` should be the serialized JSON string from serializeState().
 */
export async function cloudSave(
  saveData: string,
  totalPlaytimeSec: number,
  prestigeCount: number
): Promise<{ success: boolean; error: string | null }> {
  if (!supabase) return { success: false, error: "Cloud services not configured." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  const { error } = await supabase
    .from("cloud_saves")
    .upsert(
      {
        user_id: user.id,
        save_data: saveData,
        save_version: 1,
        total_playtime_sec: totalPlaytimeSec,
        prestige_count: prestigeCount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) return { success: false, error: error.message };
  return { success: true, error: null };
}

/**
 * Load game data from the cloud.
 * Returns the raw serialized JSON string, or null if no save exists.
 */
export async function cloudLoad(): Promise<{ saveData: string | null; error: string | null }> {
  if (!supabase) return { saveData: null, error: "Cloud services not configured." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { saveData: null, error: "Not signed in." };

  const { data, error } = await supabase
    .from("cloud_saves")
    .select("save_data")
    .eq("user_id", user.id)
    .single();

  if (error) {
    // No save found is not an error
    if (error.code === "PGRST116") return { saveData: null, error: null };
    return { saveData: null, error: error.message };
  }

  return { saveData: data?.save_data ?? null, error: null };
}

/**
 * Delete cloud save.
 */
export async function cloudDelete(): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Cloud services not configured." };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("cloud_saves")
    .delete()
    .eq("user_id", user.id);

  return { error: error?.message ?? null };
}

export function isCloudAvailable(): boolean {
  return !!supabase;
}
