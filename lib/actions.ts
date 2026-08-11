"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type AuthState = { error?: string } | undefined;

export async function login(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email atau password salah." };
  }

  redirect("/learn");
}

export async function signup(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }
  if (password.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/learn");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function completeLesson(
  lessonId: string,
  score: number,
  xpEarned: number,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const today = new Date().toISOString().slice(0, 10);

  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, streak_count, last_lesson_date")
    .eq("id", user.id)
    .single();

  let streak = profile?.streak_count ?? 0;
  const lastDate = profile?.last_lesson_date as string | null;

  if (!lastDate) {
    streak = 1;
  } else if (lastDate !== today) {
    const msPerDay = 86_400_000;
    const daysSince = Math.round(
      (new Date(today).getTime() - new Date(lastDate).getTime()) / msPerDay,
    );
    // Grace day: skipping exactly one day doesn't break the streak.
    streak = daysSince <= 2 ? streak + 1 : 1;
  }

  await supabase
    .from("profiles")
    .update({
      xp: (profile?.xp ?? 0) + xpEarned,
      streak_count: streak,
      last_lesson_date: today,
    })
    .eq("id", user.id);

  await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      score,
      xp_earned: xpEarned,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );

  revalidatePath("/learn");
}

export async function recordMistake(vocabId: string, unitId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: existing } = await supabase
    .from("word_review")
    .select("wrong_count")
    .eq("user_id", user.id)
    .eq("vocab_id", vocabId)
    .maybeSingle();

  await supabase.from("word_review").upsert(
    {
      user_id: user.id,
      vocab_id: vocabId,
      unit_id: unitId,
      wrong_count: (existing?.wrong_count ?? 0) + 1,
      cleared_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,vocab_id" },
  );

  revalidatePath("/learn");
}

export async function clearMistake(vocabId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("word_review")
    .update({ cleared_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("vocab_id", vocabId);

  revalidatePath("/learn");
  revalidatePath("/review");
}
