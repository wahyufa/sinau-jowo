import type { Lesson, VocabItem } from "@/lib/curriculum";

export type ChoiceExercise = {
  type: "choice";
  direction: "id-to-jv" | "jv-to-id";
  prompt: string;
  options: string[];
  correctIndex: number;
  vocabId: string;
};

export type MatchExercise = {
  type: "match";
  pairs: { id: string; indonesian: string; krama: string }[];
};

export type ListenExercise = {
  type: "listen";
  audioText: string;
  options: string[];
  correctIndex: number;
  vocabId: string;
};

export type Exercise = ChoiceExercise | MatchExercise | ListenExercise;

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
    vocabId: target.id,
  };
}

function buildListenExercise(target: VocabItem, pool: VocabItem[]): ListenExercise {
  const distractors = shuffle(pool.filter((v) => v.id !== target.id)).slice(0, 3);
  const optionValues = shuffle([target.indonesian, ...distractors.map((d) => d.indonesian)]);

  return {
    type: "listen",
    audioText: target.krama,
    options: optionValues,
    correctIndex: optionValues.indexOf(target.indonesian),
    vocabId: target.id,
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

  const listenExercises = shuffle(pool).map((item) => buildListenExercise(item, pool));

  return [matchExercise, ...shuffle([...choiceExercises, ...listenExercises])];
}

/** Choice-only exercise set for review mode, drawn from a user's mistake queue. */
export function buildReviewExercises(
  words: VocabItem[],
  distractorPool: VocabItem[],
): ChoiceExercise[] {
  const pool = distractorPool.length >= 4 ? distractorPool : words;
  return shuffle(words).map((item, i) =>
    buildChoiceExercise(item, pool, i % 2 === 0 ? "id-to-jv" : "jv-to-id"),
  );
}
