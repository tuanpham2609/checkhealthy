-- Lịch theo tháng: bảng ngày nghỉ chung + cột ngày nghỉ riêng trên sched_contexts.

-- 1. Bảng ngày nghỉ chung (lễ, chủ nhật, v.v.)
create table if not exists public.global_holidays (
  id uuid primary key default gen_random_uuid(),
  date date unique not null,
  label text not null default '',
  recurring boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.global_holidays enable row level security;

comment on table public.global_holidays is 'Ngày nghỉ chung cho toàn app (lễ, CN). recurring=true → so sánh month+day hàng năm.';

-- 2. Cột ngày nghỉ riêng cho mỗi bản lịch
alter table public.sched_contexts
  add column if not exists days_off jsonb not null default '[]'::jsonb;

comment on column public.sched_contexts.days_off is 'Mảng ISO date (yyyy-mm-dd) ngày nghỉ riêng của bản lịch này.';
