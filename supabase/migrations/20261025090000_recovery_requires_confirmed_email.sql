-- A password-recovery link must not double as email confirmation. GoTrue marks the
-- email confirmed whenever a recovery token is verified; reject that transition so
-- only the signup confirmation link can confirm a new account. Admin-confirmed and
-- signup-confirmed users are unaffected because their recovery token is left alone.
create function public.block_recovery_email_confirmation()
returns trigger language plpgsql set search_path = '' as $$
begin
  if old.email_confirmed_at is null
     and new.email_confirmed_at is not null
     and coalesce(old.recovery_token, '') <> ''
     and coalesce(new.recovery_token, '') = '' then
    raise exception 'Email must be confirmed with the signup link' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger block_recovery_email_confirmation
before update of email_confirmed_at, recovery_token on auth.users
for each row execute function public.block_recovery_email_confirmation();
