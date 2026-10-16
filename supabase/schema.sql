-- Optional NEXTUP schema. Apply this in the Supabase SQL editor after you create a project.
-- The app uses the anon key and Row Level Security. It does not use a service-role key.

create table if not exists public.athlete_boards (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.athlete_boards enable row level security;

create policy "athlete_boards_select_own"
  on public.athlete_boards
  for select
  using (auth.uid() = user_id);

create policy "athlete_boards_insert_own"
  on public.athlete_boards
  for insert
  with check (auth.uid() = user_id);

create policy "athlete_boards_update_own"
  on public.athlete_boards
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "athlete_boards_delete_own"
  on public.athlete_boards
  for delete
  using (auth.uid() = user_id);
