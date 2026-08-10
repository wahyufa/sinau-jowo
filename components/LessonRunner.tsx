"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Unit } from "@/lib/curriculum";
import {
  buildExerciseSet,
  shuffle,
  type ChoiceExercise,
  type MatchExercise,
} from "@/lib/exercises";
import { completeLesson } from "@/lib/actions";
import { playCorrect, playWrong, playComplete, playFail } from "@/lib/sound";
import { useUiLang } from "@/lib/i18n";
import { speak } from "@/lib/speech";

const START_HEARTS = 5;
type Phase = "study" | "playing" | "summary" | "failed";

export default function LessonRunner({ unit }: { unit: Unit }) {
  const lesson = unit.lessons[0];
  const router = useRouter();

  const [attempt, setAttempt] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `attempt` is a deliberate cache-buster to reshuffle on retry
  const exercises = useMemo(() => buildExerciseSet(lesson), [lesson, attempt]);
  const choiceTotal = exercises.filter((e) => e.type === "choice").length;

  const [index, setIndex] = useState(0);
  const [hearts, setHearts] = useState(START_HEARTS);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("study");
  const [saving, startSaving] = useTransition();
  const [saved, setSaved] = useState(false);

  const current = exercises[index];

  function goNext() {
    if (index + 1 >= exercises.length) {
      finishLesson();
    } else {
      setIndex((i) => i + 1);
    }
  }

  function finishLesson() {
    const scorePct =
      choiceTotal === 0 ? 100 : Math.round((correctCount / choiceTotal) * 100);
    const xpEarned = 10 + (scorePct === 100 ? 5 : 0);
    setPhase("summary");
    playComplete();
    startSaving(async () => {
      await completeLesson(unit.id, scorePct, xpEarned);
      setSaved(true);
    });
  }

  function handleWrongChoice() {
    setHearts((h) => {
      const next = h - 1;
      if (next <= 0) {
        setPhase("failed");
        playFail();
      }
      return next;
    });
  }

  function retry() {
    setAttempt((a) => a + 1);
    setIndex(0);
    setHearts(START_HEARTS);
    setCorrectCount(0);
    setSaved(false);
    setPhase("playing");
  }

  const exitToMap = () => router.push("/learn");

  if (phase === "study") {
    return (
      <StudyScreen
        unit={unit}
        onStart={() => setPhase("playing")}
        onExit={exitToMap}
      />
    );
  }

  if (phase === "failed") {
    return <FailedScreen onRetry={retry} onExit={exitToMap} />;
  }

  if (phase === "summary") {
    const scorePct =
      choiceTotal === 0 ? 100 : Math.round((correctCount / choiceTotal) * 100);
    const xpEarned = 10 + (scorePct === 100 ? 5 : 0);
    return (
      <SummaryScreen
        score={scorePct}
        xp={xpEarned}
        pending={saving || !saved}
        onContinue={exitToMap}
      />
    );
  }

  return (
    <div className="lesson-page">
      <LessonHeader
        unitTitle={unit.title}
        hearts={hearts}
        progress={index / exercises.length}
        onExit={exitToMap}
      />
      {current.type === "match" ? (
        <MatchExerciseView key={index} exercise={current} onComplete={goNext} />
      ) : (
        <ChoiceExerciseView
          key={index}
          exercise={current}
          onCorrect={() => setCorrectCount((c) => c + 1)}
          onWrong={handleWrongChoice}
          onNext={goNext}
        />
      )}
    </div>
  );
}

function StudyScreen({
  unit,
  onStart,
  onExit,
}: {
  unit: Unit;
  onStart: () => void;
  onExit: () => void;
}) {
  const { t } = useUiLang();
  const vocab = unit.lessons[0].vocab;

  return (
    <div className="study-page">
      <div className="study-header">
        <button className="lesson-exit" onClick={onExit} aria-label="Keluar">
          ✕
        </button>
        <span className="lesson-unit-title">{unit.title}</span>
      </div>
      <div className="study-intro">
        <h2>{t("studyTitle")}</h2>
        <p>{t("studySubtitle")}</p>
      </div>
      <ul className="study-list">
        {vocab.map((item) => (
          <li key={item.id} className="study-card">
            <span className="study-card-id">{item.indonesian}</span>
            <span className="study-card-arrow">→</span>
            <button
              className="study-card-speak"
              onClick={() => speak(item.krama)}
              aria-label={`Dengarkan ${item.krama}`}
            >
              🔊
            </button>
            <span className="study-card-krama">{item.krama}</span>
          </li>
        ))}
      </ul>
      <button className="btn btn-primary study-start" onClick={onStart}>
        {t("studyStartButton")}
      </button>
    </div>
  );
}

