import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllVocab } from "@/lib/curriculum";
import ReviewLoader from "@/components/ReviewLoader";

export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: reviewRows } = await supabase
    .from("word_review")
    .select("vocab_id")
    .eq("user_id", user.id)
    .is("cleared_at", null);

  const allVocab = getAllVocab();
  const vocabById = new Map(allVocab.map((v) => [v.id, v]));
  const words = (reviewRows ?? [])
    .map((row) => vocabById.get(row.vocab_id))
    .filter((v): v is NonNullable<typeof v> => v !== undefined);

  if (words.length === 0) redirect("/learn");

  return <ReviewLoader words={words} allVocab={allVocab} />;
}
