-- The restored hosted project currently has no realtime.messages partitions,
-- so private Broadcast writes are discarded by the platform-owned send helper.
-- Use RLS-protected Postgres Changes as the reliable restaurant-scale fallback.
drop trigger if exists organizations_broadcast_workspace_change on public.organizations;
drop trigger if exists memberships_broadcast_workspace_change on public.memberships;
drop trigger if exists locations_broadcast_workspace_change on public.locations;
drop trigger if exists employees_broadcast_workspace_change on public.employees;
drop trigger if exists shifts_broadcast_workspace_change on public.shifts;
drop trigger if exists time_entries_broadcast_workspace_change on public.time_entries;
drop trigger if exists break_entries_broadcast_workspace_change on public.break_entries;
drop trigger if exists staff_requests_broadcast_workspace_change on public.staff_requests;

drop policy if exists workspace_members_receive_broadcasts on realtime.messages;
drop function if exists private.broadcast_workspace_change();

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'organizations',
    'memberships',
    'locations',
    'employees',
    'shifts',
    'time_entries',
    'break_entries',
    'staff_requests'
  ] loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = target_table
    ) then
      execute format('alter publication supabase_realtime add table public.%I', target_table);
    end if;
  end loop;
end;
$$;
