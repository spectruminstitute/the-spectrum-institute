-- =====================================================================
-- The Spectrum Institute — Certificate Verification System
-- Run this script in the Supabase SQL Editor (Project > SQL Editor > New Query)
-- =====================================================================

-- 1. Create the certificates table
-- issue_date is Postgres DATE (calendar day only). Clients must send/store
-- YYYY-MM-DD without timezone conversion so the admin table, date inputs,
-- and certificate canvas always show the same day.
create table if not exists public.certificates (
    id                uuid primary key default gen_random_uuid(),
    certificate_id    varchar(50) not null unique,
    student_name      varchar(150) not null,
    father_name       varchar(150),
    course_name       varchar(150) not null,
    issue_date        date not null,
    grade             varchar(20),
    status            varchar(20) not null default 'active'
                        check (status in ('active', 'revoked')),
    created_at        timestamptz not null default now()
);

-- Helpful index for fast lookups by certificate_id (unique constraint already
-- creates one, but this is explicit/self-documenting).
create index if not exists idx_certificates_certificate_id
    on public.certificates (certificate_id);

-- 2. Enable Row Level Security
--    Public visitors: SELECT only (verification).
--    Authenticated admins: INSERT / UPDATE / UPSERT / DELETE for certificate management.
--    Updates must target the existing row (by id or unique certificate_id) so edits
--    overwrite the same serial instead of inserting duplicates.
alter table public.certificates enable row level security;

drop policy if exists "Public can read certificates" on public.certificates;
create policy "Public can read certificates"
    on public.certificates
    for select
    to anon, authenticated
    using (true);

drop policy if exists "Admins can insert certificates" on public.certificates;
create policy "Admins can insert certificates"
    on public.certificates
    for insert
    to authenticated
    with check (true);

drop policy if exists "Admins can update certificates" on public.certificates;
create policy "Admins can update certificates"
    on public.certificates
    for update
    to authenticated
    using (true)
    with check (true);

drop policy if exists "Admins can delete certificates" on public.certificates;
create policy "Admins can delete certificates"
    on public.certificates
    for delete
    to authenticated
    using (true);

-- 3. Insert dummy certificates for testing (safe upsert by serial)
insert into public.certificates
    (certificate_id, student_name, father_name, course_name, issue_date, grade, status)
values
    ('TSI-2026-001', 'Asad Ali', 'Muhammad Ali', 'AI Engineering', '2026-03-15', 'A+', 'active'),
    ('TSI-2026-002', 'Adnan Khan', 'Sher Khan', 'NEBOSH IGC', '2026-01-20', 'A', 'active')
on conflict (certificate_id) do update
set student_name = excluded.student_name,
    father_name  = excluded.father_name,
    course_name  = excluded.course_name,
    issue_date   = excluded.issue_date,
    grade        = excluded.grade,
    status       = excluded.status;

-- =====================================================================
-- Quick test queries (optional — run separately to verify):
--   select * from public.certificates;
--   select * from public.certificates where certificate_id = 'TSI-2026-001';
-- =====================================================================
