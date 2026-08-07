create or replace function public.bootstrap_owner(
  restaurant_name text,
  location_name text,
  owner_full_name text,
  owner_job_title text default 'Owner',
  restaurant_timezone text default 'America/Chicago',
  location_address text default null
)
returns table (
  organization_id uuid,
  location_id uuid,
  employee_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_user_id uuid := (select auth.uid());
  caller_email text;
  normalized_restaurant_name text := trim(restaurant_name);
  normalized_location_name text := trim(location_name);
  normalized_owner_name text := trim(owner_full_name);
  normalized_job_title text := trim(owner_job_title);
  normalized_address text := nullif(trim(location_address), '');
  base_slug text;
  available_slug text;
  created_organization_id uuid;
  created_location_id uuid;
  created_employee_id uuid;
begin
  if caller_user_id is null then
    raise exception 'Authentication required';
  end if;

  -- Serialize onboarding attempts for one account so retries cannot create two
  -- organizations before the membership check sees the first transaction.
  perform pg_advisory_xact_lock(hashtext(caller_user_id::text));

  if exists (select 1 from public.memberships where user_id = caller_user_id) then
    raise exception 'This account already belongs to a restaurant';
  end if;

  if char_length(normalized_restaurant_name) not between 2 and 120 then
    raise exception 'Restaurant name must be between 2 and 120 characters';
  end if;
  if char_length(normalized_location_name) not between 2 and 120 then
    raise exception 'Location name must be between 2 and 120 characters';
  end if;
  if char_length(normalized_owner_name) not between 2 and 120 then
    raise exception 'Owner name must be between 2 and 120 characters';
  end if;
  if char_length(normalized_job_title) not between 2 and 120 then
    raise exception 'Job title must be between 2 and 120 characters';
  end if;
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = restaurant_timezone) then
    raise exception 'Unknown timezone';
  end if;

  select email into caller_email from auth.users where id = caller_user_id;

  base_slug := trim(both '-' from regexp_replace(lower(normalized_restaurant_name), '[^a-z0-9]+', '-', 'g'));
  if base_slug = '' then
    base_slug := 'restaurant';
  end if;
  available_slug := base_slug;
  while exists (select 1 from public.organizations where slug = available_slug) loop
    available_slug := base_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  end loop;

  insert into public.organizations (name, slug, timezone)
  values (normalized_restaurant_name, available_slug, restaurant_timezone)
  returning id into created_organization_id;

  insert into public.locations (organization_id, name, address, timezone)
  values (created_organization_id, normalized_location_name, normalized_address, restaurant_timezone)
  returning id into created_location_id;

  insert into public.memberships (organization_id, user_id, role)
  values (created_organization_id, caller_user_id, 'owner');

  insert into public.profiles (id, full_name)
  values (caller_user_id, normalized_owner_name)
  on conflict (id) do update set full_name = excluded.full_name;

  insert into public.employees (
    organization_id,
    primary_location_id,
    user_id,
    full_name,
    email,
    job_title,
    employment_status
  ) values (
    created_organization_id,
    created_location_id,
    caller_user_id,
    normalized_owner_name,
    caller_email,
    normalized_job_title,
    'active'
  ) returning id into created_employee_id;

  insert into public.audit_events (
    organization_id,
    actor_user_id,
    entity_type,
    entity_id,
    action,
    after_data
  ) values (
    created_organization_id,
    caller_user_id,
    'organization',
    created_organization_id,
    'owner_bootstrap',
    jsonb_build_object('location_id', created_location_id, 'employee_id', created_employee_id)
  );

  return query select created_organization_id, created_location_id, created_employee_id;
end;
$$;

revoke execute on function public.bootstrap_owner(text, text, text, text, text, text) from public, anon;
grant execute on function public.bootstrap_owner(text, text, text, text, text, text) to authenticated;
