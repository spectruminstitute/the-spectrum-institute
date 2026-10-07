-- Student Gallery module for The Spectrum Institute portal
-- Run once in Supabase SQL Editor (project: ngcbflylskwrtugxfzgu)
--
-- Admins (logged-in dashboard users) add students with photos, achievements
-- and details. The public Gallery page (gallery.html) shows only rows where
-- is_published = true.
--
-- NOTE: do not store phone numbers, CNIC or other private data in this table.
-- Everything here is shown publicly on the website.

-- =====================================================================
-- 1) Table
-- =====================================================================
create table if not exists public.student_gallery (
    id                   uuid primary key default gen_random_uuid(),
    student_name         text not null,
    father_name          text,
    course_title         text not null,
    batch_year           text not null,
    city                 text,
    result_grade         text,
    category             text not null default 'Achievement'
                           check (category in ('Achievement', 'Certificate', 'Award', 'Job Placement', 'Event')),
    achievement_title    text not null,
    achievement_details  text,
    image_url            text,
    extra_images         jsonb not null default '[]'::jsonb,
    is_featured          boolean not null default false,
    is_published         boolean not null default true,
    created_at           timestamptz not null default now()
);

create index if not exists idx_student_gallery_created_at on public.student_gallery (created_at desc);
create index if not exists idx_student_gallery_published  on public.student_gallery (is_published);
create index if not exists idx_student_gallery_batch_year on public.student_gallery (batch_year);

-- =====================================================================
-- 2) Row Level Security
-- =====================================================================
alter table public.student_gallery enable row level security;

drop policy if exists "Public can read published gallery" on public.student_gallery;
create policy "Public can read published gallery"
    on public.student_gallery for select
    to anon, authenticated
    using (is_published = true);

drop policy if exists "Admins can read all gallery" on public.student_gallery;
create policy "Admins can read all gallery"
    on public.student_gallery for select
    to authenticated
    using (true);

drop policy if exists "Admins can insert gallery" on public.student_gallery;
create policy "Admins can insert gallery"
    on public.student_gallery for insert
    to authenticated
    with check (true);

drop policy if exists "Admins can update gallery" on public.student_gallery;
create policy "Admins can update gallery"
    on public.student_gallery for update
    to authenticated
    using (true)
    with check (true);

drop policy if exists "Admins can delete gallery" on public.student_gallery;
create policy "Admins can delete gallery"
    on public.student_gallery for delete
    to authenticated
    using (true);

-- Realtime (public page refreshes when the admin publishes or edits)
do $$
begin
    alter publication supabase_realtime add table public.student_gallery;
exception
    when duplicate_object then null;
end $$;

-- =====================================================================
-- 3) Storage bucket for gallery photos
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('gallery-photos', 'gallery-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public can view gallery photos" on storage.objects;
create policy "Public can view gallery photos"
    on storage.objects for select
    to anon, authenticated
    using (bucket_id = 'gallery-photos');

drop policy if exists "Admins can upload gallery photos" on storage.objects;
create policy "Admins can upload gallery photos"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'gallery-photos');

drop policy if exists "Admins can update gallery photos" on storage.objects;
create policy "Admins can update gallery photos"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'gallery-photos');

drop policy if exists "Admins can delete gallery photos" on storage.objects;
create policy "Admins can delete gallery photos"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'gallery-photos');
