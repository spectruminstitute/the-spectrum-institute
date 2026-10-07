-- News & Achievements module for The Spectrum Institute website
-- Run once in Supabase SQL Editor (project: ngcbflylskwrtugxfzgu)
--
-- Admins (logged-in dashboard users) write news posts, e.g. "Our student
-- built an app", "NEBOSH results announced". The public pages news.html and
-- /news/<slug> show only rows where is_published = true.
--
-- NOTE: everything in this table is public. Do not store phone numbers,
-- CNIC or other private data here.

-- =====================================================================
-- 1) Table
-- =====================================================================
create table if not exists public.news_posts (
    id               uuid primary key default gen_random_uuid(),
    slug             text not null unique
                       check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
    title            text not null check (char_length(title) <= 160),
    summary          text not null check (char_length(summary) <= 320),
    body             text not null check (char_length(body) <= 20000),
    category         text not null default 'Student Achievement'
                       check (category in ('Student Achievement', 'Institute News', 'Event', 'Result', 'Job Placement', 'Announcement')),
    student_name     text,
    course_title     text,
    city             text,
    keywords         text,
    external_link    text check (external_link is null or external_link ~* '^https://'),
    author_name      text not null default 'The Spectrum Institute',
    cover_image_url  text check (cover_image_url is null or cover_image_url ~* '^https://'),
    extra_images     jsonb not null default '[]'::jsonb,
    is_featured      boolean not null default false,
    is_published     boolean not null default true,
    published_at     timestamptz not null default now(),
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

create index if not exists idx_news_posts_published_at on public.news_posts (published_at desc);
create index if not exists idx_news_posts_is_published on public.news_posts (is_published);

-- Keep updated_at fresh (used for "Updated" date and Google's dateModified)
create or replace function public.news_posts_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_news_posts_updated_at on public.news_posts;
create trigger trg_news_posts_updated_at
    before update on public.news_posts
    for each row execute function public.news_posts_touch_updated_at();

-- =====================================================================
-- 2) Row Level Security
-- =====================================================================
alter table public.news_posts enable row level security;

drop policy if exists "Public can read published news" on public.news_posts;
create policy "Public can read published news"
    on public.news_posts for select
    to anon, authenticated
    using (is_published = true);

drop policy if exists "Admins can read all news" on public.news_posts;
create policy "Admins can read all news"
    on public.news_posts for select
    to authenticated
    using (true);

drop policy if exists "Admins can insert news" on public.news_posts;
create policy "Admins can insert news"
    on public.news_posts for insert
    to authenticated
    with check (true);

drop policy if exists "Admins can update news" on public.news_posts;
create policy "Admins can update news"
    on public.news_posts for update
    to authenticated
    using (true)
    with check (true);

drop policy if exists "Admins can delete news" on public.news_posts;
create policy "Admins can delete news"
    on public.news_posts for delete
    to authenticated
    using (true);

-- Realtime (public pages refresh when the admin publishes or edits)
do $$
begin
    alter publication supabase_realtime add table public.news_posts;
exception
    when duplicate_object then null;
end $$;

-- =====================================================================
-- 3) Storage bucket for news photos
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('news-photos', 'news-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public can view news photos" on storage.objects;
create policy "Public can view news photos"
    on storage.objects for select
    to anon, authenticated
    using (bucket_id = 'news-photos');

drop policy if exists "Admins can upload news photos" on storage.objects;
create policy "Admins can upload news photos"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'news-photos');

drop policy if exists "Admins can update news photos" on storage.objects;
create policy "Admins can update news photos"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'news-photos');

drop policy if exists "Admins can delete news photos" on storage.objects;
create policy "Admins can delete news photos"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'news-photos');
