-- Broadcast only a safe invalidation message. Full employee, pay, and request
-- rows are never placed on the channel payload.
create or replace function private.broadcast_workspace_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_data jsonb;
  target_organization_id uuid;
begin
  row_data := case when TG_OP = 'DELETE' then to_jsonb(OLD) else to_jsonb(NEW) end;

  if TG_TABLE_NAME = 'organizations' then
    target_organization_id := (row_data ->> 'id')::uuid;
  elsif TG_TABLE_NAME = 'break_entries' then
    select organization_id
    into target_organization_id
    from public.time_entries
    where id = (row_data ->> 'time_entry_id')::uuid;
  else
    target_organization_id := (row_data ->> 'organization_id')::uuid;
  end if;

  if target_organization_id is not null then
    perform realtime.send(
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP
      ),
      'workspace_changed',
      'organization:' || target_organization_id::text,
      true
    );
  end if;

  return null;
end;
$$;

revoke all on function private.broadcast_workspace_change() from public, anon, authenticated;

create policy workspace_members_receive_broadcasts
  on realtime.messages
  for select
  to authenticated
  using (
    realtime.messages.extension = 'broadcast'
    and case
      when (select realtime.topic()) ~ '^organization:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      then (select private.is_org_member(split_part((select realtime.topic()), ':', 2)::uuid))
      else false
    end
  );

create trigger organizations_broadcast_workspace_change
  after update or delete on public.organizations
  for each row execute function private.broadcast_workspace_change();

create trigger memberships_broadcast_workspace_change
  after insert or update or delete on public.memberships
  for each row execute function private.broadcast_workspace_change();

create trigger locations_broadcast_workspace_change
  after insert or update or delete on public.locations
  for each row execute function private.broadcast_workspace_change();

create trigger employees_broadcast_workspace_change
  after insert or update or delete on public.employees
  for each row execute function private.broadcast_workspace_change();

create trigger shifts_broadcast_workspace_change
  after insert or update or delete on public.shifts
  for each row execute function private.broadcast_workspace_change();

create trigger time_entries_broadcast_workspace_change
  after insert or update or delete on public.time_entries
  for each row execute function private.broadcast_workspace_change();

create trigger break_entries_broadcast_workspace_change
  after insert or update or delete on public.break_entries
  for each row execute function private.broadcast_workspace_change();

create trigger staff_requests_broadcast_workspace_change
  after insert or update or delete on public.staff_requests
  for each row execute function private.broadcast_workspace_change();
