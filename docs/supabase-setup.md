# Supabase — sắp lịch thủ thuật

Backend cho API `/api/scheduling/*` (trang chủ `/`).

## Biến môi trường

1. Tạo project tại [supabase.com](https://supabase.com).
2. **Project Settings → API**: copy URL và key vào `.env.local` (theo `.env.example`).
3. **`SUPABASE_SERVICE_ROLE_KEY`** (server only, không `NEXT_PUBLIC_`) — **bắt buộc** để route scheduling ghi/đọc DB.

## Migration

Trong Supabase **SQL Editor**, chạy:

- `supabase/migrations/20260413120000_scheduling.sql` — bảng `sched_contexts`, `sched_assignments`

## API

| Phương thức | Đường dẫn | Mô tả |
|-------------|-----------|--------|
| `GET` | `/api/scheduling/contexts` | Danh sách bản lịch |
| `POST` | `/api/scheduling/contexts` | Tạo bản lịch; body: `name`, `schedulingDate`, `masters`, `settings`, hoặc `cloneFromId` |
| `GET` / `PUT` / `DELETE` | `/api/scheduling/contexts/[id]` | Đọc / cập nhật / xoá |
| `POST` | `/api/scheduling/contexts/[id]/schedule` | Body `{ "mode": "full" \| "preserve" }` — chạy xếp lịch |
| `PUT` | `/api/scheduling/contexts/[id]/assignments` | Body `{ "assignments": [...] }` |

Thiếu env → API trả **503**.

## Bảo mật

- Giữ **service role** trên server; rotate nếu lộ.
- RLS bật nhưng không policy → chỉ service role (qua API) truy cập được.
