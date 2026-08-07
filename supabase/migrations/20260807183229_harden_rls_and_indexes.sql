-- Keep the public clock RPCs callable only by signed-in users. PostgreSQL grants
-- function execution to PUBLIC by default, so revoke both inherited and explicit
-- anonymous access before granting the narrow authenticated API.
revoke execute on function public.clock_in(uuid, numeric, numeric) from public, anon;
revoke execute on function public.clock_out() from public, anon;
grant execute on function public.clock_in(uuid, numeric, numeric) to authenticated;
grant execute on function public.clock_out() to authenticated;

-- Cover foreign-key joins and tenant-scoped lookups that are not satisfied by
-- the timeline/search indexes in the initial schema.
create index audit_events_actor_user_idx
  on public.audit_events (actor_user_id)
  where actor_user_id is not null;
create index employees_location_org_idx
  on public.employees (primary_location_id, organization_id)
  where primary_location_id is not null;
create index shifts_created_by_idx
  on public.shifts (created_by)
  where created_by is not null;
create index shifts_employee_org_idx
  on public.shifts (employee_id, organization_id);
create index shifts_location_org_idx
  on public.shifts (location_id, organization_id);
create index staff_requests_employee_org_idx
  on public.staff_requests (employee_id, organization_id);
create index staff_requests_reviewed_by_idx
  on public.staff_requests (reviewed_by)
  where reviewed_by is not null;
create index time_entries_corrected_by_idx
  on public.time_entries (corrected_by)
  where corrected_by is not null;
create index time_entries_employee_org_idx
  on public.time_entries (employee_id, organization_id);
create index time_entries_location_org_idx
  on public.time_entries (location_id, organization_id);

-- Avoid overlapping SELECT policies. The initial manager FOR ALL policies also
-- acted as SELECT policies, even though every organization member already has a
-- dedicated SELECT policy.
drop policy memberships_manage_owners on public.memberships;
create policy memberships_insert_managers
  on public.memberships for insert to authenticated
  with check ((select private.is_org_manager(organization_id)));
create policy memberships_update_managers
  on public.memberships for update to authenticated
  using ((select private.is_org_manager(organization_id)))
  with check ((select private.is_org_manager(organization_id)));
create policy memberships_delete_managers
  on public.memberships for delete to authenticated
  using ((select private.is_org_manager(organization_id)));

drop policy locations_manage_managers on public.locations;
create policy locations_insert_managers
  on public.locations for insert to authenticated
  with check ((select private.is_org_manager(organization_id)));
create policy locations_update_managers
  on public.locations for update to authenticated
  using ((select private.is_org_manager(organization_id)))
  with check ((select private.is_org_manager(organization_id)));
create policy locations_delete_managers
  on public.locations for delete to authenticated
  using ((select private.is_org_manager(organization_id)));

drop policy employees_manage_managers on public.employees;
create policy employees_insert_managers
  on public.employees for insert to authenticated
  with check ((select private.is_org_manager(organization_id)));
create policy employees_update_managers
  on public.employees for update to authenticated
  using ((select private.is_org_manager(organization_id)))
  with check ((select private.is_org_manager(organization_id)));
create policy employees_delete_managers
  on public.employees for delete to authenticated
  using ((select private.is_org_manager(organization_id)));

drop policy shifts_manage_managers on public.shifts;
create policy shifts_insert_managers
  on public.shifts for insert to authenticated
  with check ((select private.is_org_manager(organization_id)));
create policy shifts_update_managers
  on public.shifts for update to authenticated
  using ((select private.is_org_manager(organization_id)))
  with check ((select private.is_org_manager(organization_id)));
create policy shifts_delete_managers
  on public.shifts for delete to authenticated
  using ((select private.is_org_manager(organization_id)));

-- A single UPDATE policy handles both manager review and employee cancellation,
-- preventing PostgreSQL from evaluating two permissive policies per request.
drop policy requests_update_own_pending on public.staff_requests;
drop policy requests_manage_managers on public.staff_requests;
create policy requests_update_manager_or_owner
  on public.staff_requests for update to authenticated
  using (
    (select private.is_org_manager(organization_id))
    or (
      status = 'pending'
      and exists (
        select 1
        from public.employees
        where employees.id = staff_requests.employee_id
          and employees.user_id = (select auth.uid())
      )
    )
  )
  with check (
    (select private.is_org_manager(organization_id))
    or (
      status in ('pending', 'cancelled')
      and exists (
        select 1
        from public.employees
        where employees.id = staff_requests.employee_id
          and employees.user_id = (select auth.uid())
      )
    )
  );
