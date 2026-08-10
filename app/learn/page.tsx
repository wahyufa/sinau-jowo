import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CURRICULUM } from "@/lib/curriculum";
import { signOutAction } from "@/lib/actions";
import LearnGreeting from "@/components/LearnGreeting";

export default async function LearnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: progress }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, xp, streak_count")
      .eq("id", user.id)
      .single(),
    supabase.from("lesson_progress").select("unit_id").eq("user_id", user.id),
  ]);

  const completed = new Set((progress ?? []).map((p) => p.unit_id));

  return (
    <main className="learn-page">
      <header className="learn-header">
        <div>
          <LearnGreeting username={profile?.username ?? "kanca"} />
        </div>
        <div className="learn-stats">
          <span className="stat stat-streak">🔥 {profile?.streak_count ?? 0}</span>
          <span className="stat stat-xp">⭐ {profile?.xp ?? 0} XP</span>
          <form action={signOutAction}>
            <button type="submit" className="btn btn-ghost btn-small">
              Keluar
            </button>
          </form>
        </div>
      </header>

      <ol className="unit-path">
        {CURRICULUM.map((unit, index) => {
          const isCompleted = completed.has(unit.id);
          const isUnlocked =
            index === 0 || completed.has(CURRICULUM[index - 1].id);

          return (
            <li key={unit.id} className="unit-node-wrap">
              {isUnlocked ? (
                <Link
                  href={`/lesson/${unit.id}`}
                  className={`unit-node ${isCompleted ? "unit-node-done" : "unit-node-active"}`}
                >
                  <span className="unit-icon">{unit.icon}</span>
                  <span className="unit-title">{unit.title}</span>
                  <span className="unit-desc">{unit.description}</span>
                  {isCompleted && <span className="unit-check">✓</span>}
                </Link>
              ) : (
                <div className="unit-node unit-node-locked">
                  <span className="unit-icon">🔒</span>
                  <span className="unit-title">{unit.title}</span>
                  <span className="unit-desc">{unit.description}</span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
