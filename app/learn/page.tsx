import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFlatLessons } from "@/lib/curriculum";
import { signOutAction } from "@/lib/actions";
import LearnGreeting from "@/components/LearnGreeting";
import ReviewEntry from "@/components/ReviewEntry";

export default async function LearnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: progress }, { data: reviewWords }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, xp, streak_count")
      .eq("id", user.id)
      .single(),
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id),
    supabase
      .from("word_review")
      .select("id")
      .eq("user_id", user.id)
      .is("cleared_at", null),
  ]);

  const completed = new Set((progress ?? []).map((p) => p.lesson_id));
  const flatLessons = getFlatLessons();
  const reviewCount = reviewWords?.length ?? 0;

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

      <ReviewEntry count={reviewCount} />

      <ol className="unit-path">
        {flatLessons.map(({ unit, lesson, isFirstInUnit }, index) => {
          const isCompleted = completed.has(lesson.id);
          const isUnlocked = index === 0 || completed.has(flatLessons[index - 1].lesson.id);

          return (
            <li key={lesson.id}>
              {isFirstInUnit && (
                <div className="unit-group-header">
                  <span className="unit-icon">{unit.icon}</span>
                  <div>
                    <span className="unit-title">{unit.title}</span>
                    <span className="unit-desc">{unit.description}</span>
                  </div>
                </div>
              )}
              {isUnlocked ? (
                <Link
                  href={`/lesson/${lesson.id}`}
                  className={`lesson-node ${isCompleted ? "unit-node-done" : "unit-node-active"}`}
                >
                  <span className="lesson-node-title">{lesson.title}</span>
                  {isCompleted && <span className="unit-check">✓</span>}
                </Link>
              ) : (
                <div className="lesson-node unit-node-locked">
                  <span className="lesson-node-title">🔒 {lesson.title}</span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
