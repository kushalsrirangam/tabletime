-- The public client can edit workforce details, but cannot attach auth users,
-- move records between tenants, or change database-managed identifiers/times.
revoke insert, update on public.employees from authenticated;

grant insert (
  organization_id,
  primary_location_id,
  full_name,
  email,
  phone,
  job_title,
  hourly_rate_cents,
  employment_status,
  availability
) on public.employees to authenticated;

grant update (
  primary_location_id,
  full_name,
  email,
  phone,
  job_title,
  hourly_rate_cents,
  employment_status,
  availability
) on public.employees to authenticated;

-- Keep managers from accidentally deactivating the employee profile attached
-- to their own active session. Another owner/manager can manage that record.
drop policy if exists employees_update_managers on public.employees;
create policy employees_update_managers
  on public.employees for update to authenticated
  using ((select private.is_org_manager(organization_id)))
  with check (
    (select private.is_org_manager(organization_id))
    and (
      user_id is distinct from (select auth.uid())
      or employment_status <> 'inactive'
    )
  );
