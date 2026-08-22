-- Account deletion is executed only by the authenticated delete-account Edge
-- Function. Restaurant attendance/history rows are de-identified instead of
-- destroyed so employers can retain records they may be legally required to keep.
create or replace function public.prepare_account_deletion(p_user_id uuid)
returns table (
  deletion_mode text,
  organization_name text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_organization_id uuid;
  target_organization_name text;
  target_role text;
  target_membership_count integer;
  target_owner_count integer;
  target_organization_member_count integer;
  deletion_time timestamptz := now();
begin
  if p_user_id is null then
    raise exception 'A user ID is required';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  select count(*)
  into target_membership_count
  from public.memberships
  where user_id = p_user_id;

  if target_membership_count > 1 then
    raise exception 'Accounts connected to multiple restaurants require support-assisted deletion';
  end if;

  select memberships.organization_id, memberships.role, organizations.name
  into target_organization_id, target_role, target_organization_name
  from public.memberships
  join public.organizations on organizations.id = memberships.organization_id
  where memberships.user_id = p_user_id
  limit 1
  for update of memberships, organizations;

  if target_role = 'owner' then
    select count(*) into target_owner_count
    from public.memberships
    where organization_id = target_organization_id
      and role = 'owner';

    select count(*) into target_organization_member_count
    from public.memberships
    where organization_id = target_organization_id;

    if target_owner_count = 1 and target_organization_member_count > 1 then
      raise exception 'Transfer ownership to another active member before deleting this owner account';
    end if;

    if target_owner_count = 1 and target_organization_member_count = 1 then
      delete from public.organizations where id = target_organization_id;
      delete from public.profiles where id = p_user_id;
      return query select 'workspace_deleted'::text, target_organization_name;
      return;
    end if;
  end if;

  -- Finish any active attendance state before removing the employee identity.
  update public.break_entries
  set ended_at = deletion_time
  where ended_at is null
    and exists (
      select 1
      from public.time_entries
      join public.employees on employees.id = time_entries.employee_id
      where time_entries.id = break_entries.time_entry_id
        and employees.user_id = p_user_id
    );

  update public.time_entries
  set clocked_out_at = deletion_time,
      updated_at = deletion_time
  where clocked_out_at is null
    and exists (
      select 1
      from public.employees
      where employees.id = time_entries.employee_id
        and employees.user_id = p_user_id
    );

  update public.employees
  set user_id = null,
      full_name = 'Former team member',
      email = null,
      phone = null,
      job_title = 'Former team member',
      hourly_rate_cents = null,
      employment_status = 'inactive',
      availability = '{}'::jsonb,
      updated_at = deletion_time
  where user_id = p_user_id;

  if target_organization_id is not null then
    insert into public.audit_events (
      organization_id,
      actor_user_id,
      entity_type,
      entity_id,
      action,
      after_data
    ) values (
      target_organization_id,
      p_user_id,
      'account',
      p_user_id,
      'deleted_and_deidentified',
      jsonb_build_object('completed_at', deletion_time)
    );
  end if;

  delete from public.memberships where user_id = p_user_id;
  delete from public.profiles where id = p_user_id;

  return query select 'account_deleted'::text, target_organization_name;
end;
$$;

revoke all on function public.prepare_account_deletion(uuid) from public, anon, authenticated;
grant execute on function public.prepare_account_deletion(uuid) to service_role;
