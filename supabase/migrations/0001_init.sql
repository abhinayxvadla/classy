-- Migration: 0001_init.sql
-- Classy Full Database Schema, Enums, Tables, Triggers, RLS, and RPCs

-- 1. Extensions
create extension if not exists "pgcrypto";

-- 2. Custom Types / Enums
do $$ begin
  create type user_role as enum ('tutor', 'student');
exception when duplicate_object then null; end $$;

do $$ begin
  create type roster_status as enum ('invited', 'joined', 'pending', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type item_type as enum ('quiz', 'notes', 'assignment', 'announcement');
exception when duplicate_object then null; end $$;

do $$ begin
  create type item_access as enum ('free', 'premium');
exception when duplicate_object then null; end $$;

do $$ begin
  create type item_visibility as enum ('batch', 'public');
exception when duplicate_object then null; end $$;

do $$ begin
  create type submission_status as enum ('submitted', 'graded', 'released');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('created', 'paid', 'failed');
exception when duplicate_object then null; end $$;

-- 3. Batches join_code generator helper
create or replace function public.generate_join_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  done bool;
  i int;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;
    select not exists(select 1 from public.batches where join_code = code) into done;
    if done then
      return code;
    end if;
  end loop;
end;
$$;

-- 4. 40-char random token generator for MCP
create or replace function public.generate_mcp_token()
returns text
language plpgsql
as $$
declare
  chars text := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  token text := '';
  i int;
begin
  for i in 1..40 loop
    token := token || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return token;
end;
$$;

-- 5. Tables
-- 5.1 profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text not null,
  email text not null,
  phone text,
  institute text,
  grade text,
  subjects text[] default '{}'::text[],
  must_change_password boolean default false,
  created_at timestamptz default now() not null
);

-- 5.2 security_answers (Service Role ONLY, RLS on, no policies)
create table if not exists public.security_answers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  question text not null,
  answer_hash text not null,
  failed_attempts integer default 0 not null,
  locked_until timestamptz
);
alter table public.security_answers enable row level security;

-- 5.3 batches
create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  subject text,
  grade text,
  description text,
  join_code text unique not null default public.generate_join_code(),
  premium_price_inr integer default 0 not null,
  created_at timestamptz default now() not null
);
alter table public.batches enable row level security;

-- 5.4 roster
create table if not exists public.roster (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  status roster_status default 'invited' not null,
  student_id uuid references public.profiles(id) on delete set null,
  premium_until timestamptz,
  joined_at timestamptz,
  created_at timestamptz default now() not null,
  constraint roster_batch_student_unique unique (batch_id, student_id)
);
create index if not exists idx_roster_batch_email on public.roster (batch_id, lower(email));
create index if not exists idx_roster_batch_phone on public.roster (batch_id, phone);
alter table public.roster enable row level security;

-- 5.5 items
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.batches(id) on delete cascade,
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  type item_type not null,
  title text not null,
  body jsonb default '{}'::jsonb not null,
  access item_access default 'free' not null,
  visibility item_visibility default 'batch' not null,
  grade text,
  subject text,
  due_at timestamptz,
  max_marks integer,
  published boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
alter table public.items enable row level security;

-- 5.6 quiz_keys
create table if not exists public.quiz_keys (
  item_id uuid primary key references public.items(id) on delete cascade,
  answers jsonb not null
);
alter table public.quiz_keys enable row level security;

-- 5.7 attempts
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  answers jsonb,
  score numeric,
  total numeric,
  submitted_at timestamptz default now() not null,
  constraint attempts_item_student_unique unique (item_id, student_id)
);
alter table public.attempts enable row level security;

-- 5.8 submissions
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  text_answer text,
  link_url text,
  status submission_status default 'submitted' not null,
  marks numeric,
  feedback text,
  submitted_at timestamptz default now() not null,
  graded_at timestamptz,
  released_at timestamptz,
  constraint submissions_item_student_unique unique (item_id, student_id)
);
alter table public.submissions enable row level security;

-- 5.9 payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches(id),
  student_id uuid not null references public.profiles(id),
  amount_inr integer not null,
  commission_inr integer not null,
  razorpay_order_id text,
  razorpay_payment_id text,
  status payment_status default 'created' not null,
  created_at timestamptz default now() not null
);
alter table public.payments enable row level security;

