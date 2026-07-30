-- =====================================================================
-- The Spectrum Institute — Relational Database Schema (Supabase / Postgres)
-- Run once in: Project → SQL Editor → New query → Run
--
-- Extends the original single-table certificates design into a normalized
-- model: courses → batches → students → assessments / certificates, plus
-- activity_logs. Existing public.certificates rows are preserved and linked.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. COURSES
-- ---------------------------------------------------------------------
create table if not exists public.courses (
    id           uuid primary key default gen_random_uuid(),
    name         varchar(150) not null,
    category     varchar(80)  not null,
    description  text,
    duration     varchar(80),
    fee          numeric(12, 2) not null default 0
                   check (fee >= 0),
    is_archived  boolean not null default false,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now(),
    constraint courses_name_category_key unique (name, category)
);

create index if not exists idx_courses_category
    on public.courses (category)
    where is_archived = false;

create index if not exists idx_courses_is_archived
    on public.courses (is_archived);

-- ---------------------------------------------------------------------
-- 2. BATCHES
-- ---------------------------------------------------------------------
create table if not exists public.batches (
    id               uuid primary key default gen_random_uuid(),
    course_id        uuid not null
                       references public.courses (id)
                       on update cascade
                       on delete restrict,
    start_date       date not null,
    schedule         varchar(120) not null,
    instructor_name  varchar(150) not null,
    capacity         integer not null
                       check (capacity > 0),
    is_archived      boolean not null default false,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

create index if not exists idx_batches_course_id
    on public.batches (course_id);

create index if not exists idx_batches_start_date
    on public.batches (start_date);

create index if not exists idx_batches_is_archived
    on public.batches (is_archived);

-- ---------------------------------------------------------------------
-- 3. STUDENTS
-- ---------------------------------------------------------------------
create table if not exists public.students (
    id               uuid primary key default gen_random_uuid(),
    full_name        varchar(150) not null,
    dob              date not null,
    email            varchar(255),
    phone            varchar(30),
    course_id        uuid not null
                       references public.courses (id)
                       on update cascade
                       on delete restrict,
    batch_id         uuid
                       references public.batches (id)
                       on update cascade
                       on delete set null,
    enrollment_date  date not null default current_date,
    status           varchar(20) not null default 'active'
                       check (status in ('active', 'completed', 'dropped')),
    is_archived      boolean not null default false,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now(),
    constraint students_email_format_chk
        check (email is null or email ~* '^[^@]+@[^@]+\.[^@]+$')
);

create index if not exists idx_students_course_id
    on public.students (course_id);

create index if not exists idx_students_batch_id
    on public.students (batch_id);

create index if not exists idx_students_dob
    on public.students (dob);

create index if not exists idx_students_email
    on public.students (lower(email))
    where email is not null;

create index if not exists idx_students_status
    on public.students (status)
    where is_archived = false;

-- Ensure a student's batch (when set) belongs to the same course.
create or replace function public.students_batch_matches_course()
returns trigger
language plpgsql
as $$
begin
    if new.batch_id is null then
        return new;
    end if;

    if not exists (
        select 1
        from public.batches b
        where b.id = new.batch_id
          and b.course_id = new.course_id
    ) then
        raise exception
            'students.batch_id (%) must reference a batch of course_id (%)',
            new.batch_id, new.course_id;
    end if;

    return new;
end;
$$;

drop trigger if exists trg_students_batch_matches_course on public.students;
create trigger trg_students_batch_matches_course
    before insert or update of course_id, batch_id
    on public.students
    for each row
    execute function public.students_batch_matches_course();

-- ---------------------------------------------------------------------
-- 4. ASSESSMENTS
-- ---------------------------------------------------------------------
create table if not exists public.assessments (
    id            uuid primary key default gen_random_uuid(),
    student_id    uuid not null
                    references public.students (id)
                    on update cascade
                    on delete cascade,
    level_number  integer not null
                    check (level_number >= 1),
    grade         varchar(20) not null,
    status        varchar(20) not null default 'passed'
                    check (status in ('in_progress', 'passed', 'failed')),
    assessed_by   varchar(150) not null,
    assessed_at   timestamptz not null default now(),
    created_at    timestamptz not null default now(),
    constraint assessments_student_level_key unique (student_id, level_number)
);

-- Safe upgrade path if assessments already existed without status
alter table public.assessments
    add column if not exists status varchar(20);

do $$
begin
    update public.assessments
       set status = 'passed'
     where status is null or btrim(status) = '';

    begin
        alter table public.assessments
            alter column status set default 'passed';
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

create index if not exists idx_assessments_student_id
    on public.assessments (student_id);

create index if not exists idx_assessments_assessed_at
    on public.assessments (assessed_at desc);

-- ---------------------------------------------------------------------
-- 5. CERTIFICATES
--     Keep the existing verification columns so the website QR/manual
--     lookup (student_name, father_name, course_name) keeps working.
--     Add FKs and sync display fields from related rows on write.
-- ---------------------------------------------------------------------
create table if not exists public.certificates (
    id                uuid primary key default gen_random_uuid(),
    certificate_id    varchar(50) not null,
    student_name      varchar(150) not null,
    father_name       varchar(150),
    course_name       varchar(150) not null,
    issue_date        date not null,
    grade             varchar(20),
    status            varchar(20) not null default 'active'
                        check (status in ('active', 'revoked')),
    created_at        timestamptz not null default now()
);

-- Unique lookup key (idempotent if the original script already created it)
do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'certificates_certificate_id_key'
          and conrelid = 'public.certificates'::regclass
    ) then
        alter table public.certificates
            add constraint certificates_certificate_id_key unique (certificate_id);
    end if;
