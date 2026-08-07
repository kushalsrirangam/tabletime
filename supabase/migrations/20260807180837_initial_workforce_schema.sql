create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  timezone text not null default 'America/Chicago',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 120),
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'employee')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  address text,
  timezone text not null default 'America/Chicago',
  latitude numeric(9,6),
  longitude numeric(9,6),
  geofence_radius_meters integer not null default 150 check (geofence_radius_meters between 25 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id)
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  primary_location_id uuid,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text,
  phone text,
  job_title text not null,
  hourly_rate_cents integer check (hourly_rate_cents >= 0),
  employment_status text not null default 'active' check (employment_status in ('invited', 'active', 'inactive')),
  availability jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id),
  unique (id, organization_id),
  foreign key (primary_location_id, organization_id) references public.locations(id, organization_id) on delete restrict
);

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid not null,
  employee_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  position text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'cancelled')),
  notes text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  foreign key (location_id, organization_id) references public.locations(id, organization_id) on delete cascade,
  foreign key (employee_id, organization_id) references public.employees(id, organization_id) on delete cascade
);

create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  location_id uuid not null,
  employee_id uuid not null,
  clocked_in_at timestamptz not null default now(),
  clocked_out_at timestamptz,
  source text not null default 'mobile' check (source in ('mobile', 'kiosk', 'manager', 'import')),
  latitude numeric(9,6),
  longitude numeric(9,6),
  notes text,
  corrected_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (clocked_out_at is null or clocked_out_at >= clocked_in_at),
  foreign key (location_id, organization_id) references public.locations(id, organization_id) on delete restrict,
  foreign key (employee_id, organization_id) references public.employees(id, organization_id) on delete restrict
);

create table public.break_entries (
  id uuid primary key default gen_random_uuid(),
  time_entry_id uuid not null references public.time_entries(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  paid boolean not null default false,
  created_at timestamptz not null default now(),
  check (ended_at is null or ended_at >= started_at)
);

create table public.staff_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null,
  request_type text not null check (request_type in ('time_off', 'shift_swap', 'missed_punch')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined', 'cancelled')),
  starts_on date,
  ends_on date,
  details text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on),
  foreign key (employee_id, organization_id) references public.employees(id, organization_id) on delete cascade
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index memberships_user_org_idx on public.memberships (user_id, organization_id);
create index locations_org_idx on public.locations (organization_id);
create index employees_org_status_idx on public.employees (organization_id, employment_status);
create index employees_location_idx on public.employees (primary_location_id) where primary_location_id is not null;
create index employees_user_idx on public.employees (user_id) where user_id is not null;
create index shifts_org_start_idx on public.shifts (organization_id, starts_at);
create index shifts_employee_start_idx on public.shifts (employee_id, starts_at);
create index shifts_location_start_idx on public.shifts (location_id, starts_at);
create index time_entries_org_clock_idx on public.time_entries (organization_id, clocked_in_at desc);
create index time_entries_location_clock_idx on public.time_entries (location_id, clocked_in_at desc);
create index time_entries_employee_clock_idx on public.time_entries (employee_id, clocked_in_at desc);
create unique index one_open_time_entry_per_employee_idx on public.time_entries (employee_id) where clocked_out_at is null;
create index break_entries_time_entry_idx on public.break_entries (time_entry_id);
create index staff_requests_org_status_idx on public.staff_requests (organization_id, status, created_at desc);
create index staff_requests_employee_created_idx on public.staff_requests (employee_id, created_at desc);
create index audit_events_org_created_idx on public.audit_events (organization_id, created_at desc);

create or replace function private.is_org_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships
    where organization_id = target_organization_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function private.is_org_manager(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships
    where organization_id = target_organization_id
      and user_id = (select auth.uid())
      and role in ('owner', 'manager')
  );
$$;

revoke all on function private.is_org_member(uuid) from public;
revoke all on function private.is_org_manager(uuid) from public;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.is_org_manager(uuid) to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1), 'Team member')
  );
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

create trigger organizations_set_updated_at before update on public.organizations for each row execute function private.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles for each row execute function private.set_updated_at();
create trigger locations_set_updated_at before update on public.locations for each row execute function private.set_updated_at();
create trigger employees_set_updated_at before update on public.employees for each row execute function private.set_updated_at();
create trigger shifts_set_updated_at before update on public.shifts for each row execute function private.set_updated_at();
create trigger time_entries_set_updated_at before update on public.time_entries for each row execute function private.set_updated_at();
create trigger staff_requests_set_updated_at before update on public.staff_requests for each row execute function private.set_updated_at();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.locations enable row level security;
alter table public.employees enable row level security;
alter table public.shifts enable row level security;
alter table public.time_entries enable row level security;
alter table public.break_entries enable row level security;
alter table public.staff_requests enable row level security;
alter table public.audit_events enable row level security;

