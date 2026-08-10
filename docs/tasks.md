# Tasks — Kromo Inggil

## Done (v1 scaffold)
- [x] Next.js 16 + Tailwind + Supabase scaffold
- [x] Supabase auth (client/server/proxy for session refresh)
- [x] DB schema (`supabase/schema.sql`): profiles, lesson_progress, RLS, auto-create-profile trigger
- [x] Curriculum content: 10 units / 1 lesson each (`lib/curriculum.ts`) — **draft, needs native-speaker review**
- [x] Exercise engine: multiple-choice + matching, auto-generated from vocab (`lib/exercises.ts`)
- [x] Login / signup pages + server actions
- [x] Landing page, /learn lesson map with unlock-by-completion logic
- [x] Lesson runner: hearts, XP, streak, score summary
- [x] Styling: custom design tokens (not a Duolingo visual clone)
- [x] `npm run build` passes, ESLint clean

## Done (Supabase setup + verification)
- [x] Ran `supabase/schema.sql` in Supabase SQL Editor
- [x] Disabled "Confirm email" for dev testing
- [x] Backfilled `profiles` for pre-schema test users
- [x] Full flow verified in-browser: signup → login → lesson map → match/choice exercises → hearts/scoring → XP/streak persistence → unit unlock

## Done (UX feedback round)
- [x] Fixed hydration mismatch on lesson pages (`LessonRunner` now `dynamic(..., { ssr: false })` via `components/LessonLoader.tsx`) — likely cause of "clicks don't register" bug report
- [x] Fixed correct-answer reveal bug: wrong pick now shows both the wrong (red) and correct (green) option, like Duolingo
- [x] Solid-fill color + pop/shake animations for correct/wrong feedback (was too subtle before)
- [x] Sound effects via Web Audio API (`lib/sound.ts`) — no audio files, generated tones, no download/permission needed
- [x] Study/preview screen before each lesson's exercises (`StudyScreen` in `components/LessonRunner.tsx`) — shows all vocab pairs first
- [x] Light/dark theme toggle, persisted to localStorage, defaults to system preference (`components/ThemeToggle.tsx`)
- [x] Bilingual (ID/JV) toggle for UI instructions/chrome — NOT for quiz content (`lib/i18n.tsx`, `components/LangToggle.tsx`)
- [x] Pronunciation button on vocab words (`lib/speech.ts`) — TTS added on Javanese text in exercises too (choice prompt/options when Javanese, match's krama column), not just the study screen

## Done (ElevenLabs TTS — resolved)
- Root cause of earlier `402 payment_required`: Free plan blocks (a) any voice sourced from the Voice Library, and (b) creating voices *through the API*. Fix: user created a custom voice via the ElevenLabs **dashboard** (Voice Design UI, not API) — that voice is neither library-origin nor API-created, so it works for TTS calls on the Free plan.
- `scripts/generate-audio.mjs` — one-time script, generates all 72 unique krama vocab words via ElevenLabs TTS using that custom voice, saves to `public/audio/<slugified-word>.mp3`. Re-run manually if vocab changes (not part of the app's runtime/build).
- `lib/speech.ts` now plays the static MP3 first; falls back to Web Speech API (`id-ID`) only if a file is missing/fails to load. No live API calls at runtime — zero ongoing cost or quota risk.
- `ELEVENLABS_API_KEY` in `.env.local` — only used by the one-off generation scripts, not by the running app.
- Regeneration pattern established: `scripts/regenerate-audio.mjs` takes a `{ displayWord: ttsText }` map so a word's *displayed* spelling stays correct Javanese orthography while the *TTS input* can be phonetically respelled (e.g. `"Sanga": "Sango"`) to fix mispronunciation — output filename is always keyed off the displayed word, so `lib/speech.ts` needs no changes when re-running it.
- Round 1 fixes (2026-08-10): "Toya" fixed. User flagged 7 more — applied the Javanese a→[o] rule to "Sanga"→"Sango" (wrong, only shifted final syllable) and "Putra"→"Putro"; regenerated the rest unchanged as a stochastic retry.
- **Correction**: user confirmed "Sanga" should be "Songo" — the a→o vowel harmony shifts **every** "a" in the word, not just the final syllable. Fixed.
- **Refined rule** (confirmed against "Sanga"→shifts and "Dalu"→stays): the shift only triggers when the word's **final syllable is itself open and ends in "a"**. When that's true, every "a" in the word shifts to "o" (regressive harmony — see Sanga→Songo). If the final syllable ends in a different vowel or is closed by a consonant (e.g. Dalu's "-lu", Bapak's "-pak", Tindak's "-dak"), there's no trigger and "a" stays "a" throughout — matches why those three weren't actually broken by the a/o rule. Use this to judge future words before respelling, rather than guessing per-word.

## Still needs you
- [ ] **Re-listen to the 7 regenerated words**, especially Ngunjuk/Bapak/Tindak/Putri/"Sugeng siang" — describe *which syllable* sounds wrong and *what it sounds like instead* if still off, so fixes aren't guesswork
- [ ] Keep QA-ing the rest of the 72 words by ear in the app
- [ ] Review `lib/curriculum.ts` vocab for accuracy before any public/real users
- [ ] Re-enable "Confirm email" in Supabase before real users sign up (it's currently off for dev convenience)

## Next up (not started)
- [ ] Deploy to Vercel
- [ ] More than 1 lesson per unit (data model already supports it)
- [ ] Password reset flow
