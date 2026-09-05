-- Quick upgrade: add assessment status for existing Spectrum Institute projects
-- Run in Supabase SQL Editor if you already applied the earlier institute_schema.sql

alter table public.assessments
    add column if not exists status varchar(20);

update public.assessments
   set status = 'passed'
 where status is null or btrim(status) = '';

alter table public.assessments
    alter column status set default 'passed';

do $$
begin
    begin
        alter table public.assessments
            alter column status set not null;
    exception when others then
        null;
    end;

    if not exists (
        select 1 from pg_constraint
        where conname = 'assessments_status_check'
          and conrelid = 'public.assessments'::regclass
    ) then
        alter table public.assessments
            add constraint assessments_status_check
            check (status in ('in_progress', 'passed', 'failed'));
    end if;
end $$;
