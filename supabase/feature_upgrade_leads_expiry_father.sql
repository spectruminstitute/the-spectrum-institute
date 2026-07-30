-- =====================================================================
-- Spectrum Institute — Feature Upgrade
-- Father name on students, certificate expiry, leads/inquiries,
-- and 4-field secure verification RPC.
-- Run this in the Supabase SQL Editor.
-- =====================================================================

-- 1) Students: father's name
alter table public.students
    add column if not exists father_name varchar(150);

-- 2) Certificates: expiry date
alter table public.certificates
    add column if not exists expiry_date date;

create index if not exists idx_certificates_expiry_date
    on public.certificates (expiry_date);

-- 3) Inquiry leads table
create table if not exists public.leads (
    id              uuid primary key default gen_random_uuid(),
    full_name       varchar(150) not null,
    email           varchar(255) not null,
    phone           varchar(40),
    course_interest varchar(150),
    message         text,
    status          varchar(20) not null default 'new'
                      check (status in ('new', 'contacted', 'enrolled', 'archived')),
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    constraint leads_email_format_chk
        check (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

create index if not exists idx_leads_status on public.leads (status);
create index if not exists idx_leads_created_at on public.leads (created_at desc);

drop trigger if exists trg_leads_set_updated_at on public.leads;
create trigger trg_leads_set_updated_at
    before update on public.leads
    for each row
    execute function public.set_updated_at();

alter table public.leads enable row level security;

drop policy if exists "Anyone can insert leads" on public.leads;
create policy "Anyone can insert leads"
    on public.leads
    for insert
    to anon, authenticated
    with check (true);

drop policy if exists "Admins can select leads" on public.leads;
create policy "Admins can select leads"
    on public.leads
    for select
    to authenticated
    using (true);

drop policy if exists "Admins can update leads" on public.leads;
create policy "Admins can update leads"
    on public.leads
    for update
    to authenticated
    using (true)
    with check (true);

drop policy if exists "Admins can delete leads" on public.leads;
create policy "Admins can delete leads"
    on public.leads
    for delete
    to authenticated
    using (true);

-- 4) Secure verify RPC — requires certificate_id + student name + father name + DOB
drop function if exists public.verify_certificate_secure(text, text, date);

create or replace function public.verify_certificate_secure(
    p_certificate_id text,
    p_student_name text,
    p_father_name text,
    p_dob date
)
returns table (
    certificate_id varchar,
    student_name varchar,
    father_name varchar,
    course_name varchar,
    issue_date date,
    expiry_date date,
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
        c.expiry_date,
        c.grade,
        c.status,
        coalesce(c.student_dob, s.dob) as student_dob
    from public.certificates c
    left join public.students s on s.id = c.student_id
    where upper(btrim(c.certificate_id)) = upper(btrim(p_certificate_id))
      and lower(btrim(c.student_name)) = lower(btrim(p_student_name))
      and lower(btrim(coalesce(c.father_name, ''))) = lower(btrim(coalesce(p_father_name, '')))
      and coalesce(c.student_dob, s.dob) = p_dob
      and lower(c.status) = 'active'
    limit 1;
$$;

-- 5) Allow students without an assigned course ("No course yet")
alter table public.students
    alter column course_id drop not null;

-- 6) Leads: capture full student-profile fields for Lead → Student promotion
alter table public.leads
    add column if not exists father_name varchar(150);

alter table public.leads
    add column if not exists dob date;

alter table public.leads
    add column if not exists course_id uuid
        references public.courses (id)
        on update cascade
        on delete set null;

