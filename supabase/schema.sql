-- Run this in the Supabase SQL Editor before using the app.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('dancer', 'choreographer', 'studio')),
  display_name text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can create their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.events (
  id bigint generated always as identity primary key,
  title text not null,
  style text not null,
  date date not null,
  time text not null,
  location text not null,
  studio text not null,
  host text not null,
  price text not null,
  spots integer not null default 0 check (spots >= 0),
  image text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

drop policy if exists "Anyone can view events" on public.events;

create policy "Anyone can view events"
  on public.events for select
  using (true);

create table if not exists public.bookings (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id bigint not null references public.events(id) on delete cascade,
  status text not null default 'booked' check (status in ('booked', 'cancelled', 'attended')),
  qr_code text,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

alter table public.bookings drop constraint if exists bookings_user_id_event_id_key;
create unique index if not exists bookings_active_user_event_key
  on public.bookings (user_id, event_id)
  where status <> 'cancelled';

alter table public.bookings enable row level security;

drop policy if exists "Users can view their own bookings" on public.bookings;
drop policy if exists "Users can create their own bookings" on public.bookings;
drop policy if exists "Users can cancel their own bookings" on public.bookings;

create policy "Users can view their own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Users can create their own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can cancel their own bookings"
  on public.bookings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.book_event(p_user_id uuid, p_event_id bigint)
returns setof public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  new_booking public.bookings;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'Not authorized';
  end if;

  if exists (
    select 1 from public.bookings
    where user_id = p_user_id and event_id = p_event_id and status <> 'cancelled'
  ) then
    raise exception 'You have already booked this class';
  end if;

  update public.events
  set spots = spots - 1
  where id = p_event_id and spots > 0;

  if not found then
    raise exception 'This class is sold out';
  end if;

  insert into public.bookings (user_id, event_id, status)
  values (p_user_id, p_event_id, 'booked')
  returning * into new_booking;

  return next new_booking;
end;
$$;

revoke all on function public.book_event(uuid, bigint) from public;
grant execute on function public.book_event(uuid, bigint) to authenticated;

create table if not exists public.saved_events (
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id bigint not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

alter table public.saved_events enable row level security;

drop policy if exists "Users can view their own saved events" on public.saved_events;
drop policy if exists "Users can save their own events" on public.saved_events;
drop policy if exists "Users can unsave their own events" on public.saved_events;

create policy "Users can view their own saved events"
  on public.saved_events for select
  using (auth.uid() = user_id);

create policy "Users can save their own events"
  on public.saved_events for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave their own events"
  on public.saved_events for delete
  using (auth.uid() = user_id);

-- Conversations table for 1:1 dancer, instructor, and organizer chats
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  event_id bigint references public.events(id) on delete set null,
  participant_1 uuid not null references public.profiles(id) on delete cascade,
  participant_2 uuid not null references public.profiles(id) on delete cascade,
  last_message text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;

drop policy if exists "Users can view their conversations" on public.conversations;
drop policy if exists "Users can create conversations" on public.conversations;
drop policy if exists "Users can update their conversations" on public.conversations;

create policy "Users can view their conversations"
  on public.conversations for select
  using (auth.uid() = participant_1 or auth.uid() = participant_2);

create policy "Users can create conversations"
  on public.conversations for insert
  with check (auth.uid() = participant_1 or auth.uid() = participant_2);

create policy "Users can update their conversations"
  on public.conversations for update
  using (auth.uid() = participant_1 or auth.uid() = participant_2)
  with check (auth.uid() = participant_1 or auth.uid() = participant_2);

-- Messages table for chat history
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "Users can view messages in their conversations" on public.messages;
drop policy if exists "Users can send messages to their conversations" on public.messages;

create policy "Users can view messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  );

create policy "Users can send messages to their conversations"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
    )
  );

-- Enable Realtime publication for messages & conversations
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.conversations;
    alter publication supabase_realtime add table public.messages;
  end if;
exception
  when duplicate_object then null;
end $$;
