-- Migration 0002: Optional RPC helper for granting batch premium
create or replace function public.grant_batch_premium(p_batch_id uuid, p_student_id uuid, p_days integer default 30)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_until timestamptz;
begin
  update public.roster
  set premium_until = greatest(now(), coalesce(premium_until, now())) + (p_days || ' days')::interval
  where batch_id = p_batch_id and student_id = p_student_id
  returning premium_until into v_new_until;

  return v_new_until;
end;
$$;
