"use client";

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";

export type UiLang = "id" | "jv";

// Bilingual copy for UI chrome/instructions only — quiz prompts and vocab
// stay as-is, since those are the learning content itself.
const UI_DICTIONARY = {
  learnGreetingPrefix: { id: "Selamat datang,", jv: "Sugeng rawuh," },
  authLoginTitle: { id: "Selamat datang", jv: "Sugeng rawuh" },
  authSignupTitle: { id: "Mulai belajar", jv: "Wiwit sinau" },
  studyTitle: { id: "Pelajari Kosakata Dulu", jv: "Sinau Kosakata Dhisik" },
  studySubtitle: {
    id: "Lihat semua kata di lesson ini sebelum mulai latihan.",
    jv: "Deleng kabeh tembung ing lesson iki sadurunge miwiti latihan.",
  },
  studyStartButton: { id: "Mulai Latihan", jv: "Wiwit Latihan" },
  exerciseInstructionIdToJv: {
    id: "Pilih bahasa Jawa halus yang benar:",
    jv: "Pilih basa Jawa alus sing bener:",
  },
  exerciseInstructionJvToId: {
    id: "Apa arti kata ini?",
    jv: "Apa tegese tembung iki?",
  },
  exerciseInstructionMatch: {
    id: "Cocokkan kata yang artinya sama:",
    jv: "Jodohke tembung sing padha artine:",
  },
  exerciseInstructionListen: {
    id: "Dengarkan, lalu pilih artinya:",
    jv: "Rungokna, banjur pilih tegese:",
  },
  feedbackCorrect: { id: "Benar!", jv: "Bener!" },
  feedbackWrong: { id: "Belum tepat, coba lagi.", jv: "Durung pas, coba maneh." },
  continueButton: { id: "Lanjut", jv: "Lanjut" },
  failedTitle: { id: "Kehabisan Nyawa", jv: "Kentekan Nyawa" },
  failedSubtitle: { id: "Tidak apa-apa, coba lagi, ya!", jv: "Ora papa, coba maneh, ya!" },
  retryButton: { id: "Coba Lagi", jv: "Coba Maneh" },
  backToMapButton: { id: "Kembali ke Peta", jv: "Bali menyang Peta" },
  summaryTitle: { id: "Pelajaran Selesai!", jv: "Wulangan Rampung!" },
  scoreLabel: { id: "Benar", jv: "Bener" },
  summaryContinueButton: { id: "Lanjutkan", jv: "Lanjutake" },
  savingLabel: { id: "Menyimpan...", jv: "Nyimpen..." },
} as const;

export type UiTextKey = keyof typeof UI_DICTIONARY;

const STORAGE_KEY = "uiLang";
const CHANGE_EVENT = "uilang-change";

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): UiLang {
  return window.localStorage.getItem(STORAGE_KEY) === "jv" ? "jv" : "id";
}

function getServerSnapshot(): UiLang {
  return "id";
}

type UiLangContextValue = {
  lang: UiLang;
  toggle: () => void;
  t: (key: UiTextKey) => string;
};

const UiLangContext = createContext<UiLangContextValue | null>(null);

export function UiLangProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next: UiLang = getSnapshot() === "id" ? "jv" : "id";
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const t = useCallback((key: UiTextKey) => UI_DICTIONARY[key][lang], [lang]);

  return <UiLangContext.Provider value={{ lang, toggle, t }}>{children}</UiLangContext.Provider>;
}

export function useUiLang() {
  const ctx = useContext(UiLangContext);
  if (!ctx) throw new Error("useUiLang must be used within UiLangProvider");
  return ctx;
}
