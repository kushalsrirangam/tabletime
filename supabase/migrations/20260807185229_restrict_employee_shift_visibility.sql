drop policy shifts_select_members on public.shifts;

create policy shifts_select_authorized
  on public.shifts for select to authenticated
  using (
    (select private.is_org_manager(organization_id))
    or (
      status = 'published'
      and exists (
        select 1
        from public.employees
        where employees.id = shifts.employee_id
          and employees.organization_id = shifts.organization_id
          and employees.user_id = (select auth.uid())
      )
    )
  );
