-- Persist full certificate canvas label/layout edits (JSON snapshot).
-- Run in Supabase SQL editor if canvas_layout is missing.

alter table public.certificates
    add column if not exists canvas_layout jsonb;

comment on column public.certificates.canvas_layout is
    'Editable certificate canvas copy (headers, labels, titles, signatures) saved from admin studio';
