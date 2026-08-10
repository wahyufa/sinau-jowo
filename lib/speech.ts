function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function speakBrowser(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  // Javanese isn't a supported system voice on most platforms; Indonesian
  // is the closest phonetic match available via the browser's TTS engine.
  utterance.lang = "id-ID";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export function speak(text: string) {
  if (typeof window === "undefined") return;

  const audio = new Audio(`/audio/${slugify(text)}.mp3`);
  audio.addEventListener("error", () => speakBrowser(text));
  audio.play().catch(() => speakBrowser(text));
}
