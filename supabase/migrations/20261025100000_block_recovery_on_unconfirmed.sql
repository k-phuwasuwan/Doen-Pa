-- GoTrue verifies a recovery token in two updates: it clears recovery_token first,
-- then sets email_confirmed_at. The earlier trigger looked for both in one update
-- and never matched. Reject the first update instead: a recovery token consumed
-- while the email is still unconfirmed. Confirmed users and signup confirmation
-- (which leaves recovery_token alone) are unaffected.
create or replace function public.block_recovery_email_confirmation()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.email_confirmed_at is null
     and coalesce(old.recovery_token, '') <> ''
     and coalesce(new.recovery_token, '') = '' then
    raise exception 'Email must be confirmed with the signup link' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger block_recovery_email_confirmation on auth.users;
create trigger block_recovery_email_confirmation
before update of recovery_token on auth.users
for each row execute function public.block_recovery_email_confirmation();
