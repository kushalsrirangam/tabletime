-- Employee records are retained for schedule, time-entry, and request history.
-- Managers deactivate staff instead of deleting them from the client.
drop policy if exists employees_delete_managers on public.employees;
revoke delete on public.employees from authenticated;

-- Normalized work email addresses must be unique inside each restaurant. This
-- prevents ambiguous employee-to-account linking when invitations are added.
create unique index if not exists employees_org_normalized_email_idx
  on public.employees (organization_id, lower(btrim(email)))
  where email is not null and btrim(email) <> '';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'employees_full_name_nonblank_check'
      and conrelid = 'public.employees'::regclass
  ) then
    alter table public.employees
      add constraint employees_full_name_nonblank_check
      check (char_length(btrim(full_name)) between 2 and 120);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'employees_job_title_length_check'
      and conrelid = 'public.employees'::regclass
  ) then
    alter table public.employees
      add constraint employees_job_title_length_check
      check (char_length(btrim(job_title)) between 1 and 80);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'employees_email_format_check'
      and conrelid = 'public.employees'::regclass
  ) then
    alter table public.employees
      add constraint employees_email_format_check
      check (
        email is null
        or (
          email = btrim(email)
          and char_length(email) between 3 and 254
          and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
        )
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'employees_phone_length_check'
      and conrelid = 'public.employees'::regclass
  ) then
    alter table public.employees
      add constraint employees_phone_length_check
      check (phone is null or char_length(btrim(phone)) between 3 and 40);
  end if;
end
$$;
