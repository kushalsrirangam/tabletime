create unique index one_open_break_per_time_entry_idx
  on public.break_entries (time_entry_id)
  where ended_at is null;

create or replace function public.start_break()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_user_id uuid := (select auth.uid());
  target_entry public.time_entries;
  created_break public.break_entries;
begin
  if caller_user_id is null then
    raise exception 'Authentication required';
  end if;

  select time_entries.*
  into target_entry
  from public.time_entries
  join public.employees on employees.id = time_entries.employee_id
  where employees.user_id = caller_user_id
    and employees.employment_status = 'active'
    and time_entries.clocked_out_at is null
  order by time_entries.clocked_in_at desc
  limit 1
  for update of time_entries;

  if target_entry.id is null then
    raise exception 'No open time entry';
  end if;

  begin
    insert into public.break_entries (time_entry_id, started_at, paid)
    values (target_entry.id, now(), false)
    returning * into created_break;
  exception
    when unique_violation then
      raise exception 'A break is already in progress';
  end;

  insert into public.audit_events (
    organization_id,
    actor_user_id,
    entity_type,
    entity_id,
    action,
    after_data
  ) values (
    target_entry.organization_id,
    caller_user_id,
    'break_entry',
    created_break.id,
    'started',
    to_jsonb(created_break)
  );

  return created_break.id;
end;
$$;

create or replace function public.end_break()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_user_id uuid := (select auth.uid());
  target_break public.break_entries;
  ended_break public.break_entries;
  target_organization_id uuid;
begin
  if caller_user_id is null then
    raise exception 'Authentication required';
  end if;

  select break_entries.*
  into target_break
  from public.break_entries
  join public.time_entries on time_entries.id = break_entries.time_entry_id
  join public.employees on employees.id = time_entries.employee_id
  where employees.user_id = caller_user_id
    and employees.employment_status = 'active'
    and time_entries.clocked_out_at is null
    and break_entries.ended_at is null
  order by break_entries.started_at desc
  limit 1
  for update of break_entries;

  if target_break.id is null then
    raise exception 'No open break';
  end if;

  select organization_id
  into target_organization_id
  from public.time_entries
  where id = target_break.time_entry_id;

  update public.break_entries
  set ended_at = now()
  where id = target_break.id
  returning * into ended_break;

  insert into public.audit_events (
    organization_id,
    actor_user_id,
    entity_type,
    entity_id,
    action,
    before_data,
    after_data
  ) values (
    target_organization_id,
    caller_user_id,
    'break_entry',
    ended_break.id,
    'ended',
    to_jsonb(target_break),
    to_jsonb(ended_break)
  );

  return ended_break.id;
end;
$$;

-- Clock-out closes an in-progress break at the same server timestamp so an
-- interrupted client cannot leave an impossible open break on a closed shift.
create or replace function public.clock_out()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_user_id uuid := (select auth.uid());
  target_entry public.time_entries;
  open_break public.break_entries;
  ended_break public.break_entries;
  action_time timestamptz := now();
begin
  if caller_user_id is null then
    raise exception 'Authentication required';
  end if;

  select time_entries.*
  into target_entry
  from public.time_entries
  join public.employees on employees.id = time_entries.employee_id
  where employees.user_id = caller_user_id
    and time_entries.clocked_out_at is null
  order by time_entries.clocked_in_at desc
  limit 1
  for update of time_entries;

  if target_entry.id is null then
    raise exception 'No open time entry';
  end if;

  select break_entries.*
  into open_break
  from public.break_entries
  where break_entries.time_entry_id = target_entry.id
    and break_entries.ended_at is null
  for update;

  if open_break.id is not null then
    update public.break_entries
    set ended_at = action_time
    where id = open_break.id
    returning * into ended_break;

    insert into public.audit_events (
      organization_id,
      actor_user_id,
      entity_type,
      entity_id,
      action,
      before_data,
      after_data
    ) values (
      target_entry.organization_id,
      caller_user_id,
      'break_entry',
      ended_break.id,
      'ended_on_clock_out',
      to_jsonb(open_break),
      to_jsonb(ended_break)
    );
  end if;

  update public.time_entries
  set clocked_out_at = action_time
  where id = target_entry.id;

  return target_entry.id;
end;
$$;

revoke all on function public.start_break() from public, anon;
revoke all on function public.end_break() from public, anon;
revoke all on function public.clock_out() from public, anon;
grant execute on function public.start_break() to authenticated;
grant execute on function public.end_break() to authenticated;
grant execute on function public.clock_out() to authenticated;
