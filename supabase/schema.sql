-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  xp integer not null default 0,
  streak_count integer not null default 0,
  last_lesson_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  unit_id text not null,
  score integer not null,
  xp_earned integer not null,
  completed_at timestamptz not null default now(),
  unique (user_id, unit_id)
);

alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "lesson_progress_select_own" on public.lesson_progress
  for select using (auth.uid() = user_id);

create policy "lesson_progress_insert_own" on public.lesson_progress
  for insert with check (auth.uid() = user_id);

create policy "lesson_progress_update_own" on public.lesson_progress
  for update using (auth.uid() = user_id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
