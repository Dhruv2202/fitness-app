-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create table favourites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, place_id)
);

alter table favourites enable row level security;

create policy "Users can view their own favourites"
  on favourites for select
  using (auth.uid() = user_id);

create policy "Users can insert their own favourites"
  on favourites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favourites"
  on favourites for delete
  using (auth.uid() = user_id);

create table event_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

alter table event_registrations enable row level security;

create policy "Users can view their own registrations"
  on event_registrations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own registrations"
  on event_registrations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own registrations"
  on event_registrations for delete
  using (auth.uid() = user_id);

-- Added later: records every tap of "Buy" in Shop, logged-in or not.
create table product_clicks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  product_id integer not null,
  clicked_at timestamptz not null default now()
);

alter table product_clicks enable row level security;

create policy "Users can view their own clicks"
  on product_clicks for select
  using (auth.uid() = user_id);

create policy "Anyone can record a click"
  on product_clicks for insert
  with check (user_id is null or auth.uid() = user_id);

-- Added later: place ids now come from OpenStreetMap, whose ids are far
-- larger than a 4-byte integer can hold, so widen the column to bigint.
alter table favourites alter column place_id type bigint;
