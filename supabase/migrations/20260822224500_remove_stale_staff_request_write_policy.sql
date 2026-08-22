-- A prior hardening migration renamed the broad request update policy. Direct
-- writes are now intentionally revoked and all changes go through audited RPCs.
drop policy if exists requests_update_manager_or_owner on public.staff_requests;
