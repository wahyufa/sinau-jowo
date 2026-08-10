"use client";

import { useUiLang } from "@/lib/i18n";

export default function LangToggle() {
  const { lang, toggle } = useUiLang();

  return (
    <button className="toolbar-btn" onClick={toggle} aria-label="Ganti bahasa instruksi">
      {lang === "id" ? "JV" : "ID"}
    </button>
  );
}
