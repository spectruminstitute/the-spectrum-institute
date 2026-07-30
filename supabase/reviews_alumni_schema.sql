-- Reviews + Alumni modules for The Spectrum Institute portal
-- Run in Supabase SQL Editor (project: ngcbflylskwrtugxfzgu)

-- =====================================================================
-- 1) Public reviews (realtime-friendly)
-- =====================================================================
create table if not exists public.reviews (
    id            uuid primary key default gen_random_uuid(),
    student_name  text not null,
    rating        integer not null check (rating between 1 and 5),
    review_text   text not null,
    is_approved   boolean not null default true,
    created_at    timestamptz not null default now()
);

create index if not exists idx_reviews_created_at on public.reviews (created_at desc);
create index if not exists idx_reviews_approved on public.reviews (is_approved);

alter table public.reviews enable row level security;

drop policy if exists "Public can read approved reviews" on public.reviews;
create policy "Public can read approved reviews"
    on public.reviews for select
    to anon, authenticated
    using (is_approved = true);

drop policy if exists "Public can submit reviews" on public.reviews;
create policy "Public can submit reviews"
    on public.reviews for insert
    to anon, authenticated
    with check (
        char_length(trim(student_name)) >= 2
        and char_length(trim(review_text)) >= 5
        and rating between 1 and 5
    );

drop policy if exists "Admins can read all reviews" on public.reviews;
create policy "Admins can read all reviews"
    on public.reviews for select
    to authenticated
    using (true);

drop policy if exists "Admins can update reviews" on public.reviews;
create policy "Admins can update reviews"
    on public.reviews for update
    to authenticated
    using (true)
    with check (true);

drop policy if exists "Admins can delete reviews" on public.reviews;
create policy "Admins can delete reviews"
    on public.reviews for delete
    to authenticated
    using (true);

-- Realtime
do $$
begin
    alter publication supabase_realtime add table public.reviews;
exception
    when duplicate_object then null;
end $$;

-- =====================================================================
-- 2) Alumni directory
-- =====================================================================
create table if not exists public.alumni (
    id                 uuid primary key default gen_random_uuid(),
    student_name       text not null,
    batch_year         text not null,
    course_title       text not null,
    job_title          text not null,
    achievement_story  text not null,
    image_url          text,
    created_at         timestamptz not null default now()
);

create index if not exists idx_alumni_created_at on public.alumni (created_at desc);
create index if not exists idx_alumni_batch_year on public.alumni (batch_year);

alter table public.alumni enable row level security;

drop policy if exists "Public can read alumni" on public.alumni;
create policy "Public can read alumni"
    on public.alumni for select
    to anon, authenticated
    using (true);

drop policy if exists "Admins can insert alumni" on public.alumni;
create policy "Admins can insert alumni"
    on public.alumni for insert
    to authenticated
    with check (true);

drop policy if exists "Admins can update alumni" on public.alumni;
create policy "Admins can update alumni"
    on public.alumni for update
    to authenticated
    using (true)
    with check (true);

drop policy if exists "Admins can delete alumni" on public.alumni;
create policy "Admins can delete alumni"
    on public.alumni for delete
    to authenticated
    using (true);

do $$
begin
    alter publication supabase_realtime add table public.alumni;
exception
    when duplicate_object then null;
end $$;

-- Optional seed (safe upserts by name+year)
insert into public.reviews (student_name, rating, review_text, is_approved)
select * from (values
    ('Asad Ali', 5, 'TSI se AI Engineering course karne ke baad mujhe online freelancing gigs milna shuru hogaye hain. Barikot me aisi quality learning pehle nahi thi!', true),
    ('Adnan Khan', 5, 'Maine yahan se NEBOSH IGC ki coaching li aur asani se clear kiya. Management aur teachers bohut professional hain.', true),
    ('Sana Ullah', 5, 'FSc Physics ki coaching ke liye Engr. Abid Rasheed sab ka koi muqabla nahi. Concepts bilkul crystal clear hojaty hain.', true)
) as v(student_name, rating, review_text, is_approved)
where not exists (select 1 from public.reviews limit 1);
