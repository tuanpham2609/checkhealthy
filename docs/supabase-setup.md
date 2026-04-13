# Supabase cho **Tâm sự IVF**

Backend cho ứng dụng cộng đồng chia sẻ hành trình thụ tinh trong ống nghiệm (IVF).

## Bạn cần cung cấp / lấy ở đâu

1. **Tạo project** tại [supabase.com](https://supabase.com) (miễn phí đủ dùng thử).

2. Vào **Project Settings → API** và copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable / anon** (key công khai, có thể là `sb_publishable_...` hoặc JWT `eyJ...`) → đặt vào `NEXT_PUBLIC_SUPABASE_ANON_KEY` hoặc `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (trong repo đã map cả hai cho tiện)
   - **Secret — `service_role`** (JWT `eyJ...` hoặc secret mới trong mục Secret keys) → `SUPABASE_SERVICE_ROLE_KEY`  
     - **Bắt buộc** để `/api/confession/*` chạy. Key publishable **không** thay thế được.  
     - **Không** `NEXT_PUBLIC_`, không commit Git, chỉ server.

3. Tạo file **`.env.local`** ở root project (cùng cấp `package.json`), dán các biến theo `.env.example`.

4. Trong Supabase **SQL Editor**, chạy lần lượt (hoặc gộp một query):
   - `supabase/migrations/20250320120000_confession.sql` — bảng bài + bình luận  
   - `supabase/migrations/20250320140000_confession_images_storage.sql` — cột `image_urls`, bucket Storage `confession-media`, policy đọc công khai  
   - `supabase/migrations/20250324120000_confession_likes.sql` — cột `like_count`, bảng `confession_post_likes` (tim ẩn danh theo cookie `confession_vid`)
   - `supabase/migrations/20260413120000_scheduling.sql` — bảng `sched_contexts`, `sched_assignments` (trang **Sắp lịch thủ thuật** tại `/scheduling`)

## API trong repo

| Phương thức | Đường dẫn | Mô tả |
|-------------|-----------|--------|
| `GET` | `/api/confession/posts` | Danh sách bài + comment + reply (lồng). Query: `page` (mặc định 1), `limit` (mặc định **25**, tối đa 50) |
| `GET` | `/api/confession/posts/[postId]` | Một bài + comment; `likeCount` / `liked` (theo cookie) |
| `POST` | `/api/confession/posts` | Body: `{ "content": "...", "author": "...", "imageUrls": ["https://.../confession-media/..."] }` — `content` có thể rỗng nếu có ảnh |
| `POST` | `/api/confession/posts/[postId]/like` | Bật/tắt tim (cookie ẩn danh), trả `{ likeCount, liked }` |
| `POST` | `/api/confession/upload` | `multipart/form-data`, field `file` — JPEG/PNG/WebP/GIF, tối đa 5MB |
| `POST` | `/api/confession/posts/[postId]/comments` | Body: `{ "content": "...", "author": "...", "parentId": null \| "<uuid>" }` — `parentId` có giá trị = trả lời bình luận gốc |
| `GET` | `/api/scheduling/contexts` | Danh sách phiên sắp lịch |
| `POST` | `/api/scheduling/contexts` | Tạo phiên; body tuỳ chọn `name`, `schedulingDate`, `masters`, `settings`, hoặc `cloneFromId` để sao chép |
| `GET` / `PUT` / `DELETE` | `/api/scheduling/contexts/[id]` | Đọc / cập nhật / xoá phiên (PUT: `name`, `schedulingDate`, `settings`, `masters`) |
| `POST` | `/api/scheduling/contexts/[id]/schedule` | Body `{ "mode": "full" \| "preserve" }` — chạy chia giờ |
| `PUT` | `/api/scheduling/contexts/[id]/assignments` | Body `{ "assignments": [...] }` — ghi đè ca (sửa giờ thủ công) |

Nếu thiếu env, API trả **503** và UI báo lỗi.

## Bảo mật (nên đọc)

- **Service role** có full quyền DB: giữ trong server, rotate nếu lộ.
- RLS đang **bật** nhưng **không có policy** → chỉ service role (qua API) truy cập được; anon không đọc/ghi trực tiếp bảng.
- Forum ẩn danh dễ bị spam: sau nên thêm **rate limit**, **CAPTCHA**, hoặc **đăng nhập** + RLS theo `auth.uid()`.

## Tuỳ chọn: CLI Supabase

Nếu cài [Supabase CLI](https://supabase.com/docs/guides/cli), có thể `supabase db push` thay vì dán SQL thủ công.
