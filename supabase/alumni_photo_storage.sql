-- Alumni photo uploads (Storage bucket + policies)
-- Run in Supabase SQL Editor (project: ngcbflylskwrtugxfzgu)
-- Lets the admin dashboard upload a photo directly from the device/gallery
-- when adding an alumni card, instead of only pasting an external URL.

-- =====================================================================
-- 1) Create the public storage bucket
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('alumni-photos', 'alumni-photos', true)
on conflict (id) do nothing;

-- =====================================================================
-- 2) Policies on storage.objects, scoped to this bucket only
-- =====================================================================

-- Anyone can view alumni photos (the bucket is public — needed so the
-- photos display on the public Alumni page for site visitors)
drop policy if exists "Public can view alumni photos" on storage.objects;
create policy "Public can view alumni photos"
    on storage.objects for select
    to anon, authenticated
    using (bucket_id = 'alumni-photos');

-- Only logged-in admins (real Supabase Auth session, same login used for
-- the admin dashboard) can upload, replace, or delete alumni photos
drop policy if exists "Admins can upload alumni photos" on storage.objects;
create policy "Admins can upload alumni photos"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'alumni-photos');

drop policy if exists "Admins can update alumni photos" on storage.objects;
create policy "Admins can update alumni photos"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'alumni-photos');

drop policy if exists "Admins can delete alumni photos" on storage.objects;
create policy "Admins can delete alumni photos"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'alumni-photos');
