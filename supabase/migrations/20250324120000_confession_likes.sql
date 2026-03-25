-- Lượt tim: đếm trên bài + bảng ghi nhận (post_id, visitor_id) từ cookie ẩn danh

alter table public.confession_posts
  add column if not exists like_count integer not null default 0;

comment on column public.confession_posts.like_count is 'Số tim (đồng bộ với confession_post_likes)';

create table if not exists public.confession_post_likes (
  post_id uuid not null references public.confession_posts (id) on delete cascade,
  visitor_id text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, visitor_id)
);

create index if not exists idx_confession_post_likes_visitor on public.confession_post_likes (visitor_id);

comment on table public.confession_post_likes is 'Tim ẩn danh: visitor_id = UUID cookie (không đăng nhập)';

alter table public.confession_post_likes enable row level security;
