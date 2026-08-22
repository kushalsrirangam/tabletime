-- Route request writes through narrow security-definer functions. This keeps
-- approval fields out of the public client write surface while preserving RLS
-- for tenant-scoped reads.
revoke insert, update on public.staff_requests from authenticated;

drop policy if exists requests_insert_own on public.staff_requests;
drop policy if exists requests_update_own_pending on public.staff_requests;
drop policy if exists requests_manage_managers on public.staff_requests;

alter table public.staff_requests
  add constraint staff_requests_details_length_check
  check (details is null or char_length(details) <= 1000);

alter table public.staff_requests
  add constraint staff_requests_time_off_dates_check
  check (request_type <> 'time_off' or starts_on is not null);

create unique index staff_requests_pending_time_off_unique_idx
  on public.staff_requests (
    employee_id,
    starts_on,
    (coalesce(ends_on, starts_on))
  )
  where request_type = 'time_off' and status = 'pending';

create or replace function public.submit_time_off_request(
  p_organization_id uuid,
  p_starts_on date,
  p_ends_on date default null,
  p_details text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_user_id uuid := (select auth.uid());
  target_employee public.employees;
  normalized_ends_on date := coalesce(p_ends_on, p_starts_on);
  normalized_details text := nullif(btrim(coalesce(p_details, '')), '');
  created_request public.staff_requests;
begin
  if caller_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_organization_id is null or p_starts_on is null then
    raise exception 'Restaurant and start date are required';
  end if;

  if p_starts_on < current_date then
    raise exception 'Time-off requests must start today or later';
  end if;

  if normalized_ends_on < p_starts_on then
    raise exception 'End date cannot be before start date';
  end if;

  if normalized_ends_on - p_starts_on > 31 then
    raise exception 'Time-off requests cannot exceed 32 days';
  end if;

  if normalized_details is not null and char_length(normalized_details) > 1000 then
    raise exception 'Request note cannot exceed 1000 characters';
  end if;

  select employees.*
  into target_employee
  from public.employees
  where employees.organization_id = p_organization_id
    and employees.user_id = caller_user_id
    and employees.employment_status = 'active'
  limit 1;

  if target_employee.id is null then
    raise exception 'No active employee record for this restaurant';
  end if;

  begin
    insert into public.staff_requests (
      organization_id,
      employee_id,
      request_type,
      status,
      starts_on,
      ends_on,
      details
    ) values (
      target_employee.organization_id,
      target_employee.id,
      'time_off',
      'pending',
      p_starts_on,
      normalized_ends_on,
      normalized_details
    )
    returning * into created_request;
  exception
    when unique_violation then
      raise exception 'A pending time-off request already exists for these dates';
  end;

  insert into public.audit_events (
    organization_id,
    actor_user_id,
    entity_type,
    entity_id,
    action,
    after_data
  ) values (
    created_request.organization_id,
    caller_user_id,
    'staff_request',
    created_request.id,
    'submitted',
    to_jsonb(created_request)
  );

  return created_request.id;
end;
$$;

create or replace function public.review_staff_request(
  p_request_id uuid,
  p_decision text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_user_id uuid := (select auth.uid());
  existing_request public.staff_requests;
  reviewed_request public.staff_requests;
begin
  if caller_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_decision not in ('approved', 'declined') then
    raise exception 'Decision must be approved or declined';
  end if;

  select staff_requests.*
  into existing_request
  from public.staff_requests
  where staff_requests.id = p_request_id
  for update;

  if existing_request.id is null then
    raise exception 'Request not found';
  end if;

  if not (select private.is_org_manager(existing_request.organization_id)) then
    raise exception 'Only an owner or manager can review this request';
  end if;

  if existing_request.status <> 'pending' then
    raise exception 'Only pending requests can be reviewed';
  end if;

  update public.staff_requests
  set
    status = p_decision,
    reviewed_by = caller_user_id,
    reviewed_at = now()
  where id = existing_request.id
  returning * into reviewed_request;

  insert into public.audit_events (
    organization_id,
    actor_user_id,
    entity_type,
    entity_id,
    action,
    before_data,
    after_data
  ) values (
    reviewed_request.organization_id,
    caller_user_id,
    'staff_request',
    reviewed_request.id,
    p_decision,
    to_jsonb(existing_request),
    to_jsonb(reviewed_request)
  );

  return reviewed_request.id;
end;
$$;

revoke all on function public.submit_time_off_request(uuid, date, date, text) from public, anon;
revoke all on function public.review_staff_request(uuid, text) from public, anon;
grant execute on function public.submit_time_off_request(uuid, date, date, text) to authenticated;
grant execute on function public.review_staff_request(uuid, text) to authenticated;
