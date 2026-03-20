-- Ảnh đính kèm bài đăng + bucket Storage công khai (chỉ đọc), upload qua API (service role)

alter table public.confession_posts
  add column if not exists image_urls jsonb not null default '[]'::jsonb;

comment on column public.confession_posts.image_urls is 'Mảng URL ảnh public từ Storage bucket confession-media';

-- Bucket: ảnh đọc công khai; ghi chỉ qua server (service role)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'confession-media',
  'confession-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Ai cũng xem được file trong bucket (URL public)
drop policy if exists "confession_media_public_read" on storage.objects;
create policy "confession_media_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'confession-media');

-- Không tạo policy INSERT cho anon — upload chỉ qua Next API + service role
