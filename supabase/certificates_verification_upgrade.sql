-- =====================================================================
-- Certificate verification security upgrade
-- FR-6.1 to FR-6.4 — DOB snapshot + secure RPC for public verification
-- Run in Supabase SQL Editor
-- =====================================================================

-- 1) Snapshot DOB onto certificates so public verify does not need students SELECT.
alter table public.certificates
    add column if not exists student_dob date;

-- Backfill from linked students where possible
update public.certificates c
   set student_dob = s.dob
  from public.students s
 where c.student_id = s.id
   and c.student_dob is null
   and s.dob is not null;

create index if not exists idx_certificates_student_dob
    on public.certificates (student_dob);

-- 2) Secure RPC: matches certificate_id + student name + DOB for active certs only.
--    Prefer joining students.dob; fall back to certificates.student_dob snapshot.
create or replace function public.verify_certificate_secure(
    p_certificate_id text,
    p_student_name text,
    p_dob date
)
returns table (
    certificate_id varchar,
    student_name varchar,
    father_name varchar,
    course_name varchar,
    issue_date date,
    grade varchar,
    status varchar,
    student_dob date
)
language sql
security definer
set search_path = public
as $$
    select
        c.certificate_id,
        c.student_name,
        c.father_name,
        c.course_name,
        c.issue_date,
        c.grade,
        c.status,
        coalesce(c.student_dob, s.dob) as student_dob
    from public.certificates c
    left join public.students s on s.id = c.student_id
    where upper(btrim(c.certificate_id)) = upper(btrim(p_certificate_id))
      and lower(btrim(c.student_name)) = lower(btrim(p_student_name))
      and coalesce(c.student_dob, s.dob) = p_dob
      and lower(c.status) = 'active'
    limit 1;
$$;

revoke all on function public.verify_certificate_secure(text, text, date) from public;
grant execute on function public.verify_certificate_secure(text, text, date) to anon, authenticated;
