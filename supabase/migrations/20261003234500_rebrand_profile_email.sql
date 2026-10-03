-- Add the generic campus identity field used by the rebranded application.
alter table public.profiles
  add column if not exists campus_email text;

create index if not exists profiles_campus_email_idx
  on public.profiles (campus_email);
