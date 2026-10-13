# HomaCare · bản Astro (`web/`)

Bản thiết kế lại của HomaCare (giai đoạn 2, 13/10/2026). Website tĩnh dựng bằng [Astro](https://astro.build), không SSR, nối cùng project Supabase với `preview/`. Thư mục `preview/` vẫn là bản đang chạy trên Cloudflare Pages cho tới khi bản này đủ chức năng và được merge.

## Chạy trên máy

Từ thư mục gốc dự án (Node.js ≥ 22.12):

```powershell
npm --prefix web install
npm --prefix web run dev          # http://127.0.0.1:4321, dùng Supabase thật
npm --prefix web run dev:fixture  # http://127.0.0.1:4322, dữ liệu giả lập, không gọi Supabase
npm --prefix web run build        # xuất ra web/dist
npm --prefix web run preview      # phục vụ web/dist để kiểm tra bản build
```

Chế độ `dev:fixture` (`astro dev --mode fixture`) thay client Supabase bằng `src/lib/fixture.ts`: dữ liệu minh họa nằm trong sessionStorage của trình duyệt. Đăng nhập bằng email bắt đầu bằng `family`, `caregiver` hoặc `coordinator` (ví dụ `caregiver@example.invalid`) với mật khẩu bất kỳ; email bắt đầu bằng `family-new` là tài khoản gia đình chưa có người thân (thử luồng bắt đầu, ví dụ `/app/gia-dinh/?booking=1`). Bản build thật chỉ tải file này (tách riêng) trong tab đang ở chế độ demo.

**Chế độ demo** (`/demo/`, giai đoạn 5): trang cho ban giám khảo chọn vai trò; `/demo/?vai-tro=gia-dinh|dieu-phoi|chuyen-vien|gia-dinh-moi` bật demo cho riêng tab đó rồi vào thẳng không gian, dùng `fixture.ts` với dữ liệu minh họa ở localStorage (các tab demo thấy cùng dữ liệu và tự cập nhật cho nhau), không gọi Supabase. Vào trang đăng nhập hoặc bấm "Thoát chế độ demo" là rời demo. Xem thử bằng bản build: `npm --prefix web run build` rồi `npm --prefix web run preview`, mở `/demo/`.

**Cập nhật tức thì**: `src/scripts/live.ts` nghe Supabase Realtime trên bảng `visits` (cần bật publication, xem CONTINUE-HOMACARE.md) và tải lại khi quay về tab.

Lưu ý: chạy `dev` (không fixture) thì đăng ký, đặt ca… ghi vào Supabase thật như `preview/`.

## Đường dẫn

| Đường dẫn | Trang | Thay cho |
| --- | --- | --- |
| `/` | Trang giới thiệu | `index.html` |
| `/app/` | Chọn vai trò; đã đăng nhập thì chuyển thẳng vào không gian theo vai trò | popup vai trò |
| `/app/dang-nhap/?role=…` | Đăng nhập, đăng ký, quên mật khẩu, đặt mật khẩu mới | `auth.html` |
| `/app/gia-dinh/` | Không gian gia đình | `family.html` |
| `/app/chuyen-vien/` | Không gian chuyên viên | `caregiver.html` |
| `/app/dieu-phoi/` | Không gian điều phối | `coordinator.html` |
| `/demo/` | Chế độ demo: chọn vai trò, dữ liệu minh họa (noindex) | |
| `/tinh-nang` | Trang tổng hợp tính năng, chép nguyên từ `preview/` (vẫn CSS cũ) | |

`public/auth.html`, `family.html`, `caregiver.html`, `coordinator.html` là trang chuyển hướng bằng JavaScript, giữ nguyên `?query` và `#fragment`, vì link trong email Supabase và các link đã gửi vẫn trỏ về đó.

## Cấu trúc

```text
web/
├── astro.config.mjs        # output tĩnh, site homacare-demo.pages.dev
├── public/                 # file phục vụ nguyên trạng: icons.svg, ảnh logo, manifest, _redirects, trang chuyển hướng
└── src/
    ├── styles/             # design system v1.2: tokens → fonts → base → components (+ site.css, app.css)
    ├── assets/             # font Lora + Nunito, ảnh minh họa (Astro tự nén sang webp)
    ├── components/hc/      # 15 thành phần hc-* dạng .astro
    ├── components/site/    # header, footer, "Cách sử dụng" của trang giới thiệu
    ├── layouts/            # BaseLayout (meta + design system), AppLayout (khung ba không gian)
    ├── lib/                # config, supabase, auth, visits (truy vấn + RPC), status, html, fixture (client giả lập), demo (cờ chế độ demo)
    ├── scripts/            # components.js (window.HC), workspace.ts (khởi động app), render.ts, forms.ts (lỗi cạnh ô, sheet, focus), live.ts (cập nhật tức thì),
    │                       # family.ts / caregiver.ts / coordinator.ts (thao tác ghi của từng không gian)
    └── pages/              # index, 404, app/…
```

Quyền dữ liệu vẫn do RLS và RPC trong `backend/schema.sql` quyết định; `src/lib/visits.ts` gọi đúng các bảng và RPC như `preview/workspace.js` (`book_homa_visit`, `assign_homa_visit`, `start_homa_visit`, `complete_homa_visit`, `rate_homa_visit`).
