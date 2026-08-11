"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { VocabItem } from "@/lib/curriculum";
import { buildReviewExercises } from "@/lib/exercises";
import { clearMistake, recordMistake } from "@/lib/actions";
import { playComplete } from "@/lib/sound";
import { useUiLang } from "@/lib/i18n";
import ChoiceExerciseView from "@/components/ChoiceExerciseView";

type Phase = "playing" | "summary";

export default function ReviewRunner({
  words,
  allVocab,
}: {
  words: VocabItem[];
  allVocab: VocabItem[];
}) {
  const router = useRouter();
  const { t, lang } = useUiLang();
  // Lazy useState initializer, not useMemo -- see note in LessonRunner.tsx:
  // buildReviewExercises uses Math.random, and useMemo doesn't guarantee its
  // factory runs only once.
  const [exercises] = useState(() => buildReviewExercises(words, allVocab));

  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");

  const exitToMap = () => router.push("/learn");

  function goNext() {
    if (index + 1 >= exercises.length) {
      setPhase("summary");
      playComplete();
    } else {
      setIndex((i) => i + 1);
    }
  }

  function handleWrong(vocabId: string) {
    const unitId = vocabId.split("-l")[0];
    void recordMistake(vocabId, unitId);
  }

  function handleCorrect(vocabId: string) {
    setCorrectCount((c) => c + 1);
    void clearMistake(vocabId);
  }

  if (exercises.length === 0) {
    return null;
  }

  if (phase === "summary") {
    return (
      <div className="lesson-end">
        <p className="lesson-end-emoji">🎉</p>
        <h2>{lang === "id" ? "Latihan Selesai!" : "Bolan-baleni Rampung!"}</h2>
        <div className="lesson-end-stats">
          <div className="lesson-end-stat">
            <span className="lesson-end-stat-value">
              {correctCount}/{exercises.length}
            </span>
            <span className="lesson-end-stat-label">{t("scoreLabel")}</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={exitToMap}>
          {t("summaryContinueButton")}
        </button>
      </div>
    );
  }

  const current = exercises[index];

  return (
    <div className="lesson-page">
      <div className="lesson-header">
        <button className="lesson-exit" onClick={exitToMap} aria-label="Keluar">
          ✕
        </button>
        <div className="lesson-progress-track">
          <div
            className="lesson-progress-fill"
            style={{ width: `${(index / exercises.length) * 100}%` }}
          />
        </div>
        <span className="lesson-unit-title">
          {lang === "id" ? "Latihan Ulang" : "Bolan-baleni"}
        </span>
      </div>
      <ChoiceExerciseView
        key={index}
        exercise={current}
        onCorrect={() => handleCorrect(current.vocabId)}
        onWrong={handleWrong}
        onNext={goNext}
      />
    </div>
  );
}
