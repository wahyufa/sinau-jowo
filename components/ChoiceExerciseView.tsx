"use client";

import { useState } from "react";
import type { ChoiceExercise } from "@/lib/exercises";
import { playCorrect, playWrong } from "@/lib/sound";
import { useUiLang } from "@/lib/i18n";
import { speak } from "@/lib/speech";

export default function ChoiceExerciseView({
  exercise,
  onCorrect,
  onWrong,
  onNext,
}: {
  exercise: ChoiceExercise;
  onCorrect: () => void;
  onWrong: (vocabId: string) => void;
  onNext: () => void;
}) {
  const { t } = useUiLang();
  const [selected, setSelected] = useState<number | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const promptIsJavanese = exercise.direction === "jv-to-id";
  const optionsAreJavanese = exercise.direction === "id-to-jv";

  function choose(i: number) {
    if (isCorrect === true) return;
    setSelected(i);
    const correct = i === exercise.correctIndex;
    setIsCorrect(correct);
    if (correct) playCorrect();
    else playWrong();
    if (!attempted) {
      setAttempted(true);
      if (correct) onCorrect();
      else onWrong(exercise.vocabId);
    }
  }

  return (
    <div className="exercise">
      <p className="exercise-instruction">
        {t(exercise.direction === "id-to-jv" ? "exerciseInstructionIdToJv" : "exerciseInstructionJvToId")}
      </p>
      <div className="exercise-prompt-row">
        <p className="exercise-prompt">{exercise.prompt}</p>
        {promptIsJavanese && (
          <button
            type="button"
            className="prompt-speak"
            onClick={() => speak(exercise.prompt)}
            aria-label={`Dengarkan ${exercise.prompt}`}
          >
            🔊
          </button>
        )}
      </div>
      <div className="choice-grid">
        {exercise.options.map((opt, i) => {
          let variant = "default";
          if (selected === i) variant = i === exercise.correctIndex ? "correct" : "wrong";
          else if (isCorrect !== null && i === exercise.correctIndex) variant = "correct";

          return (
            <div key={opt} className="choice-row">
              <button
                className={`choice-option choice-${variant}`}
                onClick={() => choose(i)}
                disabled={isCorrect === true}
              >
                {opt}
              </button>
              {optionsAreJavanese && (
                <button
                  type="button"
                  className="choice-speak"
                  onClick={() => speak(opt)}
                  aria-label={`Dengarkan ${opt}`}
                >
                  🔊
                </button>
              )}
            </div>
          );
        })}
      </div>
      {isCorrect !== null && (
        <div className="exercise-footer">
          <p className={isCorrect ? "feedback-correct" : "feedback-wrong"}>
            {isCorrect ? t("feedbackCorrect") : t("feedbackWrong")}
          </p>
          {!isCorrect && exercise.context && (
            <p className="feedback-context">{exercise.context}</p>
          )}
          {isCorrect && (
            <button className="btn btn-primary" onClick={onNext}>
              {t("continueButton")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
