-- Sắp lịch thủ thuật — phiên (masters JSON) + ca đã xếp.
-- Chạy trong Supabase: SQL Editor → dán file → Run.

create table if not exists public.sched_contexts (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Phiên mới',
  scheduling_date date not null default (timezone('UTC', now()))::date,
  settings jsonb not null default jsonb_build_object(
    'autoSaveAfterSchedule', false,
    'allowAdjacentPillow', false,
    'pillowGapMinutes', 3
  ),
  masters jsonb not null default jsonb_build_object(
    'doctors', '[]'::jsonb,
    'machines', '[]'::jsonb,
    'procedures', '[]'::jsonb,
    'patients', '[]'::jsonb
  ),
  last_unscheduled jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sched_assignments (
  id uuid primary key default gen_random_uuid(),
  context_id uuid not null references public.sched_contexts (id) on delete cascade,
  patient_id text not null,
  procedure_id text not null,
  machine_id text not null,
  doctor_codes text[] not null default '{}',
  start_m integer not null,
  pillow_end_m integer not null,
  end_m integer not null,
  locked boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists sched_assignments_context_id_idx on public.sched_assignments (context_id);

create or replace function public.sched_contexts_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sched_contexts_set_updated_at on public.sched_contexts;
create trigger sched_contexts_set_updated_at
before update on public.sched_contexts
for each row execute function public.sched_contexts_set_updated_at();

alter table public.sched_contexts enable row level security;
alter table public.sched_assignments enable row level security;

-- Không tạo policy: anon/authenticated bị chặn; service_role (API Next.js) bypass RLS.

comment on table public.sched_contexts is 'Phiên sắp lịch: masters + cài đặt';
comment on table public.sched_assignments is 'Ca đã xếp (phút từ 00:00 trong ngày scheduling_date)';
