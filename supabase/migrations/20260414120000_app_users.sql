-- Bảng người dùng ứng dụng — dùng pgcrypto để hash password.
-- Chạy trong Supabase: SQL Editor → dán file → Run.

create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  display_name text not null default '',
  password_hash text not null,
  role text not null default 'admin' check (role in ('superadmin', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.app_users_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_users_set_updated_at on public.app_users;
create trigger app_users_set_updated_at
before update on public.app_users
for each row execute function public.app_users_set_updated_at();

-- Tạo tài khoản mặc định: admin / admin123 (superadmin)
-- Đổi mật khẩu ngay sau khi đăng nhập lần đầu!
insert into public.app_users (username, display_name, password_hash, role)
values ('admin', 'Quản trị viên', crypt('admin123', gen_salt('bf')), 'superadmin')
on conflict (username) do nothing;

-- RPC để verify password (gọi từ API Next.js qua service_role)
create or replace function public.verify_password(p_username text, p_password text)
returns boolean
language plpgsql
security definer
as $$
declare
  stored_hash text;
begin
  select password_hash into stored_hash
  from public.app_users
  where username = lower(p_username) and is_active = true;

  if stored_hash is null then
    return false;
  end if;

  return stored_hash = crypt(p_password, stored_hash);
end;
$$;

-- RPC để đổi mật khẩu
create or replace function public.change_password(p_user_id uuid, p_new_password text)
returns boolean
language plpgsql
security definer
as $$
begin
  update public.app_users
  set password_hash = crypt(p_new_password, gen_salt('bf'))
  where id = p_user_id;

  return found;
end;
$$;

alter table public.app_users enable row level security;

comment on table public.app_users is 'Người dùng ứng dụng (superadmin / admin)';