function LessonHeader({
  unitTitle,
  hearts,
  progress,
  onExit,
}: {
  unitTitle: string;
  hearts: number;
  progress: number;
  onExit: () => void;
}) {
  return (
    <div className="lesson-header">
      <button className="lesson-exit" onClick={onExit} aria-label="Keluar">
        ✕
      </button>
      <div className="lesson-progress-track">
        <div
          className="lesson-progress-fill"
          style={{ width: `${Math.min(progress, 1) * 100}%` }}
        />
      </div>
      <span className="lesson-hearts">
        {"❤️".repeat(Math.max(hearts, 0))}
        {"🖤".repeat(Math.max(START_HEARTS - hearts, 0))}
      </span>
      <span className="lesson-unit-title">{unitTitle}</span>
    </div>
  );
}

function ChoiceExerciseView({
  exercise,
  onCorrect,
  onWrong,
  onNext,
}: {
  exercise: ChoiceExercise;
  onCorrect: () => void;
  onWrong: () => void;
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
      else onWrong();
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

function MatchExerciseView({
  exercise,
  onComplete,
}: {
  exercise: MatchExercise;
  onComplete: () => void;
}) {
  const { t } = useUiLang();
  const leftItems = useMemo(
    () => shuffle(exercise.pairs.map((p) => ({ id: p.id, label: p.indonesian }))),
    [exercise],
  );
  const rightItems = useMemo(
    () => shuffle(exercise.pairs.map((p) => ({ id: p.id, label: p.krama }))),
    [exercise],
  );

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);

  function evaluate(leftId: string, rightId: string) {
    if (leftId === rightId) {
      playCorrect();
      const next = new Set(matched);
      next.add(leftId);
      setMatched(next);
      setSelectedLeft(null);
      setSelectedRight(null);
      if (next.size === exercise.pairs.length) {
        setTimeout(onComplete, 400);
      }
    } else {
      playWrong();
      setWrongPair({ left: leftId, right: rightId });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  }

  function pickLeft(id: string) {
    if (matched.has(id) || wrongPair) return;
    setSelectedLeft(id);
    if (selectedRight) evaluate(id, selectedRight);
  }

  function pickRight(id: string) {
    if (matched.has(id) || wrongPair) return;
    setSelectedRight(id);
    if (selectedLeft) evaluate(selectedLeft, id);
  }

  return (
    <div className="exercise">
      <p className="exercise-instruction">{t("exerciseInstructionMatch")}</p>
      <div className="match-grid">
        <div className="match-column">
          {leftItems.map((item) => (
            <button
              key={item.id}
              onClick={() => pickLeft(item.id)}
              disabled={matched.has(item.id)}
              className={`match-option ${matched.has(item.id) ? "match-done" : ""} ${
                selectedLeft === item.id ? "match-selected" : ""
              } ${wrongPair?.left === item.id ? "match-wrong" : ""}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="match-column">
          {rightItems.map((item) => (
            <div key={item.id} className="match-row">
              <button
                onClick={() => pickRight(item.id)}
                disabled={matched.has(item.id)}
                className={`match-option ${matched.has(item.id) ? "match-done" : ""} ${
                  selectedRight === item.id ? "match-selected" : ""
                } ${wrongPair?.right === item.id ? "match-wrong" : ""}`}
              >
                {item.label}
              </button>
              <button
                type="button"
                className="match-speak"
                onClick={() => speak(item.label)}
                aria-label={`Dengarkan ${item.label}`}
              >
                🔊
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FailedScreen({ onRetry, onExit }: { onRetry: () => void; onExit: () => void }) {
  const { t } = useUiLang();
  return (
    <div className="lesson-end">
      <p className="lesson-end-emoji">💔</p>
      <h2>{t("failedTitle")}</h2>
      <p>{t("failedSubtitle")}</p>
      <div className="lesson-end-actions">
        <button className="btn btn-primary" onClick={onRetry}>
          {t("retryButton")}
        </button>
        <button className="btn btn-ghost" onClick={onExit}>
          {t("backToMapButton")}
        </button>
      </div>
    </div>
  );
}

function SummaryScreen({
  score,
  xp,
  pending,
  onContinue,
}: {
  score: number;
  xp: number;
  pending: boolean;
  onContinue: () => void;
}) {
  const { t } = useUiLang();
  return (
    <div className="lesson-end">
      <p className="lesson-end-emoji">{score === 100 ? "🏆" : "🎉"}</p>
      <h2>{t("summaryTitle")}</h2>
      <div className="lesson-end-stats">
        <div className="lesson-end-stat">
          <span className="lesson-end-stat-value">{score}%</span>
          <span className="lesson-end-stat-label">{t("scoreLabel")}</span>
        </div>
        <div className="lesson-end-stat">
          <span className="lesson-end-stat-value">+{xp}</span>
          <span className="lesson-end-stat-label">XP</span>
        </div>
      </div>
      <button className="btn btn-primary" onClick={onContinue} disabled={pending}>
        {pending ? t("savingLabel") : t("summaryContinueButton")}
      </button>
    </div>
  );
}
