-- Migration: 0002_events.sql
-- Classy Events Telemetry Table, Column additions for items and profiles

-- 1. Create events table
create table if not exists public.events (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_role user_role null,
  event text not null,
  source text not null check (source in ('mcp', 'app')),
  tool text null,
  client_name text null,
  batch_id uuid references public.batches(id) on delete set null,
  item_id uuid references public.items(id) on delete set null,
  success boolean not null default true,
  duration_ms integer null,
  meta jsonb not null default '{}'::jsonb
);

-- 2. Indexes for fast aggregation and querying
create index if not exists idx_events_created_at on public.events(created_at desc);
create index if not exists idx_events_event on public.events(event);
create index if not exists idx_events_source on public.events(source);
create index if not exists idx_events_actor_id on public.events(actor_id);

-- 3. Enable RLS with NO policies (service role admin client only)
alter table public.events enable row level security;

-- 4. Add items.source ('app' or 'mcp')
alter table public.items 
  add column if not exists source text not null default 'app' check (source in ('mcp', 'app'));

-- 5. Add profiles.last_seen_at
alter table public.profiles 
  add column if not exists last_seen_at timestamptz;
