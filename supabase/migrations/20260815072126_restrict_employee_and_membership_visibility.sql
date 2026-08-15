-- Managers need the whole roster, while employees only need the workforce row
-- attached to their own Auth account. Employee rows contain private contact and
-- pay data, so organization membership alone must not grant roster-wide reads.
drop policy if exists employees_select_members on public.employees;
create policy employees_select_own_or_manager
  on public.employees for select to authenticated
  using (
    (select private.is_org_manager(organization_id))
    or user_id = (select auth.uid())
  );

-- Apply the same least-privilege boundary to authorization memberships.
-- Employees can inspect their own role; managers can administer the restaurant.
drop policy if exists memberships_select_members on public.memberships;
create policy memberships_select_own_or_manager
  on public.memberships for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.is_org_manager(organization_id))
  );
