import type { Lesson, VocabItem } from "@/lib/curriculum";

export type ChoiceExercise = {
  type: "choice";
  direction: "id-to-jv" | "jv-to-id";
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type MatchExercise = {
  type: "match";
  pairs: { id: string; indonesian: string; krama: string }[];
};

export type Exercise = ChoiceExercise | MatchExercise;

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildChoiceExercise(
  target: VocabItem,
  pool: VocabItem[],
  direction: ChoiceExercise["direction"],
): ChoiceExercise {
  const distractors = shuffle(pool.filter((v) => v.id !== target.id)).slice(0, 3);
  const correctAnswer = direction === "id-to-jv" ? target.krama : target.indonesian;
  const optionValues = shuffle([
    correctAnswer,
    ...distractors.map((d) => (direction === "id-to-jv" ? d.krama : d.indonesian)),
  ]);

  return {
    type: "choice",
    direction,
    prompt: direction === "id-to-jv" ? target.indonesian : target.krama,
    options: optionValues,
    correctIndex: optionValues.indexOf(correctAnswer),
  };
}

export function buildExerciseSet(lesson: Lesson): Exercise[] {
  const pool = lesson.vocab;
  const shuffledPool = shuffle(pool);

  const matchPairs = shuffledPool.slice(0, Math.min(4, pool.length));
  const matchExercise: MatchExercise = {
    type: "match",
    pairs: matchPairs.map((v) => ({
      id: v.id,
      indonesian: v.indonesian,
      krama: v.krama,
    })),
  };

  const choiceExercises = shuffledPool.map((item, i) =>
    buildChoiceExercise(item, pool, i % 2 === 0 ? "id-to-jv" : "jv-to-id"),
  );

  return [matchExercise, ...choiceExercises];
}