create policy organizations_select_members on public.organizations for select to authenticated using ((select private.is_org_member(id)));
create policy organizations_update_owners on public.organizations for update to authenticated using ((select private.is_org_manager(id))) with check ((select private.is_org_manager(id)));
create policy profiles_select_self on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_update_self on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy memberships_select_members on public.memberships for select to authenticated using ((select private.is_org_member(organization_id)));
create policy memberships_manage_owners on public.memberships for all to authenticated using ((select private.is_org_manager(organization_id))) with check ((select private.is_org_manager(organization_id)));
create policy locations_select_members on public.locations for select to authenticated using ((select private.is_org_member(organization_id)));
create policy locations_manage_managers on public.locations for all to authenticated using ((select private.is_org_manager(organization_id))) with check ((select private.is_org_manager(organization_id)));
create policy employees_select_members on public.employees for select to authenticated using ((select private.is_org_member(organization_id)));
create policy employees_manage_managers on public.employees for all to authenticated using ((select private.is_org_manager(organization_id))) with check ((select private.is_org_manager(organization_id)));
create policy shifts_select_members on public.shifts for select to authenticated using ((select private.is_org_member(organization_id)));
create policy shifts_manage_managers on public.shifts for all to authenticated using ((select private.is_org_manager(organization_id))) with check ((select private.is_org_manager(organization_id)));
create policy time_entries_select_own_or_manager on public.time_entries for select to authenticated using (
  (select private.is_org_manager(organization_id)) or exists (
    select 1 from public.employees where employees.id = time_entries.employee_id and employees.user_id = (select auth.uid())
  )
);
create policy time_entries_manage_managers on public.time_entries for update to authenticated using ((select private.is_org_manager(organization_id))) with check ((select private.is_org_manager(organization_id)));
create policy breaks_select_own_or_manager on public.break_entries for select to authenticated using (
  exists (
    select 1 from public.time_entries
    join public.employees on employees.id = time_entries.employee_id
    where time_entries.id = break_entries.time_entry_id
      and (employees.user_id = (select auth.uid()) or (select private.is_org_manager(time_entries.organization_id)))
  )
);
create policy requests_select_own_or_manager on public.staff_requests for select to authenticated using (
  (select private.is_org_manager(organization_id)) or exists (
    select 1 from public.employees where employees.id = staff_requests.employee_id and employees.user_id = (select auth.uid())
  )
);
create policy requests_insert_own on public.staff_requests for insert to authenticated with check (
  exists (select 1 from public.employees where employees.id = staff_requests.employee_id and employees.user_id = (select auth.uid()))
);
create policy requests_update_own_pending on public.staff_requests for update to authenticated using (
  status = 'pending' and exists (select 1 from public.employees where employees.id = staff_requests.employee_id and employees.user_id = (select auth.uid()))
) with check (
  status in ('pending', 'cancelled') and exists (select 1 from public.employees where employees.id = staff_requests.employee_id and employees.user_id = (select auth.uid()))
);
create policy requests_manage_managers on public.staff_requests for update to authenticated using ((select private.is_org_manager(organization_id))) with check ((select private.is_org_manager(organization_id)));
create policy audit_select_managers on public.audit_events for select to authenticated using ((select private.is_org_manager(organization_id)));

revoke all on all tables in schema public from anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.organizations, public.memberships, public.locations, public.employees to authenticated;
grant update on public.organizations to authenticated;
grant insert, update, delete on public.memberships, public.locations, public.employees, public.shifts to authenticated;
grant select on public.shifts, public.time_entries, public.break_entries, public.staff_requests, public.audit_events to authenticated;
grant insert, update on public.staff_requests to authenticated;

create or replace function public.clock_in(
  target_location_id uuid,
  punch_latitude numeric default null,
  punch_longitude numeric default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_employee public.employees;
  created_entry_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  select employees.* into target_employee
  from public.employees
  join public.locations on locations.id = target_location_id
  where employees.user_id = (select auth.uid())
    and employees.organization_id = locations.organization_id
    and employees.employment_status = 'active'
  limit 1;

  if target_employee.id is null then
    raise exception 'No active employee record for this location';
  end if;

  insert into public.time_entries (organization_id, location_id, employee_id, clocked_in_at, latitude, longitude)
  values (target_employee.organization_id, target_location_id, target_employee.id, now(), punch_latitude, punch_longitude)
  returning id into created_entry_id;

  return created_entry_id;
end;
$$;

create or replace function public.clock_out()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_entry_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  select time_entries.id into target_entry_id
  from public.time_entries
  join public.employees on employees.id = time_entries.employee_id
  where employees.user_id = (select auth.uid())
    and time_entries.clocked_out_at is null
  order by time_entries.clocked_in_at desc
  limit 1
  for update of time_entries;

  if target_entry_id is null then
    raise exception 'No open time entry';
  end if;

  update public.time_entries set clocked_out_at = now() where id = target_entry_id;
  return target_entry_id;
end;
$$;

revoke all on function public.clock_in(uuid, numeric, numeric) from public;
revoke all on function public.clock_out() from public;
grant execute on function public.clock_in(uuid, numeric, numeric) to authenticated;
grant execute on function public.clock_out() to authenticated;
