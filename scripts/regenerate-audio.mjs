import { writeFileSync, mkdirSync } from "node:fs";

const VOICE_ID = "8OdhggtxODndgBfqgFFh";
const API_KEY = process.env.ELEVENLABS_API_KEY;

if (!API_KEY) {
  console.error("ELEVENLABS_API_KEY not set");
  process.exit(1);
}

// Map: displayed krama word -> text actually sent to TTS (phonetic respelling).
// Only include an entry here when the displayed spelling would mislead the
// TTS engine's pronunciation (e.g. Javanese final-open-syllable "a" -> [o]).
// Omit an entry to just regenerate with the original text unchanged.
const WORDS = {
  "Sanga": "Songo",
};

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const outDir = new URL("../public/audio/", import.meta.url);
mkdirSync(outDir, { recursive: true });

async function generate(displayWord, ttsText) {
  const slug = slugify(displayWord);
  const filePath = new URL(`${slug}.mp3`, outDir);

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: ttsText, model_id: "eleven_multilingual_v2" }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`FAILED: "${displayWord}" -> ${res.status} ${err}`);
    return false;
  }

  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(filePath, buf);
  console.log(`OK: "${displayWord}" (spoken as "${ttsText}") -> ${slug}.mp3`);
  return true;
}

let okCount = 0;
const entries = Object.entries(WORDS);
for (const [displayWord, ttsText] of entries) {
  const ok = await generate(displayWord, ttsText);
  if (ok) okCount++;
  await new Promise((r) => setTimeout(r, 350));
}

console.log(`\nDone. ${okCount}/${entries.length} files regenerated.`);
