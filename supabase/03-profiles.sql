-- Personal details for each account. Kept separate from Supabase's own
-- auth.users table, which should not be written to directly.
-- Safe to run more than once.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  -- Date of birth rather than age: an age stored as a number is wrong a year
  -- later, so the age shown in the app is worked out from this.
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other', 'undisclosed')),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "Users can view their own profile" on profiles;
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can create their own profile" on profiles;
create policy "Users can create their own profile"
  on profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);