end $$;

create index if not exists idx_certificates_certificate_id
    on public.certificates (certificate_id);

-- Relational columns for dynamic mapping
alter table public.certificates
    add column if not exists student_id uuid;

alter table public.certificates
    add column if not exists course_id uuid;

alter table public.certificates
    add column if not exists student_dob date;

alter table public.certificates
    add column if not exists updated_at timestamptz not null default now();

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'certificates_student_id_fkey'
          and conrelid = 'public.certificates'::regclass
    ) then
        alter table public.certificates
            add constraint certificates_student_id_fkey
            foreign key (student_id)
            references public.students (id)
            on update cascade
            on delete restrict;
    end if;

    if not exists (
        select 1
        from pg_constraint
        where conname = 'certificates_course_id_fkey'
          and conrelid = 'public.certificates'::regclass
    ) then
        alter table public.certificates
            add constraint certificates_course_id_fkey
            foreign key (course_id)
            references public.courses (id)
            on update cascade
            on delete restrict;
    end if;
end $$;

create index if not exists idx_certificates_student_id
    on public.certificates (student_id);

create index if not exists idx_certificates_course_id
    on public.certificates (course_id);

create index if not exists idx_certificates_status
    on public.certificates (status);

-- Map student_name / course_name from FKs so admins only need to supply IDs.
create or replace function public.certificates_map_related_fields()
returns trigger
language plpgsql
as $$
declare
    v_student_name text;
    v_course_id    uuid;
    v_course_name  text;
begin
    if new.student_id is not null then
        select s.full_name, s.course_id
          into v_student_name, v_course_id
          from public.students s
         where s.id = new.student_id;

        if v_student_name is null then
            raise exception 'certificates.student_id (%) not found', new.student_id;
        end if;

        new.student_name := v_student_name;

        -- Default course_id from the student's enrollment when omitted.
        if new.course_id is null then
            new.course_id := v_course_id;
        end if;
    end if;

    if new.course_id is not null then
        select c.name
          into v_course_name
          from public.courses c
         where c.id = new.course_id;

        if v_course_name is null then
            raise exception 'certificates.course_id (%) not found', new.course_id;
        end if;

        new.course_name := v_course_name;
    end if;

    -- Keep displayed names populated for public verification even if FKs are null
    -- (legacy rows). New admin inserts should always provide student_id.
    if new.student_name is null or btrim(new.student_name) = '' then
        raise exception 'certificates.student_name is required (set student_id or student_name)';
    end if;

    if new.course_name is null or btrim(new.course_name) = '' then
        raise exception 'certificates.course_name is required (set course_id or course_name)';
    end if;

    new.updated_at := now();
    new.certificate_id := upper(btrim(new.certificate_id));

    return new;
end;
$$;

drop trigger if exists trg_certificates_map_related_fields on public.certificates;
create trigger trg_certificates_map_related_fields
    before insert or update of student_id, course_id, certificate_id, student_name, course_name
    on public.certificates
    for each row
    execute function public.certificates_map_related_fields();

-- ---------------------------------------------------------------------
-- 6. ACTIVITY LOGS
-- ---------------------------------------------------------------------
create table if not exists public.activity_logs (
    id            uuid primary key default gen_random_uuid(),
    action        varchar(80) not null,
    target_table  varchar(80) not null,
    details       jsonb not null default '{}'::jsonb,
    created_at    timestamptz not null default now()
);

create index if not exists idx_activity_logs_created_at
    on public.activity_logs (created_at desc);

