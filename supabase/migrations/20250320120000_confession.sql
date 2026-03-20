-- Tâm sự: bài viết + bình luận + trả lời (parent_id = null → comment gốc; có parent_id → reply)
-- Chạy trong Supabase → SQL Editor (hoặc supabase db push)

create extension if not exists "pgcrypto";

create table if not exists public.confession_posts (
  id uuid primary key default gen_random_uuid(),
  author text not null default 'Ẩn danh',
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.confession_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.confession_posts (id) on delete cascade,
  parent_id uuid references public.confession_comments (id) on delete cascade,
  author text not null default 'Ẩn danh',
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_confession_comments_post_id on public.confession_comments (post_id);
create index if not exists idx_confession_comments_parent_id on public.confession_comments (parent_id);
create index if not exists idx_confession_posts_created_at on public.confession_posts (created_at desc);

comment on table public.confession_posts is 'Bài đăng tâm sự';
comment on column public.confession_comments.parent_id is 'NULL = bình luận gốc trên bài; UUID = trả lời bình luận đó';

-- RLS: không mở cho anon — chỉ API server (service role) ghi/đọc
alter table public.confession_posts enable row level security;
alter table public.confession_comments enable row level security;

-- (Không tạo policy) → anon/authenticated không truy cập qua client trực tiếp
-- Service role trong Next API bỏ qua RLS
