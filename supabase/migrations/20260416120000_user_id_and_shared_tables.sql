-- Liên kết sched_contexts với user + bảng shared (danh sách chung BS/máy/thủ thuật)

-- 1. user_id cho sched_contexts
alter table public.sched_contexts
  add column if not exists user_id uuid references public.app_users(id);

create index if not exists sched_contexts_user_id_idx on public.sched_contexts (user_id);

-- 2. Danh sách bác sĩ chung (import Excel)
create table if not exists public.shared_doctors (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  am_start text not null default '',
  am_end text not null default '',
  pm_start text not null default '',
  pm_end text not null default '',
  created_at timestamptz not null default now()
);
alter table public.shared_doctors enable row level security;

-- 3. Danh sách máy chung
create table if not exists public.shared_machines (
  id uuid primary key default gen_random_uuid(),
  type_name text not null,
  unit_name text not null,
  unique (type_name, unit_name),
  created_at timestamptz not null default now()
);
alter table public.shared_machines enable row level security;

-- 4. Danh mục thủ thuật/dịch vụ kỹ thuật chung
create table if not exists public.shared_procedures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_m integer,
  pillow_m integer,
  main_codes text not null default '',
  substitute_codes text not null default '',
  machine_type text not null default '',
  priority boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.shared_procedures enable row level security;

comment on table public.shared_doctors is 'Danh sách bác sĩ/KTV chung (import Excel)';
comment on table public.shared_machines is 'Danh sách máy chung (import Excel)';
comment on table public.shared_procedures is 'Danh mục dịch vụ kỹ thuật chung (import Excel)';
