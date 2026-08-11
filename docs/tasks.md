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

## Done (deployment)
- [x] Pushed to GitHub: https://github.com/wahyufa/sinau-jowo (public)
- [x] Deployed to Vercel (user completed via dashboard import + env vars)

## Done ("richer app" round — lessons, listening, review mode)
- [x] Each unit split into 2 lessons (except the two smallest, kept at 1) — `lesson()` helper in `lib/curriculum.ts`, e.g. `sapaan-l1`/`sapaan-l2`
- [x] Routing moved from `/lesson/[unitId]` to `/lesson/[lessonId]`; `getLessonContext()`/`getFlatLessons()` added to `lib/curriculum.ts`
- [x] `/learn` now renders a flat, sequentially-unlocked lesson path grouped by unit header (not unit-level unlock)
- [x] Schema migration `supabase/migration-002-lessons-and-review.sql`: `lesson_progress.unit_id` renamed to `lesson_id`; new `word_review` table (RLS'd)
- [x] New **listening exercise** type (`lib/exercises.ts` `ListenExercise`) — plays krama audio, user picks the Indonesian meaning; mixed in alongside choice exercises
- [x] **Streak grace day**: skipping exactly one day no longer resets the streak (only 2+ day gaps do) — `lib/actions.ts`
- [x] **Review mode**: wrong answers upsert into `word_review` (`recordMistake`); `/learn` shows a banner when the queue is non-empty; `/review` runs a choice-only session pulling cross-unit distractors; correct answers call `clearMistake`. Verified end-to-end: banner appears → review session → banner disappears.
- [x] Extracted `ChoiceExerciseView` into its own file so `LessonRunner` and `ReviewRunner` share it instead of duplicating ~90 lines

## Fixed: critical scoring bug (useMemo misuse)
Found while testing the new features: **every lesson always showed a 100% score, no matter how many answers were actually wrong.** Root cause — `buildExerciseSet`/`buildReviewExercises`/`MatchExerciseView`'s shuffling all use `Math.random()`, but were wrapped in `useMemo`. React does not guarantee a memo factory runs only once (dev-mode double-invocation is explicitly allowed to catch impure functions like this); when it re-ran, a *freshly reshuffled* options array replaced the old one, so `selected` (a numeric index) ended up pointing at a different option than the one actually clicked — wrong/correct highlighting broke, and completed-exercise counts didn't match reality.
**Fix**: replaced every `useMemo(() => <fn with Math.random>, deps)` with `useState(() => <fn with Math.random>)` (lazy initializer) in `LessonRunner.tsx` and `ReviewRunner.tsx`. `useState`'s initializer is guaranteed to run exactly once per mount. Also widened exercise `key` props from `key={index}` to `key={\`${attempt}-${index}\`}` so a retry lands on a fresh component instance even when the index coincidentally repeats.
**Rule for future work**: never wrap a non-deterministic function (`Math.random`, `Date.now`, etc.) in `useMemo` for anything correctness-critical — use `useState(() => ...)` instead. `useMemo` is a performance hint only.
Verified after the fix: a lesson answered 9/10 correctly now shows exactly 90% (not 100%), confirmed via direct DOM/network inspection across multiple isolated repro runs.

## Still needs you
- [ ] **Re-listen to the 7 regenerated words**, especially Ngunjuk/Bapak/Tindak/Putri/"Sugeng siang" — describe *which syllable* sounds wrong and *what it sounds like instead* if still off, so fixes aren't guesswork
- [ ] Keep QA-ing the rest of the 72 words by ear in the app
- [ ] Review `lib/curriculum.ts` vocab for accuracy before any public/real users
- [ ] Re-enable "Confirm email" in Supabase before real users sign up (it's currently off for dev convenience)
- [ ] Run `supabase/migration-002-lessons-and-review.sql` on the **production** Supabase project too if it wasn't included when you first ran schema.sql there (check: does `lesson_progress` have `lesson_id` or still `unit_id`?)
- [ ] Redeploy to Vercel to pick up all of today's changes (lesson splitting, listening exercises, review mode, the scoring bug fix)

## Next up (not started)
- [ ] Password reset flow