-- 5.10 mcp_tokens
create table if not exists public.mcp_tokens (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  token text unique not null default public.generate_mcp_token(),
  label text default 'My AI' not null,
  created_at timestamptz default now() not null,
  last_used_at timestamptz,
  revoked_at timestamptz
);
alter table public.mcp_tokens enable row level security;

-- 6. Helper Functions & Triggers
-- 6.1 handle_new_user()
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_role text;
  user_r user_role;
begin
  raw_role := new.raw_user_meta_data->>'role';
  if raw_role is null or raw_role not in ('tutor', 'student') then
    raise exception 'Role is required and must be tutor or student';
  end if;
  user_r := raw_role::user_role;

  insert into public.profiles (
    id,
    role,
    full_name,
    email,
    phone,
    institute,
    grade,
    subjects,
    must_change_password
  ) values (
    new.id,
    user_r,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'institute',
    new.raw_user_meta_data->>'grade',
    coalesce(
      case
        when jsonb_typeof(new.raw_user_meta_data->'subjects') = 'array' then
          array(select jsonb_array_elements_text(new.raw_user_meta_data->'subjects'))
        else '{}'::text[]
      end,
      '{}'::text[]
    ),
    coalesce((new.raw_user_meta_data->>'must_change_password')::boolean, false)
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6.2 prevent_role_change()
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (current_user != 'service_role' and coalesce(auth.role(), '') != 'service_role') then
    if new.role <> old.role then
      raise exception 'Role cannot be changed';
    end if;
    if new.email <> old.email then
      raise exception 'Email cannot be changed directly on profile';
    end if;
  end if;
  return new;
end;
$$;

create or replace trigger before_profiles_update
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- 6.3 set_updated_at()
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trigger_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

-- 6.4 Security definer helper functions
create or replace function public.is_batch_tutor(batch_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.batches
    where id = batch_id and tutor_id = auth.uid()
  );
$$;

create or replace function public.is_batch_member(batch_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.roster
    where batch_id = $1 and student_id = auth.uid() and status = 'joined'
  );
$$;

create or replace function public.has_batch_premium(batch_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.roster
    where batch_id = $1
      and student_id = auth.uid()
      and status = 'joined'
      and premium_until is not null
      and premium_until > now()
  );
$$;

-- 7. RLS Policies
-- 7.1 profiles
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_tutor_select_students"
  on public.profiles for select
  using (
    exists (
      select 1 from public.roster r
      join public.batches b on b.id = r.batch_id
      where b.tutor_id = auth.uid()
        and r.student_id = profiles.id
    )
  );

-- 7.2 batches
create policy "batches_tutor_all"
  on public.batches for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

create policy "batches_student_select_joined"
  on public.batches for select
  using (public.is_batch_member(id));

-- 7.3 roster
create policy "roster_tutor_all"
  on public.roster for all
  using (public.is_batch_tutor(batch_id))
  with check (public.is_batch_tutor(batch_id));

create policy "roster_student_select_own"
  on public.roster for select
  using (student_id = auth.uid());

-- 7.4 items
create policy "items_tutor_all"
  on public.items for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

-- 7.5 quiz_keys
create policy "quiz_keys_tutor_all"
  on public.quiz_keys for all
  using (
    exists (
      select 1 from public.items i
      where i.id = quiz_keys.item_id and i.tutor_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.items i
      where i.id = quiz_keys.item_id and i.tutor_id = auth.uid()
    )
  );

-- 7.6 attempts
create policy "attempts_student_select_own"
  on public.attempts for select
  using (student_id = auth.uid());

create policy "attempts_tutor_select_item_attempts"
  on public.attempts for select
  using (
    exists (
      select 1 from public.items i
      where i.id = attempts.item_id and i.tutor_id = auth.uid()
    )
  );

-- 7.7 submissions
create policy "submissions_student_select_own"
  on public.submissions for select
  using (student_id = auth.uid());

create policy "submissions_tutor_select_item_submissions"
  on public.submissions for select
  using (
    exists (
      select 1 from public.items i
      where i.id = submissions.item_id and i.tutor_id = auth.uid()
    )
  );

create policy "submissions_tutor_update_item_submissions"
  on public.submissions for update
  using (
    exists (
      select 1 from public.items i
      where i.id = submissions.item_id and i.tutor_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.items i
      where i.id = submissions.item_id and i.tutor_id = auth.uid()
    )
  );

-- 7.8 payments
create policy "payments_student_select_own"
  on public.payments for select
  using (student_id = auth.uid());

create policy "payments_tutor_select_batch_payments"
  on public.payments for select
  using (public.is_batch_tutor(batch_id));

-- 7.9 mcp_tokens
create policy "mcp_tokens_tutor_all"
  on public.mcp_tokens for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

-- 8. Student RPCs (SECURITY DEFINER)
-- 8.1 get_batch_public (callable by anon too)
create or replace function public.get_batch_public(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result json;
begin
  select json_build_object(
    'id', b.id,
    'name', b.name,
    'subject', b.subject,
    'grade', b.grade,
    'description', b.description,
    'premium_price_inr', b.premium_price_inr,
    'tutor_name', p.full_name,
    'student_count', (
      select count(*)::int from public.roster r
      where r.batch_id = b.id and r.status = 'joined'
    ),
    'free_item_count', (
      select count(*)::int from public.items i
      where i.batch_id = b.id and i.published = true and i.access = 'free'
    )
  ) into v_result
  from public.batches b
  join public.profiles p on p.id = b.tutor_id
  where upper(b.join_code) = upper(trim(p_code));

  return v_result;
end;
$$;

-- 8.2 join_batch_by_code
create or replace function public.join_batch_by_code(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid := auth.uid();
  v_caller_role user_role;
  v_caller_email text;
  v_caller_phone text;
  v_caller_name text;
  v_batch_id uuid;
  v_roster_id uuid;
  v_status roster_status;
begin
  if v_caller_id is null then
    raise exception 'Authentication required';
  end if;

  select role, email, phone, full_name
  into v_caller_role, v_caller_email, v_caller_phone, v_caller_name
  from public.profiles
  where id = v_caller_id;

  if v_caller_role <> 'student' then
    raise exception 'Only students can join batches';
  end if;

  select id into v_batch_id
  from public.batches
  where upper(join_code) = upper(trim(p_code));

  if v_batch_id is null then
    raise exception 'Invalid join code';
  end if;

  -- 1. If caller already has a roster row in this batch
  select status into v_status
  from public.roster
  where batch_id = v_batch_id and student_id = v_caller_id;

  if v_status is not null then
    return json_build_object('batch_id', v_batch_id, 'status', v_status);
  end if;

  -- 2. Match roster row in that batch with student_id IS NULL by lower(email) = caller email OR phone = caller phone
  select id into v_roster_id
  from public.roster
  where batch_id = v_batch_id
    and student_id is null
    and (
      (v_caller_email is not null and lower(email) = lower(v_caller_email))
      or (v_caller_phone is not null and phone = v_caller_phone)
    )
  limit 1;

  if v_roster_id is not null then
    update public.roster
    set student_id = v_caller_id,
        status = 'joined',
        joined_at = now()
    where id = v_roster_id;

    return json_build_object('batch_id', v_batch_id, 'status', 'joined');
  end if;

  -- 3. Otherwise insert a pending row
  insert into public.roster (
    batch_id,
    student_id,
    full_name,
    email,
    phone,
    status
  ) values (
    v_batch_id,
    v_caller_id,
    v_caller_name,
    v_caller_email,
    v_caller_phone,
    'pending'
  );

  return json_build_object('batch_id', v_batch_id, 'status', 'pending');
end;
$$;

-- 8.3 request_join
create or replace function public.request_join(p_batch_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid := auth.uid();
  v_caller_role user_role;
  v_caller_email text;
  v_caller_phone text;
  v_caller_name text;
  v_roster_id uuid;
  v_status roster_status;
begin
  if v_caller_id is null then
    raise exception 'Authentication required';
  end if;

  select role, email, phone, full_name
  into v_caller_role, v_caller_email, v_caller_phone, v_caller_name
  from public.profiles
  where id = v_caller_id;

  if v_caller_role <> 'student' then
    raise exception 'Only students can request to join batches';
  end if;

  if not exists (select 1 from public.batches where id = p_batch_id) then
    raise exception 'Batch not found';
  end if;

  -- Check existing roster row
  select status into v_status
  from public.roster
  where batch_id = p_batch_id and student_id = v_caller_id;

  if v_status is not null then
    return json_build_object('batch_id', p_batch_id, 'status', v_status);
  end if;

  -- Match unclaimed roster row
  select id into v_roster_id
  from public.roster
  where batch_id = p_batch_id
    and student_id is null
    and (
      (v_caller_email is not null and lower(email) = lower(v_caller_email))
      or (v_caller_phone is not null and phone = v_caller_phone)
    )
  limit 1;

  if v_roster_id is not null then
    update public.roster
    set student_id = v_caller_id,
        status = 'joined',
        joined_at = now()
    where id = v_roster_id;

    return json_build_object('batch_id', p_batch_id, 'status', 'joined');
  end if;

  -- Insert pending
  insert into public.roster (
    batch_id,
    student_id,
    full_name,
    email,
    phone,
    status
  ) values (
    p_batch_id,
    v_caller_id,
    v_caller_name,
    v_caller_email,
    v_caller_phone,
    'pending'
  );

  return json_build_object('batch_id', p_batch_id, 'status', 'pending');
end;
$$;

-- 8.4 get_my_batches
create or replace function public.get_my_batches()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid := auth.uid();
  v_caller_role user_role;
  v_result json;
begin
  if v_caller_id is null then
    raise exception 'Authentication required';
  end if;

  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role <> 'student' then
    raise exception 'Only students can call get_my_batches';
  end if;

  select coalesce(json_agg(
    json_build_object(
      'id', b.id,
      'name', b.name,
      'subject', b.subject,
      'grade', b.grade,
      'description', b.description,
      'join_code', b.join_code,
      'premium_price_inr', b.premium_price_inr,
      'status', r.status,
      'joined_at', r.joined_at,
      'tutor_name', p.full_name,
      'has_premium', (r.status = 'joined' and r.premium_until is not null and r.premium_until > now()),
      'premium_until', r.premium_until,
      'student_count', (
        select count(*)::int from public.roster r2
        where r2.batch_id = b.id and r2.status = 'joined'
      ),
      'item_count', (
        select count(*)::int from public.items i
        where i.batch_id = b.id and i.published = true
      )
    ) order by b.created_at desc
  ), '[]'::json) into v_result
  from public.roster r
  join public.batches b on b.id = r.batch_id
  join public.profiles p on p.id = b.tutor_id
  where r.student_id = v_caller_id
    and r.status in ('joined', 'pending');

  return v_result;
end;
$$;

-- 8.5 get_student_feed
create or replace function public.get_student_feed(p_batch_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid := auth.uid();
  v_caller_role user_role;
  v_is_joined boolean;
  v_has_prem boolean;
  v_result json;
begin
  if v_caller_id is null then
    raise exception 'Authentication required';
  end if;

  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role <> 'student' then
    raise exception 'Only students can access student feed';
  end if;

  -- Verify membership
  select (status = 'joined'), (premium_until is not null and premium_until > now())
  into v_is_joined, v_has_prem
  from public.roster
  where batch_id = p_batch_id and student_id = v_caller_id;

  if coalesce(v_is_joined, false) = false then
    raise exception 'You are not a member of this batch';
  end if;

  select coalesce(json_agg(
    json_build_object(
      'id', i.id,
      'batch_id', i.batch_id,
      'type', i.type,
      'title', i.title,
      'access', i.access,
      'visibility', i.visibility,
      'grade', i.grade,
      'subject', i.subject,
      'due_at', i.due_at,
      'max_marks', i.max_marks,
      'created_at', i.created_at,
      'locked', (i.access = 'premium' and not coalesce(v_has_prem, false)),
      'body', case
        when i.access = 'premium' and not coalesce(v_has_prem, false) then null
        else i.body
      end,
      'my_attempt', (
        select json_build_object(
          'id', a.id,
          'score', a.score,
          'total', a.total,
          'submitted_at', a.submitted_at
        )
        from public.attempts a
        where a.item_id = i.id and a.student_id = v_caller_id
      ),
      'my_submission', (
        select json_build_object(
          'id', s.id,
          'status', s.status,
          'submitted_at', s.submitted_at,
          'marks', case when s.status = 'released' then s.marks else null end,
          'feedback', case when s.status = 'released' then s.feedback else null end
        )
        from public.submissions s
        where s.item_id = i.id and s.student_id = v_caller_id
      )
    ) order by i.created_at desc
  ), '[]'::json) into v_result
  from public.items i
  where i.batch_id = p_batch_id and i.published = true;

  return v_result;
end;
$$;

-- 8.6 get_public_library
create or replace function public.get_public_library()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid := auth.uid();
  v_grade text;
  v_subjects text[];
  v_result json;
begin
  if v_caller_id is not null then
    select grade, subjects into v_grade, v_subjects
    from public.profiles
    where id = v_caller_id;
  end if;

  select coalesce(json_agg(
    json_build_object(
      'id', i.id,
      'batch_id', i.batch_id,
      'batch_name', b.name,
      'tutor_name', p.full_name,
      'type', i.type,
      'title', i.title,
      'body', i.body,
      'access', i.access,
      'visibility', i.visibility,
      'grade', i.grade,
      'subject', i.subject,
      'due_at', i.due_at,
      'max_marks', i.max_marks,
      'created_at', i.created_at,
      'is_member', case
        when v_caller_id is null or i.batch_id is null then false
        else exists (
          select 1 from public.roster r
          where r.batch_id = i.batch_id
            and r.student_id = v_caller_id
            and r.status = 'joined'
        )
      end
    ) order by i.created_at desc
  ), '[]'::json) into v_result
  from public.items i
  left join public.batches b on b.id = i.batch_id
  join public.profiles p on p.id = i.tutor_id
  where i.published = true
    and i.visibility = 'public'
    and i.access = 'free'
    and (
      (v_grade is null and (v_subjects is null or cardinality(v_subjects) = 0))
      or (v_grade is not null and i.grade = v_grade)
      or (v_subjects is not null and i.subject = any(v_subjects))
      or not exists (
        select 1 from public.items i2
        where i2.published = true
          and i2.visibility = 'public'
          and i2.access = 'free'
          and (
            (v_grade is not null and i2.grade = v_grade)
            or (v_subjects is not null and i2.subject = any(v_subjects))
          )
      )
    );

  return v_result;
end;
$$;

-- 8.7 get_item_for_student
create or replace function public.get_item_for_student(p_item_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid := auth.uid();
  v_item record;
  v_can_view boolean := false;
  v_has_premium boolean := false;
  v_attempt record;
  v_submission record;
  v_quiz_keys jsonb;
  v_body jsonb;
  v_questions jsonb;
  v_augmented_questions jsonb := '[]'::jsonb;
  v_q jsonb;
  v_q_id text;
  v_correct_idx text;
begin
  if v_caller_id is null then
    raise exception 'Authentication required';
  end if;

  select * into v_item
  from public.items
  where id = p_item_id and published = true;

  if v_item.id is null then
    raise exception 'Item not found or not published';
  end if;

  -- Check view permissions:
  -- Case 1: Public free item
  if v_item.visibility = 'public' and v_item.access = 'free' then
    v_can_view := true;
  end if;

  -- Case 2: Batch item
  if v_item.batch_id is not null then
    if exists (
      select 1 from public.roster
      where batch_id = v_item.batch_id
        and student_id = v_caller_id
        and status = 'joined'
    ) then
      if v_item.access = 'free' then
        v_can_view := true;
      elsif v_item.access = 'premium' then
        if exists (
          select 1 from public.roster
          where batch_id = v_item.batch_id
            and student_id = v_caller_id
            and status = 'joined'
            and premium_until is not null
            and premium_until > now()
        ) then
          v_can_view := true;
          v_has_premium := true;
        end if;
      end if;
    end if;
  end if;

  if not v_can_view then
    raise exception 'Access denied to this item';
  end if;

  -- Fetch attempt if exists
  select * into v_attempt
  from public.attempts
  where item_id = p_item_id and student_id = v_caller_id;

  -- Fetch submission if exists
  select * into v_submission
  from public.submissions
  where item_id = p_item_id and student_id = v_caller_id;

  v_body := v_item.body;

  -- If item is a quiz:
  if v_item.type = 'quiz' then
    if v_attempt.id is not null then
      -- Student has attempted! Include correct answers and explanations from quiz_keys
      select answers into v_quiz_keys from public.quiz_keys where item_id = p_item_id;

      if v_body ? 'questions' then
        for v_q in select * from jsonb_array_elements(v_body->'questions') loop
          v_q_id := v_q->>'id';
          v_correct_idx := v_quiz_keys->>v_q_id;
          v_augmented_questions := v_augmented_questions || jsonb_build_array(
            v_q || jsonb_build_object('correct_option_index', v_correct_idx::int)
          );
        end loop;
        v_body := jsonb_set(v_body, '{questions}', v_augmented_questions);
      end if;
    end if;
  end if;

  return json_build_object(
    'id', v_item.id,
    'batch_id', v_item.batch_id,
    'tutor_id', v_item.tutor_id,
    'type', v_item.type,
    'title', v_item.title,
    'body', v_body,
    'access', v_item.access,
    'visibility', v_item.visibility,
    'grade', v_item.grade,
    'subject', v_item.subject,
    'due_at', v_item.due_at,
    'max_marks', v_item.max_marks,
    'created_at', v_item.created_at,
    'attempt', case
      when v_attempt.id is not null then json_build_object(
        'id', v_attempt.id,
        'answers', v_attempt.answers,
        'score', v_attempt.score,
        'total', v_attempt.total,
        'submitted_at', v_attempt.submitted_at
      )
      else null
    end,
    'submission', case
      when v_submission.id is not null then json_build_object(
        'id', v_submission.id,
        'text_answer', v_submission.text_answer,
        'link_url', v_submission.link_url,
        'status', v_submission.status,
        'marks', case when v_submission.status = 'released' then v_submission.marks else null end,
        'feedback', case when v_submission.status = 'released' then v_submission.feedback else null end,
        'submitted_at', v_submission.submitted_at,
        'released_at', v_submission.released_at
      )
      else null
    end
  );
end;
$$;

-- 8.8 submit_quiz
create or replace function public.submit_quiz(p_item_id uuid, p_answers jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid := auth.uid();
  v_caller_role user_role;
  v_item record;
  v_quiz_keys jsonb;
  v_questions jsonb;
  v_q jsonb;
  v_q_id text;
  v_q_marks numeric;
  v_correct_idx int;
  v_student_idx int;
  v_is_correct boolean;
  v_score numeric := 0;
  v_total numeric := 0;
  v_results jsonb := '[]'::jsonb;
  v_attempt_id uuid;
  v_can_access boolean := false;
begin
  if v_caller_id is null then
    raise exception 'Authentication required';
  end if;

  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role <> 'student' then
    raise exception 'Only students can submit quizzes';
  end if;

  select * into v_item
  from public.items
  where id = p_item_id and type = 'quiz' and published = true;

  if v_item.id is null then
    raise exception 'Quiz not found or not published';
  end if;

  -- Check access
  if v_item.visibility = 'public' and v_item.access = 'free' then
    v_can_access := true;
  elsif v_item.batch_id is not null then
    if exists (
      select 1 from public.roster
      where batch_id = v_item.batch_id and student_id = v_caller_id and status = 'joined'
    ) then
      if v_item.access = 'free' then
        v_can_access := true;
      elsif v_item.access = 'premium' and exists (
        select 1 from public.roster
        where batch_id = v_item.batch_id and student_id = v_caller_id and status = 'joined'
          and premium_until is not null and premium_until > now()
      ) then
        v_can_access := true;
      end if;
    end if;
  end if;

  if not v_can_access then
    raise exception 'Access denied to this quiz';
  end if;

  if exists (select 1 from public.attempts where item_id = p_item_id and student_id = v_caller_id) then
    raise exception 'Quiz already attempted';
  end if;

  select answers into v_quiz_keys
  from public.quiz_keys
  where item_id = p_item_id;

  if v_quiz_keys is null then
    raise exception 'Quiz key not found';
  end if;

  v_questions := v_item.body->'questions';

  if v_questions is not null and jsonb_typeof(v_questions) = 'array' then
    for v_q in select * from jsonb_array_elements(v_questions) loop
      v_q_id := v_q->>'id';
      v_q_marks := coalesce((v_q->>'marks')::numeric, 1);
      v_total := v_total + v_q_marks;

      v_correct_idx := (v_quiz_keys->>v_q_id)::int;
      v_student_idx := case when p_answers ? v_q_id then (p_answers->>v_q_id)::int else null end;

      if v_student_idx is not null and v_correct_idx is not null and v_student_idx = v_correct_idx then
        v_is_correct := true;
        v_score := v_score + v_q_marks;
      else
        v_is_correct := false;
      end if;

      v_results := v_results || jsonb_build_array(
        jsonb_build_object(
          'id', v_q_id,
          'is_correct', v_is_correct,
          'student_option_index', v_student_idx,
          'correct_option_index', v_correct_idx,
          'marks_awarded', case when v_is_correct then v_q_marks else 0 end,
          'max_marks', v_q_marks,
          'explanation', v_q->>'explanation'
        )
      );
    end loop;
  end if;

  insert into public.attempts (
    item_id,
    student_id,
    answers,
    score,
    total,
    submitted_at
  ) values (
    p_item_id,
    v_caller_id,
    p_answers,
    v_score,
    v_total,
    now()
  ) returning id into v_attempt_id;

  return json_build_object(
    'attempt_id', v_attempt_id,
    'score', v_score,
    'total', v_total,
    'results', v_results
  );
end;
$$;

-- 8.9 submit_assignment
create or replace function public.submit_assignment(p_item_id uuid, p_text text, p_link text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid := auth.uid();
  v_caller_role user_role;
  v_item record;
  v_can_access boolean := false;
  v_sub record;
  v_result_id uuid;
  v_sub_status submission_status;
begin
  if v_caller_id is null then
    raise exception 'Authentication required';
  end if;

  select role into v_caller_role from public.profiles where id = v_caller_id;
  if v_caller_role <> 'student' then
    raise exception 'Only students can submit assignments';
  end if;

  select * into v_item
  from public.items
  where id = p_item_id and type = 'assignment' and published = true;

  if v_item.id is null then
    raise exception 'Assignment not found or not published';
  end if;

  -- Validate due date: not more than 7 days past
  if v_item.due_at is not null and now() > (v_item.due_at + interval '7 days') then
    raise exception 'Submission window closed (more than 7 days past due date)';
  end if;

  -- Check access
  if v_item.visibility = 'public' and v_item.access = 'free' then
    v_can_access := true;
  elsif v_item.batch_id is not null then
    if exists (
      select 1 from public.roster
      where batch_id = v_item.batch_id and student_id = v_caller_id and status = 'joined'
    ) then
      if v_item.access = 'free' then
        v_can_access := true;
      elsif v_item.access = 'premium' and exists (
        select 1 from public.roster
        where batch_id = v_item.batch_id and student_id = v_caller_id and status = 'joined'
          and premium_until is not null and premium_until > now()
      ) then
        v_can_access := true;
      end if;
    end if;
  end if;

  if not v_can_access then
    raise exception 'Access denied to this assignment';
  end if;

  -- Check existing submission
  select * into v_sub
  from public.submissions
  where item_id = p_item_id and student_id = v_caller_id;

  if v_sub.id is not null then
    if v_sub.status in ('graded', 'released') then
      raise exception 'Assignment has already been graded and cannot be modified';
    end if;

    update public.submissions
    set text_answer = p_text,
        link_url = p_link,
        status = 'submitted',
        submitted_at = now()
    where id = v_sub.id
    returning id, status into v_result_id, v_sub_status;
  else
    insert into public.submissions (
      item_id,
      student_id,
      text_answer,
      link_url,
      status,
      submitted_at
    ) values (
      p_item_id,
      v_caller_id,
      p_text,
      p_link,
      'submitted',
      now()
    ) returning id, status into v_result_id, v_sub_status;
  end if;

  return json_build_object(
    'submission_id', v_result_id,
    'status', v_sub_status,
    'submitted_at', now()
  );
end;
$$;