create index if not exists idx_activity_logs_target_table
    on public.activity_logs (target_table);

create index if not exists idx_activity_logs_action
    on public.activity_logs (action);

-- ---------------------------------------------------------------------
-- 7. UPDATED_AT HELPERS
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists trg_courses_set_updated_at on public.courses;
create trigger trg_courses_set_updated_at
    before update on public.courses
    for each row execute function public.set_updated_at();

drop trigger if exists trg_batches_set_updated_at on public.batches;
create trigger trg_batches_set_updated_at
    before update on public.batches
    for each row execute function public.set_updated_at();

drop trigger if exists trg_students_set_updated_at on public.students;
create trigger trg_students_set_updated_at
    before update on public.students
    for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY
--     - anon:          SELECT on courses + certificates only
--     - authenticated: full CRUD on all institute tables
-- ---------------------------------------------------------------------
alter table public.courses       enable row level security;
alter table public.batches       enable row level security;
alter table public.students      enable row level security;
alter table public.assessments   enable row level security;
alter table public.certificates  enable row level security;
alter table public.activity_logs enable row level security;

-- Courses: public read (website listing), admin write
drop policy if exists "Public can read courses" on public.courses;
create policy "Public can read courses"
    on public.courses
    for select
    to anon, authenticated
    using (true);

drop policy if exists "Admins can insert courses" on public.courses;
create policy "Admins can insert courses"
    on public.courses
    for insert
    to authenticated
    with check (true);

drop policy if exists "Admins can update courses" on public.courses;
create policy "Admins can update courses"
    on public.courses
    for update
    to authenticated
    using (true)
    with check (true);

drop policy if exists "Admins can delete courses" on public.courses;
create policy "Admins can delete courses"
    on public.courses
    for delete
    to authenticated
    using (true);

-- Batches: admin only
drop policy if exists "Admins can select batches" on public.batches;
create policy "Admins can select batches"
    on public.batches
    for select
    to authenticated
    using (true);

drop policy if exists "Admins can insert batches" on public.batches;
create policy "Admins can insert batches"
    on public.batches
    for insert
    to authenticated
    with check (true);

drop policy if exists "Admins can update batches" on public.batches;
create policy "Admins can update batches"
    on public.batches
    for update
    to authenticated
    using (true)
    with check (true);

drop policy if exists "Admins can delete batches" on public.batches;
create policy "Admins can delete batches"
    on public.batches
    for delete
    to authenticated
    using (true);

-- Students: admin only
drop policy if exists "Admins can select students" on public.students;
create policy "Admins can select students"
    on public.students
    for select
    to authenticated
    using (true);

drop policy if exists "Admins can insert students" on public.students;
create policy "Admins can insert students"
    on public.students
    for insert
    to authenticated
    with check (true);

drop policy if exists "Admins can update students" on public.students;
create policy "Admins can update students"
    on public.students
    for update
    to authenticated
    using (true)
    with check (true);

drop policy if exists "Admins can delete students" on public.students;
create policy "Admins can delete students"
    on public.students
    for delete
    to authenticated
    using (true);

-- Assessments: admin only
drop policy if exists "Admins can select assessments" on public.assessments;
create policy "Admins can select assessments"
    on public.assessments
    for select
    to authenticated
    using (true);

drop policy if exists "Admins can insert assessments" on public.assessments;
create policy "Admins can insert assessments"
    on public.assessments
    for insert
    to authenticated
    with check (true);

drop policy if exists "Admins can update assessments" on public.assessments;
create policy "Admins can update assessments"
    on public.assessments
    for update
    to authenticated
    using (true)
    with check (true);

drop policy if exists "Admins can delete assessments" on public.assessments;
create policy "Admins can delete assessments"
    on public.assessments
    for delete
    to authenticated
    using (true);

-- Certificates: public read (QR / manual verification), admin write
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

-- Activity logs: admin only
drop policy if exists "Admins can select activity_logs" on public.activity_logs;
create policy "Admins can select activity_logs"
    on public.activity_logs
    for select
    to authenticated
    using (true);

drop policy if exists "Admins can insert activity_logs" on public.activity_logs;
create policy "Admins can insert activity_logs"
    on public.activity_logs
    for insert
    to authenticated
    with check (true);

drop policy if exists "Admins can update activity_logs" on public.activity_logs;
create policy "Admins can update activity_logs"
    on public.activity_logs
    for update
    to authenticated
    using (true)
    with check (true);

drop policy if exists "Admins can delete activity_logs" on public.activity_logs;
create policy "Admins can delete activity_logs"
    on public.activity_logs
    for delete
    to authenticated
    using (true);

