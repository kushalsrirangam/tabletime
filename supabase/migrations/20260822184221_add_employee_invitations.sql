-- Complete the privileged half of an employee invitation atomically after the
-- Edge Function creates the Auth user. Only the service role can execute this
-- function; public clients never receive service-role credentials.
create or replace function public.finalize_employee_invitation(
  p_target_employee_id uuid,
  p_invited_user_id uuid,
  p_actor_user_id uuid
)
returns table (
  employee_id uuid,
  organization_id uuid,
  invited_email text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_employee public.employees;
  auth_email text;
begin
  if p_target_employee_id is null or p_invited_user_id is null or p_actor_user_id is null then
    raise exception 'Invitation identifiers are required';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_target_employee_id::text, 0)
  );

  select employees.* into target_employee
  from public.employees
  where employees.id = p_target_employee_id
  for update;

  if target_employee.id is null then
    raise exception 'Employee not found';
  end if;

  if target_employee.user_id is not null then
    raise exception 'An app account is already connected to this employee';
  end if;

  if target_employee.email is null or trim(target_employee.email) = '' then
    raise exception 'A work email is required before inviting this employee';
  end if;

  if not exists (
    select 1
    from public.memberships
    where memberships.organization_id = target_employee.organization_id
      and memberships.user_id = p_actor_user_id
      and memberships.role in ('owner', 'manager')
  ) then
    raise exception 'Only an owner or manager can invite employees';
  end if;

  if exists (
    select 1
    from public.memberships
    where memberships.user_id = p_invited_user_id
  ) then
    raise exception 'This Auth account already belongs to a restaurant';
  end if;

  select lower(trim(users.email)) into auth_email
  from auth.users
  where users.id = p_invited_user_id;

  if auth_email is null then
    raise exception 'Invited Auth user not found';
  end if;

  if auth_email <> lower(trim(target_employee.email)) then
    raise exception 'The invited Auth email does not match the employee work email';
  end if;

  insert into public.memberships (organization_id, user_id, role)
  values (target_employee.organization_id, p_invited_user_id, 'employee');

  update public.employees
  set user_id = p_invited_user_id,
      employment_status = 'invited'
  where id = target_employee.id;

  insert into public.audit_events (
    organization_id,
    actor_user_id,
    entity_type,
    entity_id,
    action,
    before_data,
    after_data
  ) values (
    target_employee.organization_id,
    p_actor_user_id,
    'employee',
    target_employee.id,
    'employee_invited',
    jsonb_build_object('employment_status', target_employee.employment_status),
    jsonb_build_object('employment_status', 'invited', 'user_id', p_invited_user_id)
  );

  return query
  select target_employee.id, target_employee.organization_id, auth_email;
end;
$$;

revoke all on function public.finalize_employee_invitation(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.finalize_employee_invitation(uuid, uuid, uuid) to service_role;

-- Invited employees call this after setting their password. It is idempotent
-- for an already-active account and can only activate the employee row attached
-- to the current authenticated user.
create or replace function public.accept_employee_invitation()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_user_id uuid := (select auth.uid());
  target_employee public.employees;
begin
  if caller_user_id is null then
    raise exception 'Authentication required';
  end if;

  select employees.* into target_employee
  from public.employees
  where employees.user_id = caller_user_id
  order by employees.created_at
  limit 1
  for update;

  if target_employee.id is null then
    raise exception 'No employee invitation is connected to this account';
  end if;

  if not exists (
    select 1
    from public.memberships
    where memberships.organization_id = target_employee.organization_id
      and memberships.user_id = caller_user_id
      and memberships.role = 'employee'
  ) then
    raise exception 'No employee membership is connected to this invitation';
  end if;

  if target_employee.employment_status = 'inactive' then
    raise exception 'This employee account is inactive';
  end if;

  if target_employee.employment_status = 'invited' then
    update public.employees
    set employment_status = 'active'
    where id = target_employee.id;

    insert into public.audit_events (
      organization_id,
      actor_user_id,
      entity_type,
      entity_id,
      action,
      before_data,
      after_data
    ) values (
      target_employee.organization_id,
      caller_user_id,
      'employee',
      target_employee.id,
      'employee_invitation_accepted',
      jsonb_build_object('employment_status', 'invited'),
      jsonb_build_object('employment_status', 'active')
    );
  end if;

  return target_employee.id;
end;
$$;

revoke all on function public.accept_employee_invitation() from public, anon;
grant execute on function public.accept_employee_invitation() to authenticated;
