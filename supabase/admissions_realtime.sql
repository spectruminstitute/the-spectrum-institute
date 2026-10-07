-- Online Admissions: instant updates in the admin dashboard
-- Run once in Supabase SQL Editor (project: ngcbflylskwrtugxfzgu)
--
-- Lets the admin dashboard hear about new rows in public.leads the moment
-- a student submits the admission form. Without this, the dashboard still
-- checks for new admissions every 45 seconds.
-- Row Level Security still applies: only logged-in admins (who can already
-- select leads) receive these events. Anonymous visitors receive nothing.

do $$
begin
    alter publication supabase_realtime add table public.leads;
exception
    when duplicate_object then null;
end $$;
