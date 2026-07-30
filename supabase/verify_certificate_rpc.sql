-- =====================================================================
-- Public certificate verification RPC (safe fields only)
-- Portal must call this instead of SELECT on public.certificates.
-- When name / father / DOB are supplied, identity is gated server-side.
-- =====================================================================

drop function if exists public.verify_certificate(text);
drop function if exists public.verify_certificate(text, text, text, date);

create or replace function public.verify_certificate(
    p_certificate_id text,
    p_student_name text default null,
    p_father_name text default null,
    p_dob date default null
)
returns table (
    certificate_id varchar,
    student_name varchar,
    father_name varchar,
    course_name varchar,
    issue_date date,
    grade varchar
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
        c.grade
    from public.certificates c
    left join public.students s on s.id = c.student_id
    where upper(btrim(c.certificate_id)) = upper(btrim(p_certificate_id))
      and lower(coalesce(c.status, 'active')) = 'active'
      and (
            p_student_name is null
            or lower(btrim(c.student_name)) = lower(btrim(p_student_name))
          )
      and (
            p_father_name is null
            or lower(btrim(coalesce(c.father_name, ''))) = lower(btrim(coalesce(p_father_name, '')))
          )
      and (
            p_dob is null
            or coalesce(c.student_dob, s.dob) = p_dob
          )
    limit 1;
$$;

revoke all on function public.verify_certificate(text, text, text, date) from public;
grant execute on function public.verify_certificate(text, text, text, date) to anon, authenticated;

comment on function public.verify_certificate(text, text, text, date) is
    'Public verification RPC — Certificate ID (+ optional identity fields); returns only safe display columns.';
