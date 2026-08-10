import { writeFileSync, mkdirSync } from "node:fs";

const VOICE_ID = "8OdhggtxODndgBfqgFFh";
const API_KEY = process.env.ELEVENLABS_API_KEY;

if (!API_KEY) {
  console.error("ELEVENLABS_API_KEY not set");
  process.exit(1);
}

// Krama vocab words pulled from lib/curriculum.ts, deduplicated.
const words = [
  "Sugeng enjing", "Sugeng siang", "Sugeng sonten", "Sugeng dalu",
  "Pripun kabaripun?", "Matur nuwun", "Sami-sami", "Nuwun sewu",
  "Sugeng pepanggihan malih",
  "Kula", "Panjenengan", "Piyambakipun", "Kula sedaya",
  "Piyambakipun sedaya", "Nama kula", "Asma panjenengan",
  "Bapak", "Ibu", "Putra", "Putri", "Sedherek", "Garwa kakung",
  "Garwa putri", "Eyang kakung", "Eyang putri",
  "Setunggal", "Kalih", "Tigo", "Sekawan", "Gangsal", "Enem",
  "Pitu", "Wolu", "Sanga", "Sedasa",
  "Dinten menika", "Mbenjing", "Kala wingi", "Samenika", "Enjing",
  "Siang", "Sonten", "Dalu",
  "Dhahar", "Tilem", "Tindak", "Rawuh", "Ngunjuk", "Mirsani",
  "Ngendika", "Lenggah", "Jumeneng", "Siram",
  "Sekul", "Toya", "Unjukan", "Dhaharan",
  "Mustaka", "Paningal", "Asta", "Suku", "Pasuryan", "Rikma",
  "Griya", "Dalem", "Pasareyan", "Rasukan", "Yatra",
  "Mangga", "Nyuwun tulung", "Nyuwun pangapunten", "Matur nuwun sanget",
];

const unique = [...new Set(words)];

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

async function generate(text) {
  const slug = slugify(text);
  const filePath = new URL(`${slug}.mp3`, outDir);

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`FAILED: "${text}" -> ${res.status} ${err}`);
    return false;
  }

  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(filePath, buf);
  console.log(`OK: "${text}" -> ${slug}.mp3 (${buf.length} bytes)`);
  return true;
}

let okCount = 0;
for (const word of unique) {
  const ok = await generate(word);
  if (ok) okCount++;
  await new Promise((r) => setTimeout(r, 350));
}

console.log(`\nDone. ${okCount}/${unique.length} files generated.`);
