"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Unit, Lesson } from "@/lib/curriculum";
import {
  buildExerciseSet,
  shuffle,
  type ListenExercise,
  type MatchExercise,
} from "@/lib/exercises";
import { completeLesson, recordMistake } from "@/lib/actions";
import { playCorrect, playWrong, playComplete, playFail } from "@/lib/sound";
import { useUiLang } from "@/lib/i18n";
import { speak } from "@/lib/speech";
import ChoiceExerciseView from "@/components/ChoiceExerciseView";

const START_HEARTS = 5;
type Phase = "study" | "playing" | "summary" | "failed";

export default function LessonRunner({ unit, lesson }: { unit: Unit; lesson: Lesson }) {
  const router = useRouter();

  // `attempt` only differentiates the `key` prop across retries (so exercise
  // views remount even when index coincidentally repeats); it no longer
  // drives recomputation directly.
  const [attempt, setAttempt] = useState(0);
  // Lazy useState initializer, NOT useMemo: buildExerciseSet uses
  // Math.random, and useMemo isn't guaranteed to run its factory only once
  // (React may re-invoke it, e.g. under StrictMode) -- that produced a real
  // bug where `selected` (an index into `options`) pointed at a different
  // option after a reshuffle. useState's initializer is guaranteed once.
  const [exercises, setExercises] = useState(() => buildExerciseSet(lesson));
  const scoreableTotal = exercises.filter((e) => e.type !== "match").length;

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
      scoreableTotal === 0 ? 100 : Math.round((correctCount / scoreableTotal) * 100);
    const xpEarned = 10 + (scorePct === 100 ? 5 : 0);
    setPhase("summary");
    playComplete();
    startSaving(async () => {
      await completeLesson(lesson.id, scorePct, xpEarned);
      setSaved(true);
    });
  }

  function handleWrongChoice(vocabId: string) {
    void recordMistake(vocabId, unit.id);
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
    setExercises(buildExerciseSet(lesson));
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
        lesson={lesson}
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
      scoreableTotal === 0 ? 100 : Math.round((correctCount / scoreableTotal) * 100);
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
        unitTitle={`${unit.title} · ${lesson.title}`}
        hearts={hearts}
        progress={index / exercises.length}
        onExit={exitToMap}
      />
      {current.type === "match" && (
        <MatchExerciseView key={`${attempt}-${index}`} exercise={current} onComplete={goNext} />
      )}
      {current.type === "choice" && (
        <ChoiceExerciseView
          key={`${attempt}-${index}`}
          exercise={current}
          onCorrect={() => setCorrectCount((c) => c + 1)}
          onWrong={handleWrongChoice}
          onNext={goNext}
        />
      )}
      {current.type === "listen" && (
        <ListenExerciseView
          key={`${attempt}-${index}`}
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
  lesson,
  onStart,
  onExit,
}: {
  unit: Unit;
  lesson: Lesson;
  onStart: () => void;
  onExit: () => void;
}) {
  const { t } = useUiLang();
  const vocab = lesson.vocab;

  return (
    <div className="study-page">
      <div className="study-header">
        <button className="lesson-exit" onClick={onExit} aria-label="Keluar">
          ✕
        </button>
        <span className="lesson-unit-title">{unit.title} · {lesson.title}</span>
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

function ListenExerciseView({
  exercise,
  onCorrect,
  onWrong,
  onNext,
}: {
  exercise: ListenExercise;
  onCorrect: () => void;
  onWrong: (vocabId: string) => void;
  onNext: () => void;
}) {
  const { t } = useUiLang();
  const [selected, setSelected] = useState<number | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    speak(exercise.audioText);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- play once when this exercise mounts
  }, []);

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
      <p className="exercise-instruction">{t("exerciseInstructionListen")}</p>
      <button
        type="button"
        className="listen-play-button"
        onClick={() => speak(exercise.audioText)}
        aria-label="Putar lagi"
      >
        🔊
      </button>
      <div className="choice-grid">
        {exercise.options.map((opt, i) => {
          let variant = "default";
          if (selected === i) variant = i === exercise.correctIndex ? "correct" : "wrong";
          else if (isCorrect !== null && i === exercise.correctIndex) variant = "correct";

          return (
            <button
              key={opt}
              className={`choice-option choice-${variant}`}
              onClick={() => choose(i)}
              disabled={isCorrect === true}
            >
              {opt}
            </button>
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
  // Lazy useState initializer (see note in LessonRunner) -- shuffle() is
  // non-deterministic, so this must only run once per mount, not on every
  // render useMemo happens to re-invoke.
  const [leftItems] = useState(() =>
    shuffle(exercise.pairs.map((p) => ({ id: p.id, label: p.indonesian }))),
  );
  const [rightItems] = useState(() =>
    shuffle(exercise.pairs.map((p) => ({ id: p.id, label: p.krama }))),
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
