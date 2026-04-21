-- Danh sach Ky thuat vien chung (import Excel) + lich thang ca lam

create table if not exists public.shared_technicians (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  am_start text not null default '',
  am_end text not null default '',
  pm_start text not null default '',
  pm_end text not null default '',
  created_at timestamptz not null default now()
);
alter table public.shared_technicians enable row level security;

comment on table public.shared_technicians is 'Danh sach KTV chung (import Excel). Lich thang / ngay nghi luu trong masters JSONB cua sched_contexts';

-- Them cot technician_codes vao sched_assignments
alter table public.sched_assignments
  add column if not exists technician_codes text[] not null default '{}';
