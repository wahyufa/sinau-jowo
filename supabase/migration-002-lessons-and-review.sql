-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Follows on from schema.sql: units were split into multiple lessons each,
-- so progress is now tracked per lesson instead of per unit. Existing test
-- rows in lesson_progress will have stale IDs (harmless -- just means old
-- test completions won't match the new lesson IDs).

alter table public.lesson_progress rename column unit_id to lesson_id;

create table if not exists public.word_review (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  vocab_id text not null,
  unit_id text not null,
  wrong_count integer not null default 1,
  cleared_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, vocab_id)
);

alter table public.word_review enable row level security;

create policy "word_review_select_own" on public.word_review
  for select using (auth.uid() = user_id);

create policy "word_review_insert_own" on public.word_review
  for insert with check (auth.uid() = user_id);

create policy "word_review_update_own" on public.word_review
  for update using (auth.uid() = user_id);