-- ---------------------------------------------------------------------
-- 9. SEED DATA (safe to re-run)
-- ---------------------------------------------------------------------
insert into public.courses (id, name, category, description, duration, fee, is_archived)
values
    ('11111111-1111-1111-1111-111111111111',
     'AI Engineering', 'Computer',
     'Practical AI, ML fundamentals, and freelance-ready projects.',
     '3 Months', 45000, false),
    ('22222222-2222-2222-2222-222222222222',
     'NEBOSH IGC', 'Safety',
     'Internationally recognized health and safety certification track.',
     '2 Months', 55000, false),
    ('33333333-3333-3333-3333-333333333333',
     'Cyber Security', 'Computer',
     'Network defense, ethical hacking foundations, and SOC basics.',
     '4 Months', 50000, false)
on conflict (name, category) do nothing;

insert into public.batches (id, course_id, start_date, schedule, instructor_name, capacity, is_archived)
values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     '11111111-1111-1111-1111-111111111111',
     '2026-03-01', 'Mon–Fri · Evening · 5:00–7:00 PM', 'Engr. Zaid Rasheed', 25, false),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
     '22222222-2222-2222-2222-222222222222',
     '2026-01-10', 'Sat–Sun · Morning · 9:00–1:00 PM', 'Safety Lead — TSI', 30, false),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc',
     '33333333-3333-3333-3333-333333333333',
     '2026-04-01', 'Mon–Thu · Evening · 6:00–8:00 PM', 'ICT Faculty — TSI', 20, false)
on conflict (id) do nothing;

insert into public.students (
    id, full_name, dob, email, phone, course_id, batch_id, enrollment_date, status, is_archived
)
values
    ('dddddddd-dddd-dddd-dddd-dddddddddddd',
     'Asad Ali', '2002-05-14', 'asad.ali@example.com', '03001234567',
     '11111111-1111-1111-1111-111111111111',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     '2026-03-01', 'completed', false),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
     'Adnan Khan', '1999-11-02', 'adnan.khan@example.com', '03007654321',
     '22222222-2222-2222-2222-222222222222',
     'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
     '2026-01-10', 'completed', false),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff',
     'Sara Ahmed', '2004-08-21', 'sara.ahmed@example.com', '03111222333',
     '33333333-3333-3333-3333-333333333333',
     'cccccccc-cccc-cccc-cccc-cccccccccccc',
     '2026-04-01', 'active', false)
on conflict (id) do nothing;

insert into public.assessments (student_id, level_number, grade, assessed_by, assessed_at)
values
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 1, 'A+', 'Engr. Zaid Rasheed', '2026-03-10 10:00:00+05'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 2, 'A+', 'Engr. Zaid Rasheed', '2026-03-14 10:00:00+05'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 1, 'A',  'Safety Lead — TSI',  '2026-01-18 11:00:00+05'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 1, 'B+', 'ICT Faculty — TSI',  '2026-05-15 16:30:00+05')
on conflict (student_id, level_number) do nothing;

-- Upsert certificates by certificate_id; map to students/courses.
insert into public.certificates (
    certificate_id, student_id, course_id, father_name, issue_date, grade, status
)
values
    ('TSI-2026-001',
     'dddddddd-dddd-dddd-dddd-dddddddddddd',
     '11111111-1111-1111-1111-111111111111',
     'Muhammad Ali', '2026-03-15', 'A+', 'active'),
    ('TSI-2026-002',
     'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
     '22222222-2222-2222-2222-222222222222',
     'Sher Khan', '2026-01-20', 'A', 'active')
on conflict (certificate_id) do update
set student_id  = excluded.student_id,
    course_id   = excluded.course_id,
    father_name = excluded.father_name,
    issue_date  = excluded.issue_date,
    grade       = excluded.grade,
    status      = excluded.status;

insert into public.activity_logs (action, target_table, details)
select v.action, v.target_table, v.details
from (
    values
        ('schema_migrated'::varchar(80), 'system'::varchar(80),
         '{"note": "Relational institute schema applied", "version": "1.0"}'::jsonb),
        ('seed_inserted', 'certificates',
         '{"certificate_ids": ["TSI-2026-001", "TSI-2026-002"]}'::jsonb)
) as v(action, target_table, details)
where not exists (
    select 1
    from public.activity_logs al
    where al.action = 'schema_migrated'
      and al.target_table = 'system'
);

-- =====================================================================
-- Optional checks:
--   select * from public.courses;
--   select certificate_id, student_name, course_name, student_id, status
--     from public.certificates;
--   select * from public.students where status = 'active';
-- =====================================================================
