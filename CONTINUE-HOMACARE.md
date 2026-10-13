# HOMACARE — trạng thái tiếp tục

## PHIÊN THIẾT KẾ LẠI — 13/10/2026 (đọc phần này trước)

### Bối cảnh và luật làm việc
- Repo đã chuyển từ OneDrive sang `C:\dev\homacare`. Làm trên nhánh **`thiet-ke-lai`**. Tag **`ban-cu-v1`** = bản đang chạy trên homacare-demo.pages.dev.
- **Không sửa, không merge vào `main`. Không push nếu chưa hỏi người dùng.** Commit cục bộ sau mỗi giai đoạn là được phép.
- Cloudflare Pages chỉ build `main`, nên mọi thay đổi trên nhánh này chưa ảnh hưởng web thật.
- Lộ trình đầy đủ: (0) dọn repo → (1) design system → (2) chuyển sang Astro, tách trang giới thiệu khỏi app → (3) app gia đình, ưu tiên điện thoại → (4) app chuyên viên và điều phối → (5) realtime + chế độ demo cho giám khảo → (6) kiểm thử toàn bộ. **Đã xong 0 đến 5.**

### Giai đoạn 0 · Dọn repo (commit `468af26`)
- Xóa: `landing.html`, `landing-v2.html`, `landing-v3.html`, `home-classic.html`, 3 ảnh .jpg cũ trong `preview/`, `netlify.toml`, hai thư mục rỗng `tmp/`, `audit-assets/`. Tất cả vẫn lấy lại được từ tag `ban-cu-v1` (`git checkout ban-cu-v1 -- <file>`).
- Nội dung "Góc sức khỏe" của home-classic lưu ở `docs/noi-dung/goc-suc-khoe.md` (cần mở lại từng link nguồn trước khi dùng).
- `backend/build-pages.cjs` không còn đọc/ghi home-classic; chạy lại cho kết quả giống hệt.
- `tinh-nang.html` 3,5 MB → 26 KB: 35 ảnh tách ra `preview/assets/tinh-nang/pl-XX.jpg` (lazy-load), logo và font trỏ về file có sẵn. Đã kiểm tra 40/40 ảnh hiện đúng.
- Chuyển vào `docs/`: logo gốc (`docs/thuong-hieu/homacare-logo-goc.png`), logo mới có tagline (`docs/thuong-hieu/logo-moi.jpg`), `docs/y-tuong-homacare.pdf`, `docs/IMAGE-ASSETS.md`, ảnh chụp kiểm thử (`docs/anh-chup-kiem-thu/`, bị ignore).
- `.gitignore`: bỏ skill bên thứ ba `.claude/skills/impeccable/`, `.claude/agents/impeccable-*`, `settings.local.json`; bỏ file xuất phụ lục (`Phu-luc-anh-chup/*.docx|pdf|html|png`). Bản HTML trùng trong Phu-luc đã gỡ khỏi git (file trên máy vẫn còn).
- `preview/_redirects`: link landing cũ và home-classic chuyển về `/`.
- `.claude/launch.json`: máy chủ xem thử `npx.cmd http-server preview -p 4173` (trên Windows phải là `npx.cmd`).

### Giai đoạn 1 · Design system v1.0 (commit `24cbba5` bản nháp + commit cuối phiên)
- **Người dùng đã duyệt:** font nội dung **Be Vietnam Pro**, tông xám **Mực** (ngả Navy), nền trang **Cát nhạt `#FEF9F4`**. Cal Sans giữ cho tiêu đề. Cho phép tự lưu trữ font.
- File (đều trong `preview/ds/`, CSS/JS thuần, không framework):
  - `tokens.css`: dải 50–950 theo OKLCH neo 5 màu thương hiệu, token ngữ nghĩa (`--color-action`, `--color-text-muted`, `--color-border-input`…), trạng thái theo giá trị DB (`--status-pending|assigned|in-progress|completed-{bg,fg,dot,border}`), 8 cỡ chữ, khoảng cách 4px, 4 bo góc, 3 bóng, 4 thời lượng.
  - `fonts.css` (Cal Sans `font-display: block` như đã chốt; Be Vietnam Pro 400/500/600 tách Latin/tiếng Việt, ~101 KB tại `assets/fonts/`, kèm giấy phép OFL), `base.css`, `components.css`, `components.js`, `icons.svg`.
  - 15 thành phần tiền tố `hc-`: Button, Field (Input/Select/Textarea/Check), Card, StatusPill, StatusTimeline, VisitCard (+ hàng điều phối), CareLogCard (+ đánh giá sao), Avatar/Person, Sheet/Modal (`<dialog>`), Toast, EmptyState, Tabs, BottomNav, Header, Skeleton.
  - `components.js` cung cấp `window.HC`: `HC.pill(status)`, `HC.timeline(status, {vertical, times})`, `HC.toast()`, `HC.openSheet()/closeSheet()`, `HC.init()`.
- `preview/design-system.html`: trang tài liệu (noindex, không link từ trang chủ), có demo chạy thật, HTML để chép, bảng đo tương phản trực tiếp, 2 màn hình điện thoại mẫu.
- `DESIGN.md` ở gốc: frontmatter token + quy tắc dùng token/thành phần, giọng văn, ưu tiên điện thoại, vùng chạm 44px, cách chuyển dần code cũ.
- Phát hiện quan trọng: Cal Sans chỉ có 1 độ đậm (code cũ đặt 700 → chữ đậm giả); Apricot gốc chỉ 2,4:1 trên trắng nên không làm màu chữ; viền ô nhập cũ không đạt 3:1.
- Đã kiểm tra: 17/17 cặp tương phản đạt AA; không tràn ngang ở 375px; mọi vùng chạm ≥ 44px trên cảm ứng; sheet mở/đóng/trả focus, toast, tabs bằng phím, đánh giá bằng phím chạy đúng; không lỗi console. Detector impeccable còn các cảnh báo có chủ đích (nền Sand là màu thương hiệu, chữ "Care" trong logo, chấm nhịp "Đang chăm sóc", shimmer khi tải).
- **Chưa đụng** vào `index.html`, `auth.html`, ba dashboard, `styles.css`, `account.css`: chúng vẫn dùng CSS cũ. Design system mới chỉ được dùng trong `design-system.html`.

### Giai đoạn 2 · Chuyển sang Astro, tách trang giới thiệu khỏi app (commit cuối phiên 13/10)
- **Người dùng đã duyệt:** tạo dự án Astro output tĩnh trong `web/` (npm, không SSR, không adapter), Supabase lấy từ gói npm `@supabase/supabase-js`, **dựng lại** trang giới thiệu bằng design system (không chép CSS cũ), thêm Góc sức khỏe sau khi kiểm link.
- **Đổi font (người dùng yêu cầu giữa phiên, chốt v1.2):** lần lượt hỏi Outfit + Segoe UI (Outfit không có tiếng Việt → thử Lexend + font hệ thống, commit `da1dd54`), rồi Zain + Nunito (Zain không có tiếng Việt, thiếu cả ă/đ/ơ/ư), cuối cùng **chốt Lora (tiêu đề, 600) + Nunito (nội dung)**, tự lưu trữ woff2 tách Latin/tiếng Việt (~100 KB cả hai). Người dùng yêu cầu **giữ chữ logo "HomaCare" bằng Cal Sans** (token `--font-brand`, chỉ `.hc-wordmark`). Màu, khoảng cách, thành phần giữ nguyên. `preview/ds/` vẫn ở v1.0. DESIGN.md đã cập nhật. Đã gửi người dùng mockup trước khi commit.
- Phiên bản: Astro 7.3.8, @supabase/supabase-js 2.117.3, Node 24. Không cài gì khác (chưa có `@astrojs/check`/TypeScript để kiểm kiểu; muốn thêm thì hỏi người dùng).
- Cấu trúc và cách chạy: xem `web/README.md`. Tóm tắt:
  - `web/src/styles/` = 4 file CSS của design system (nạp đúng thứ tự trong `BaseLayout.astro`) + `site.css` (trang giới thiệu) + `app.css` (khu app). `web/src/scripts/components.js` = bản chép `components.js`, chỉ đổi phần trạng thái ca/icon sang import từ `src/lib/status.ts`, `src/lib/html.ts`. `base.css` thêm quy tắc `[hidden]{display:none!important}`.
  - 15 thành phần thành component trong `web/src/components/hc/` (danh sách trong DESIGN.md mục "Chuyển dần code cũ"). `StatusPill`/`StatusTimeline` nhận prop `status`.
  - `src/lib/auth.ts` (từ auth.js) và `src/lib/visits.ts` (từ workspace.js): cùng bảng, cùng câu select, cùng 5 RPC, cùng câu báo lỗi. **Không đổi `backend/schema.sql`.**
  - Đường dẫn mới: `/`, `/app/` (chọn vai trò, hoặc tự chuyển theo vai trò nếu đã đăng nhập), `/app/dang-nhap/`, `/app/gia-dinh/`, `/app/chuyen-vien/`, `/app/dieu-phoi/`, `/tinh-nang` (chép nguyên từ preview). Email Supabase giờ trỏ `/app/dang-nhap/?role=…`.
  - Link cũ: `web/public/auth.html`, `family.html`, `caregiver.html`, `coordinator.html` chuyển bằng JavaScript, **giữ ?query và #fragment** (không dùng `_redirects` cho chúng vì tài liệu Cloudflare không nói rõ có giữ query). `_redirects` chỉ còn các landing cũ và `design-system.html` → `/`. Trang chủ và mọi trang app nhận `#access_token`/`?code` thì chuyển sang trang đăng nhập.
  - Ba không gian hiện là **khung + dữ liệu thật ở chế độ xem** (có dòng ghi chú giai đoạn 2 trên đầu): gia đình (ca sắp tới, lịch, nhật ký, người thân, tài khoản), chuyên viên (ca được giao, ca đã xong), điều phối (lọc theo 4 trạng thái bằng Tabs, xem chi tiết ca trong Sheet, danh sách chuyên viên). Đặt ca, thêm người thân, phân công, bắt đầu ca, ghi nhật ký, đánh giá: hàm đã có trong `visits.ts`, giao diện làm ở giai đoạn 3–4.
  - Chế độ giả lập `npm --prefix web run dev:fixture` (cổng 4322): `src/lib/fixture.ts` thay Supabase, dữ liệu minh họa trong sessionStorage; đã kiểm tra bản build không chứa file này. Có thể làm nền cho "chế độ demo cho giám khảo" ở giai đoạn 5.
- Trang giới thiệu: giữ thứ tự mục và các quyết định đã chốt (chữ hero chiếm gần trọn màn đầu trên điện thoại, "Sự quan tâm vẫn ở gần." một dòng; "Về HomaCare" lên trước "Dõi theo từ xa" trên điện thoại, ẩn đoạn 3 và ảnh; 3 thẻ teal; 4 giá trị 2×2; điện thoại ẩn 4 thẻ dịch vụ, thay bằng "Chăm sóc theo buổi tại nhà"; bảng giá desktop đủ 3 gói, mobile rút gọn 2 gói đang phát triển; hiện dần 1,1s/36px/140ms; "Cách sử dụng" trên điện thoại mở minh họa ngay dưới bước bấm, bấm lại thì thu, bù cuộn, không tự cuộn/tự chuyển; desktop minh họa dính bên phải). Đơn giản hơn bản cũ: hero không còn 3 tab + điện thoại vuốt; minh họa dựng bằng component thật (VisitCard, CareLog, Timeline…) và ghi "dữ liệu minh họa". Thêm mục "Góc sức khỏe" vào menu.
- Góc sức khỏe: đã mở lại 3 link ngày 13/10/2026, cả ba còn hoạt động (Cục Dân số 30/09/2026, server lỗi chuỗi chứng chỉ với một số công cụ nhưng trang trả 200; WHO Đông Nam Á 01/10/2026; WHO fact sheet 01/10/2025). Hai bài WHO ghi "Bài viết bằng tiếng Anh".
- Đã kiểm tra: build sạch (7 trang, ảnh tự nén webp); không tràn ngang ở 375px và 1280px; header vừa ở 900px; Lora/Nunito/Cal Sans nạp đúng, đủ dấu; chuỗi giả lập: đăng nhập chuyên viên → `/app/chuyen-vien/`, vào sai vai trò bị đưa về đúng không gian, đăng xuất về `/`, `/auth.html?role=caregiver#error_code=…` → trang đăng nhập giữ role và báo link hết hạn, Tabs lọc và Sheet chi tiết mở/focus đúng, "Cách sử dụng" trên điện thoại giữ bước đứng yên khi chuyển. Không tạo dữ liệu hay tài khoản Supabase thật. Khung trình duyệt của Claude chạy ẩn nên ảnh chụp dùng Chrome headless qua DevTools.
- `.claude/launch.json`: thêm `web` (4321), `web-fixture` (4322), `web-dist` (4323, `astro preview`).

### Trước khi merge `thiet-ke-lai` vào `main` (người dùng phải duyệt từng việc)
1. **Cloudflare Pages** (project homacare-demo → Settings → Builds): **Root directory** `web`; **Build command** `npm run build`; **Build output directory** `dist`; biến môi trường `NODE_VERSION` = 22 trở lên. Hiện đang là build command trống, output `preview`.
2. **Supabase → Authentication → URL Configuration:** đổi **Site URL** từ `https://homacare-demo.pages.dev/auth.html` thành `https://homacare-demo.pages.dev/app/dang-nhap/` (giữ nguyên cũng chạy nhờ trang chuyển hướng, nhưng đổi để bớt một bước). Giữ Redirect URL `https://homacare-demo.pages.dev/**`. Email template nào ghi cứng `auth.html` thì sửa theo.
3. Sau khi deploy (nên thử trên URL preview của nhánh trước): một email xác nhận mới, một email quên mật khẩu, đăng nhập 3 vai trò, link cũ `/family.html?booking=1`.
4. Thử trên iPhone thật: font Lora/Nunito, "Cách sử dụng", sheet, BottomNav.
5. Giữ `preview/` cho tới khi giai đoạn 3–4 xong rồi mới quyết định bỏ.
6. **Realtime** (giai đoạn 5): `alter publication supabase_realtime add table public.visits;` trên Supabase, rồi thử hai tài khoản thử ở hai trình duyệt.

### Giai đoạn 3 · App gia đình, ưu tiên điện thoại (commit `40c3d13` phần 1 + commit "Giai đoạn 3 (phần 2)")
- Thao tác nằm trong `web/src/scripts/family.ts`; trang `web/src/pages/app/gia-dinh.astro` chỉ vẽ HTML và khai báo hai sheet. Gọi đúng RPC/bảng qua `src/lib/visits.ts`, **không đổi `backend/schema.sql`**.
  - **Thêm người thân** (sheet `#relative-sheet`): kiểm tra từng ô (tên ≥ 2 ký tự, tuổi 18–120, khu vực), lỗi đặt dưới đúng ô và gắn `aria-describedby`, focus vào ô lỗi đầu tiên, gõ lại thì lỗi tự mất.
  - **Đặt ca 2 bước** (sheet `#booking-sheet`): bước 1 chọn người thân (chỉ hiện khi có ≥ 2), hàng thẻ 21 ngày dd/mm (`.app-day`, radio thật nên phím mũi tên chạy sẵn; ngày người thân đã có ca bị khóa vì DB chỉ cho một ca mỗi ngày), lưu ý + bộ đếm; bước 2 xem lại rồi mới gọi `book_homa_visit`. Trùng ngày (23505) → tải lại dữ liệu, khóa ngày đó, bỏ chọn, báo "Bố đã có ca vào Thứ Sáu, 16/10…" dưới hàng ngày; ngày đã qua → báo dưới hàng ngày. Đóng sheet rồi mở lại luôn về bước 1.
  - **Đánh giá sao** trong nhật ký: radiogroup (`hc:rate`), nút "Gửi đánh giá" chỉ bật khi đã chọn sao → `rate_homa_visit` → hiện chỉ đọc + toast. Phím ←/→/↑/↓ và Home/End (Home/End thêm ở phần 2 trong `components.js`).
  - `?booking=1` mở thẳng đặt ca rồi xóa tham số; chưa có người thân thì mở thêm người thân trước, lưu xong tự mở đặt ca.
  - Chưa có người thân: chỉ một thẻ "Bắt đầu bằng hồ sơ người thân" ở đầu (mục Người thân ẩn để không lặp). Đổi/hủy ca và sửa hồ sơ: hướng dẫn gọi 0338 031 425.
- Phần 2 sửa thêm: `HC.closeSheet()` trả về Promise xong khi sheet đóng hẳn (không dựa vào sự kiện `close`, vốn bị treo khi khung trình duyệt ẩn); sau khi lưu/đặt/đánh giá, trang vẽ lại nên focus được đưa về phần tử tương ứng mới (`refocus()` trong `family.ts`: nút Đặt ca mới, nút Thêm người thân, hoặc khối đánh giá chỉ đọc của đúng ca). Ô "Mối quan hệ" không còn bị kéo cao khi ô Tuổi báo lỗi (`.app-row2 { align-items: start }`).
- Fixture: thêm tài khoản gia đình chưa có người thân — đăng nhập email bắt đầu bằng `family-new` hoặc đặt localStorage `homa-session-fixture` = `family-new` (giá trị khóa giờ là `key` của hồ sơ, không còn là vai trò). Fixture cũng báo trùng ngày (23505) và ngày đã qua như DB thật.
- **Đã kiểm tra** (fixture, Chrome headless qua DevTools với phím thật, ở 375px và 1280px): mở đặt ca bằng Enter; ←/→ trong hàng ngày bỏ qua ngày đã có ca, vòng về cuối, có viền focus, thẻ luôn nằm trong vùng nhìn thấy; Esc đóng sheet ở cả bước 1 và 2, focus về nút "Đặt ca mới"; bước 2 focus vào vùng xem lại; đặt ca thành công → toast, "3 ca đang mở", focus về nút; trùng ngày như trên; đánh giá bằng phím → Tab tới "Gửi đánh giá" → Enter → "3 trên 5 sao" chỉ đọc + toast, focus ở khối đánh giá; thêm người thân báo đủ 3 lỗi, Esc trả focus về "Thêm người thân"; tài khoản `family-new` + `?booking=1` → sheet người thân + toast nhắc → lưu → sheet đặt ca tự mở (ẩn ô chọn người thân vì chỉ có 1). Ở 1280px sheet là hộp 560px giữa màn hình, hàng ngày vẫn cuộn ngang. Không tràn ngang ở cả hai cỡ (kể cả khi mở sheet), không lỗi console. `npm --prefix web run build` sạch, bản build không chứa fixture.
- **Cần người dùng duyệt (chưa làm):** cho gia đình tự sửa hồ sơ người thân cần thêm policy UPDATE cho bảng `relatives` trong `backend/schema.sql` (chỉ chủ hồ sơ, `family_id = auth.uid()`) rồi chạy trên Supabase. Hiện app hướng dẫn gọi 0338 031 425.

### Giai đoạn 4 · App chuyên viên và điều phối (commit "Giai đoạn 4")
- `web/src/scripts/forms.ts` (mới): phần dùng chung tách từ `family.ts` — `setError` (ô hoặc nhóm `fieldset`), `clearErrors`, `formError`, `busy`, `close` (chờ sheet đóng hẳn), `refocus`, `syncCounters`; tự gỡ lỗi khi sửa ô và đếm ký tự cho mọi textarea có maxlength.
- **Chuyên viên** (`chuyen-vien.astro` + `scripts/caregiver.ts`):
  - Ba mục: **Cần làm** (ca từ hôm nay trở về trước chưa xong, ca đang chăm sóc lên đầu), **Sắp tới**, **Ca đã hoàn thành** (nút "Nhật ký" mở sheet chỉ đọc).
  - Nút "Bắt đầu ca" chỉ hiện từ ngày chăm sóc (ca tương lai ghi "Nút Bắt đầu ca hiện vào Thứ…"); bấm thì hỏi lại trong sheet vì không hoàn tác được → `start_homa_visit`.
  - "Ghi nhật ký và hoàn thành ca": sheet 2 bước. Bước 1: 4 hoạt động (bắt buộc đủ, đúng như RPC), ghi nhận chung (3 lựa chọn của DB; chọn "Cần điều phối viên liên hệ" thì nhắc gọi 0338 031 425), nhật ký ≥ 10 ký tự có bộ đếm, lời nhắn lần tới. Bước 2: xem trước bằng chính thẻ CareLog gia đình sẽ thấy + câu "gửi xong không sửa lại được" (không có policy UPDATE cho `visits`) → `complete_homa_visit`. Lỗi `incomplete_tasks`/`invalid_report` từ RPC đưa về bước 1, báo dưới đúng chỗ.
  - **Bản nháp** nhật ký lưu localStorage theo ca (`homa-report-draft-<id>`) mỗi lần gõ; mở lại thì điền sẵn và báo "Đã mở lại bản nháp"; thẻ ca ghi "có bản nháp chưa gửi"; gửi xong thì xóa.
- **Điều phối** (`dieu-phoi.astro` + `scripts/coordinator.ts`):
  - Danh sách xếp việc cần làm lên trước (chờ phân công → đang chăm sóc → đã phân công → hoàn thành mới nhất); ca chờ có nút chính "Phân công". Bộ lọc tab giữ nguyên sau khi vẽ lại.
  - Sheet "Phân công ca": hồ sơ người thân (thói quen), lưu ý gia đình, danh sách chuyên viên dạng radio có avatar — người đã có ca tối đó bị khóa ("Đã có ca tối này"), người trống ghi số ca đang nhận. Chưa chọn → lỗi dưới nhóm; 23505 → tải lại, khóa người vừa bận, báo tên; `invalid_state` (người khác đã phân công) → đóng, cập nhật, toast. Không còn ai trống → nút tắt và nhắc gọi gia đình đổi ngày.
  - Mục Chuyên viên ghi số ca chưa hoàn thành của từng người.
- Đã gỡ dòng ghi chú giai đoạn (`notice`) ở cả hai trang; prop `notice` của `AppLayout` vẫn giữ (có thể dùng cho chế độ demo giai đoạn 5).
- **Lỗi có sẵn từ giai đoạn 2 đã sửa:** bấm tab lọc ở trang điều phối (trừ tab cuối) làm cả danh sách bị ẩn, vì mọi tab dùng chung một panel và `initTabs` ẩn panel theo tab chưa chọn. `preview/ds/components.js` vẫn còn lỗi này (không sửa `preview/`).
- Sửa nhỏ: `.hc-check` không còn hai vòng focus lồng nhau; đường chia đầu danh sách điều phối khi hàng đầu bị lọc ẩn.
- Fixture: thêm gia đình thứ hai (không đăng nhập được) có yêu cầu chờ tối nay, để thấy chuyên viên đã bận; RPC giả lập kiểm tra đúng điều kiện của `assign/start/complete_homa_visit` (vai trò, trạng thái, 23505 chuyên viên trùng tối, `incomplete_tasks`, `invalid_report`).
- **Đã kiểm tra** (fixture, Chrome headless với phím thật, 375px và 1280px, cùng một dữ liệu đi qua ba vai trò): điều phối lọc "Chờ phân công" bằng phím mũi tên, mở phân công bằng Enter, lỗi chưa chọn, 23505, chọn bằng Space + Enter → toast, focus về tab đang chọn, bộ lọc giữ nguyên; Esc ở sheet chi tiết trả focus về nút "Nhật ký". Chuyên viên: Esc ở sheet bắt đầu không đổi trạng thái; bắt đầu ca → focus vào "Ghi nhật ký"; lỗi đủ 4 hoạt động + nhật ký ngắn (focus vào hoạt động chưa đánh dấu); đóng rồi mở lại còn bản nháp; xem trước không có dòng đánh giá; gửi → toast, focus "Ca đã hoàn thành", bản nháp bị xóa; sheet nhật ký đã gửi. Gia đình thấy nhật ký mới ở trạng thái chờ đánh giá. Hai kịch bản gia đình của giai đoạn 3 vẫn đạt. Không tràn ngang, không lỗi console; build sạch, bản build không chứa fixture.

### Giai đoạn 5 · Realtime + chế độ demo cho giám khảo (commit "Giai đoạn 5")
- **Người dùng chọn:** bật demo bằng **đường dẫn riêng**.
- **Chế độ demo** (`src/lib/demo.ts`, trang `src/pages/demo.astro`):
  - `/demo/` giới thiệu, 3 thẻ vai trò, gợi ý một vòng chăm sóc 4 bước, lưu ý (dữ liệu minh họa, phi y tế), nút đặt lại dữ liệu.
  - `/demo/?vai-tro=gia-dinh|dieu-phoi|chuyen-vien|gia-dinh-moi` bật demo **cho riêng tab đó** (cờ ở sessionStorage) rồi vào thẳng không gian. Link mở được trong tab mới, nên mỗi tab một vai trò.
  - Tab demo dùng client giả lập `fixture.ts` với nơi lưu riêng: vai trò ở sessionStorage (`homa-demo-session`), dữ liệu ở localStorage (`homa-demo-data`) dùng chung giữa các tab demo, tự tạo lại khi sang ngày mới. Không gọi Supabase (đã đo: 0 yêu cầu tới supabase.co).
  - Ở bản build thật `fixture.ts` là file tách riêng (`_astro/fixture.*.js`), chỉ tải khi tab ở chế độ demo.
  - Thanh "Chế độ demo" đầu mỗi không gian: câu "Dữ liệu minh họa…", đổi vai trò (Gia đình / Chuyên viên / Điều phối), "Đặt lại dữ liệu". Nút Đăng xuất thành "Thoát chế độ demo" (về trang chủ).
  - Vào `/app/dang-nhap/` là tự rời demo, để mật khẩu thật không bao giờ gõ vào client giả lập. Tab không ở demo vào `/app/…` vẫn ra trang đăng nhập thật.
- **Cập nhật tức thì** (`src/scripts/live.ts`, nối trong `workspace.ts`):
  - Supabase Realtime `postgres_changes` trên bảng `visits` (RLS vẫn lọc), cộng tải lại khi quay về tab sau hơn 30 giây hoặc có mạng lại. Trong demo, kênh giả lập báo khi tab demo khác ghi dữ liệu (sự kiện `storage`).
  - Dữ liệu không đổi thì không vẽ lại. Đang mở sheet hoặc đã chọn sao chưa gửi thì chờ, xong mới vẽ (không mất chữ đang gõ). Vẽ lại thì giữ focus ở phần tử tương ứng.
  - Báo toast "Có cập nhật mới" cho thay đổi do người khác tạo: gia đình (được phân công / bắt đầu ca / có nhật ký), chuyên viên (được giao ca), điều phối (yêu cầu mới, nhật ký mới). Thao tác của chính mình không sinh câu nào.
- **Cần người dùng duyệt để realtime chạy với Supabase thật (chưa làm, không sửa `schema.sql`):** chạy trong Supabase SQL Editor `alter publication supabase_realtime add table public.visits;` (hoặc Database → Publications → bật `visits`). Chưa chạy thì app vẫn đúng, chỉ cập nhật khi quay lại tab hoặc bấm Cập nhật. Sau khi chạy nên thêm dòng này vào `schema.sql` cho đồng bộ (cũng cần duyệt).
- **Đã kiểm tra** trên **bản build thật** (`astro preview`, cổng 4323), Chrome headless hai tab, 375px và 1280px:
  - Tab A (gia đình) và tab B (điều phối) vào bằng `/demo/?vai-tro=…`.
  - B phân công → A cập nhật tại chỗ, toast đúng câu, focus vẫn ở "Đặt ca mới".
  - A đang mở sheet đặt ca và gõ dở, B (đổi sang chuyên viên) bắt đầu ca → A giữ nguyên sheet và chữ; đóng sheet thì mới vẽ lại và báo.
  - B gửi nhật ký → A thấy nhật ký chờ đánh giá. "Đặt lại dữ liệu" ở B → A về dữ liệu ban đầu.
  - Trang đăng nhập xóa cờ demo; "Thoát chế độ demo" về `/`; sau đó `/app/gia-dinh/` ra trang đăng nhập thật.
  - Không lỗi console, không tràn ngang. Các kịch bản giai đoạn 3–4 trên `dev:fixture` vẫn đạt.
- Chưa kiểm được realtime với Supabase thật (chưa bật publication, và không được tạo dữ liệu thật).

### Việc tiếp theo — Giai đoạn 6 · Kiểm thử toàn bộ
- Chạy lại mọi kịch bản (`giai-doan-*` trong thư mục ghi chú chung có script) ở 375/768/1280, bàn phím, trình đọc màn hình (nhãn), giảm chuyển động; trang giới thiệu, đăng nhập, `/demo/`, ba không gian.
- Kiểm với Supabase thật khi người dùng cho phép: tài khoản thử, realtime sau khi bật publication, link email.
- Gợi ý (cần người dùng duyệt): thêm link "Dùng thử" tới `/demo/` trên trang giới thiệu; thêm `alter publication` vào `schema.sql`; cấu hình Cloudflare cho bản mới (xem mục "Trước khi merge").

### Xem bản mới trên web thật mà không đụng trang đang chạy (người dùng hỏi 13/10)
- Trang homacare-demo.pages.dev vẫn là `preview/` từ `main`. Nhánh `thiet-ke-lai` đã có trên GitHub (người dùng push lúc 18:02 ngày 13/10, đến `00a716d`) nhưng chưa được build ở đâu.
- Không đổi build settings của project `homacare-demo`: cấu hình build dùng chung cho mọi nhánh, đổi sẽ làm hỏng lần deploy tới của `main`.
- Cách an toàn: tạo **project Cloudflare Pages mới** nối cùng repo:
  - Production branch: `thiet-ke-lai`
  - Root directory: `web`
  - Build command: `npm run build`
  - Output directory: `dist`
  - `NODE_VERSION` = 22
- Thao tác thật trên địa chỉ đó vẫn ghi vào cùng Supabase. Muốn thử không ghi gì thì dùng `/demo/`.
- **Đã làm (13/10, người dùng tự thao tác):** project Pages **`homacaredemo`** (không gạch ngang, khác `homacare-demo` đang chạy), tạo bằng **Direct Upload** thư mục `web/dist` của commit `aa10fa7` (giai đoạn 5).
  - Địa chỉ: **https://homacaredemo.pages.dev**
  - Cập nhật: build lại → project → Create deployment → kéo lại `web/dist`. Project Direct Upload không chuyển sang nối GitHub được; muốn tự deploy khi push thì tạo project khác.
  - (Trước đó người dùng thử tạo nhầm một Worker `icy-disk-0031` rồi đã xóa.)
  - **Đã kiểm tra trên địa chỉ thật:**
    - Mọi trang trả 200; 404 riêng; `/family.html?booking=1` → 308 `/family?booking=1` rồi JS chuyển `/app/gia-dinh/` giữ tham số; `_redirects` chạy.
    - Font Lora/Nunito/Cal Sans nạp đủ; không tràn ngang ở 375/1280; không lỗi console.
    - Kịch bản demo hai tab đạt như trên máy, 0 yêu cầu tới Supabase.

### Còn để ngỏ
- Cal Sans (TTF 100 KB) trong bản Astro chỉ còn cho chữ logo và trang `/tinh-nang`; nên chuyển sang woff2 (cần `woff2_compress` hoặc fonttools, máy chưa có).
- `tinh-nang.html` vẫn dùng CSS nội tuyến riêng (cả bản chép trong `web/public/`), chưa chuyển sang design system.
- Chưa có trang tài liệu design system cho bản Astro (`preview/design-system.html` vẫn mô tả v1.0 với Cal Sans); có thể làm trang `/thiet-ke` noindex.
- Chưa kiểm kiểu TypeScript (`astro check` cần cài thêm `@astrojs/check` và `typescript`, phải hỏi người dùng).
- Chưa tạo file phụ `.impeccable/design.json` cho bảng điều khiển của skill impeccable (không bắt buộc).
- Việc cũ còn treo: bật lại Confirm email hoặc cấu hình Custom SMTP; thử hiệu ứng trên iPhone thật.

---

## TRẠNG THÁI 08/10/2026 (trước phiên thiết kế lại)

Phần này thay thế mọi thông tin về hosting/Netlify ở các mục lịch sử bên dưới. Các mục nói về `landing*.html`, `home-classic.html`, `netlify.toml` đã lỗi thời sau phiên 13/10.

### Hosting và triển khai
- Website chính: **https://homacare-demo.pages.dev** (Cloudflare Pages, project `homacare-demo`, nối GitHub `hienminh123/HOMACARE-APP`, nhánh `main`, build command trống, output directory `preview`). Push lên `main` là Cloudflare tự deploy, miễn phí.
- Netlify (`demo-homacare.netlify.app`) đã **Unlink repository**: không còn tự deploy, không tốn credit; bản cũ vẫn mở được. Gói Free Netlify còn khoảng 27 credit (mỗi production deploy 15 credit).
- Worker thử nghiệm `homacare-app.minh30d.workers.dev` có thể đã bị người dùng xóa; không dùng.
- `preview/config.js` → `siteUrl: 'https://homacare-demo.pages.dev/'`.
- Supabase URL Configuration: Site URL `https://homacare-demo.pages.dev/auth.html`; Redirect URLs có `https://homacare-demo.pages.dev/**` (Cloudflare tự bỏ đuôi .html: `auth.html` → `/auth`, giữ query).
- Supabase: người dùng được hướng dẫn **tắt Confirm email** để người test đăng ký được (SMTP mặc định chỉ gửi cho thành viên project). Khi test xong cần bật lại hoặc cấu hình Custom SMTP. Quên mật khẩu vẫn cần email.
- `preview/_redirects`: `/landing-v4.html / 301` (Cloudflare). `netlify.toml` giữ lại, không còn dùng.
- Người dùng tự commit/push bằng GitHub Desktop; Claude không commit trừ khi được yêu cầu.

### Cấu trúc trang
- `preview/index.html` = trang chủ mới (landing v4: nền bản 2 + bento/demo tương tác từ bản 3). Không nhận diện phiên đăng nhập (nút Đăng nhập/Đăng ký mở popup vai trò; auth.html tự chuyển nếu đã có phiên).
- `preview/home-classic.html` = trang chủ cũ (Góc sức khỏe, nhận diện phiên). `backend/build-pages.cjs` giờ đọc/ghi `home-classic.html`, **không đụng `index.html`**. Menu chuyên viên trỏ `index.html#roles`.
- `landing.html`, `landing-v2.html`, `landing-v3.html` vẫn còn trong repo (bản so sánh cũ, chưa xóa).
- Ảnh đã nén: `assets/app-icon-h.png` 256px (~49 KB), `assets/logo.png` 256px (~25 KB), `apple-touch-icon.png` 180px, thêm `assets/app-icon-512.png` (chỉ dùng trong manifest).
- Font: preload Cal Sans + `font-display: block` (index.html, styles.css, builder) để hết nháy font.

### Quyết định giao diện đã chốt (index.html)
- Header: nền trắng trên mobile, nút "Đăng nhập / Đăng ký" teal bo 10px (cả desktop).
- Hero mobile: tiêu đề "Sự quan tâm vẫn ở gần." một dòng (clamp theo vw, nowrap); phần chữ chiếm gần trọn màn hình đầu (min-height 100svh − 64px − 110px); 3 tab + điện thoại minh họa chỉ hiện khi bắt đầu cuộn (≥8px). Bỏ dòng ✓ trust line; 3 tab một hàng, không icon; vuốt ngang ảnh điện thoại để chuyển màn.
- Mobile: "Về HomaCare" lên trước "Dõi theo từ xa" (wrapper `.intro-order`), ẩn đoạn văn thứ 3 và ảnh story; 4 giá trị cốt lõi 2×2; ẩn intro + 4 thẻ dịch vụ, thay bằng tiêu đề "Chăm sóc theo buổi tại nhà".
- 3 thẻ "Dõi theo từ xa" đều nền teal (`value-card-featured`).
- Bảng giá: desktop hiện đủ 3 gói (Chăm chút 600–800k, Thân tình 2,8tr, nhãn "Đang phát triển · Chưa mở đặt lịch"); mobile chỉ Ân cần đầy đủ, 2 gói kia rút gọn (tên + "Đang phát triển").
- Hiệu ứng hiện dần khi cuộn (`.reveal`, IntersectionObserver): 1,1s, trượt 36px, trễ 140ms giữa thẻ cạnh nhau.
- Desktop: màn hình minh họa "Cách sử dụng" sticky top 96px (thiết bị cao clamp 460–640px, steps-list padding-bottom 300px); ảnh story "Về HomaCare" sticky top 96px.
- Footer gọn: logo + khẩu hiệu, 4–5 link (mobile ẩn "Liên hệ"), dòng © + tel/mail bấm được. Đã bỏ dòng "Hình ảnh minh họa được tạo bằng AI".
- Chỉnh chữ: "tin&nbsp;cậy" và đoạn bento max-width 720px; tiêu đề FAQ "Những điều bạn muốn biết trước buổi đồng hành."

### "Cách sử dụng" trên mobile — trạng thái chốt và các kiểu ĐÃ BỊ TỪ CHỐI
- **Hiện tại (commit ddec09b, khôi phục lại)**: một khung minh họa dùng chung, bấm bước nào thì mở dưới bước đó (slideDownDemo 0,5s), bấm lại bước đang mở thì thu lại trong 0,5s (`closeJourneyDemo`). Không tự cuộn; khi minh họa phía trên bị gỡ thì bù scroll ngay để thẻ vừa bấm đứng yên. Có dòng "👆 Chạm vào từng bước để xem màn hình minh họa"; ẩn nhãn phụ và nút trên từng thẻ.
- Người dùng đã thử và **không muốn**: tự chuyển bước sau 10 giây; đổi bước theo cuộn (scroll-driven); trang tự cuộn/kéo thẻ lên header khi mở; hiệu ứng đóng-rồi-mở 2 nhịp; accordion kiểu FAQ với 6 khung riêng (commit 9901353, đã revert). Đừng đề xuất lại các kiểu này trừ khi được hỏi.
- Lưu ý kiểm thử: browser pane chạy ẩn → rAF/WAAPI/IntersectionObserver không chạy; phải tua `animation.currentTime` hoặc gọi hàm trực tiếp để đo, và tự tắt `scroll-behavior: smooth` khi đo vị trí.

### Việc còn để ngỏ
- Thử trên iPhone thật các hiệu ứng mobile sau mỗi lần push.
- Xóa hoặc giữ landing.html / landing-v2 / landing-v3.
- Bật lại Confirm email hoặc cấu hình Custom SMTP sau đợt test.
- README/SUPABASE-SETUP đã cập nhật sang Cloudflare.

---

## Lịch sử (thông tin Netlify bên dưới đã lỗi thời)

## Phiên triển khai mới — checkpoint 07/10/2026

- Người dùng bắt đầu phiên mới, coi các audit và kế hoạch trước đó là ngữ cảnh cũ. Không đọc hoặc dùng AUDIT-HOMACARE-2026-10-07.md hay audit-assets/ trừ khi người dùng yêu cầu. Mã nguồn trên đĩa là nguồn sự thật.
- Yêu cầu hiện tại: thêm FAQ và phạm vi ca Ân cần; thêm bước xem lại yêu cầu trước khi gửi; tạo ảnh chân thực bằng AI thay các minh họa lớn. Tham khảo trang bCare người cao tuổi của bTaskee, không sao chép nội dung hoặc cam kết nhân sự.
- Đã sửa preview/index.html: 7 FAQ; phạm vi hỗ trợ sinh hoạt và công việc cần chuyên môn y tế; liên hệ tel:0338031425 và mailto:homacare@gmail.com. Người dùng yêu cầu hiển thị email trực tiếp, không ghi "email dự kiến".
- Đã tạo 5 ảnh bằng công cụ image_gen tích hợp: companion, meal, walk, family, caregiver. JPEG 1200x800 tại preview/assets/photos/, tổng khoảng 0,9 MB. Thay hero, giới thiệu, ảnh Góc sức khỏe, 4 dịch vụ/popup và khu chuyên viên. Có ghi nguồn AI ở footer. Prompt đầy đủ và đường dẫn lưu trong IMAGE-ASSETS.md. Giữ icon thao tác và logo.
- Đã sửa preview/workspace.js: form đặt ca có bước Thông tin ca → Xác nhận; bản xem lại có người thân, khu vực hiện có trong hồ sơ, ngày, giờ18–22, gói, ghi chú và giá320.000đ. Chỉ RPC khi bấm Xác nhận & gửi yêu cầu; quay lại giữ dữ liệu. Không thay schema/backend, không thêm địa chỉ mới hoặc thanh toán.
- Style mới nằm trong preview/styles.css và preview/account.css. Đã chạy node backend/build-pages.cjs, JS syntax và git diff --check đạt. 28 kiểm tra database PGlite đạt trong phiên này.
- Browser fixture đã xác nhận: trước xem lại2 ca, sau xem lại vẫn2, sau xác nhận3; quay lại giữ ngày/ghi chú, chỉnh ngày và ghi chú phản ánh đúng ở bản xem lại. Chuỗi <b> trong ghi chú được escape. Không tạo dữ liệu hoặc tài khoản Supabase thật.
- Kiểm tra mobile qua iframe cùng nguồn (viewport override của IAB không áp dụng): trang chủ320/390px không tràn ngang; form xác nhận390px hiển thị theo cột, có cuộn dọc. Screenshot tại C:/Users/phamh/.codex/visualizations/2026/10/07/01a1149f-0daa-77d2-942d-d59cc869e604/homacare-mobile-preview.jpg. Hai file harness tạm đã xóa khỏi preview.
- Phiên tiếp tục sau reset: đã kiểm tra trực quan ở màn 390px các ảnh dịch vụ, FAQ, phạm vi ca và liên hệ; không tràn ngang. Đã xem diff của các file thuộc phần việc này và cập nhật preview/README.txt. preview/landing.html là công việc Antigravity riêng của người dùng, để nguyên.
- Hoàn tất kiểm tra ở phiên tiếp tục: 28 kiểm tra PGlite đạt; `node --check preview/workspace.js` và `git diff --check` đạt; ảnh tải và hiển thị trên trình duyệt; màn 390px không tràn ngang. Đã đóng các tab và máy chủ fixture của phiên kiểm tra. Chưa commit/push/deploy.
- Trạng thái Git: các file sửa cho tính năng gồm CONTINUE-HOMACARE.md, preview/README.txt, preview/account.css, preview/index.html, preview/styles.css, preview/workspace.js; file mới IMAGE-ASSETS.md và preview/assets/photos/. preview/landing.html là việc Antigravity riêng của người dùng, không chỉnh sửa.
- Giới hạn 5 giờ đã reset trước phiên tiếp tục. Không dùng reset credit.

Cập nhật 06/10/2026 (Asia/Saigon). Người dùng đã yêu cầu tiếp tục công việc sau lần dừng; yêu cầu tài khoản hiện đã được triển khai trên máy.

## Yêu cầu và phạm vi

- Bỏ nhãn bản xem trước/bản mẫu trong sản phẩm; giữ giao diện đã được duyệt.
- Popup 3 vai trò: Gia đình, Chuyên viên chăm sóc, Điều phối viên.
- Gia đình và chuyên viên đăng ký/đăng nhập email + mật khẩu.
- Người dùng yêu cầu hỗ trợ nhiều điều phối viên: màn điều phối hiện nhập email + mật khẩu riêng, bỏ coordinatorEmail khỏi config. Kiểm tra role coordinator bằng Supabase.
- Dữ liệu mới trống theo tài khoản; không đưa người thân/chuyên viên giả vào tài khoản thật.
- Website tĩnh trong preview, deploy bằng kéo folder lên Netlify.

## Đã hoàn thành

- config.js có siteUrl Netlify, Project URL và Publishable key; không có email đăng nhập cố định.
- auth.html/auth.js/account.css: đăng ký, đăng nhập, xác nhận email, quên mật khẩu, popup vai trò, giao diện điện thoại.
- workspace.js: xác thực và kiểm tra vai trò, thêm người thân, đặt ca, điều phối, bắt đầu ca, nhật ký, đánh giá.
- 3 dashboard đã nối Supabase, có loading/empty state. Trang chủ đã bỏ nhãn xem thử và tên nhân sự giả.
- backend/build-pages.cjs đã chạy; có thể chạy lại để tạo auth/3 dashboard. Đổi scaffold thì sửa builder.
- preview.js đã ghép backend/ui-handlers.txt, giữ icon SVG.
- README.txt và SUPABASE-SETUP.md đã cập nhật.
- Logo H không có chữ/tagline, Cal Sans và màu nhận diện vẫn giữ.

## Backend thật — người dùng đã xác nhận

- Project URL: https://rjxknbmcsnbugjvgchla.supabase.co
- Website: https://demo-homacare.netlify.app/
- Coordinator email: minh30d@gmail.com
- backend/schema.sql: người dùng chạy thành công, Success. No rows returned.
- Site URL https://demo-homacare.netlify.app và Redirect URL https://demo-homacare.netlify.app/auth.html* đã lưu.
- User minh30d@gmail.com đã tạo trong Authentication, người dùng tự đặt mật khẩu.
- backend/promote-coordinator.sql đã chạy thành công, cấp role coordinator.
- Không hỏi mật khẩu hoặc Secret/service_role key trong chat.

## Kiểm chứng đã thực hiện

- JS syntax checks thành công.
- tests/database.test.mjs: 28 kiểm tra PostgreSQL PGlite thành công về RLS, chống tự đổi vai trò, sở hữu dữ liệu, trạng thái ca, lịch trùng, nhật ký và đánh giá.
- Read-only live backend/check-connection.cjs: Auth200, email enabled, email confirmation required. Anon profiles trả401/42501 đúng như quyền được đặt.
- UI thật localhost4173: signup validation mật khẩu lệch, 3 vai trò, coordinator chỉ mật khẩu, responsive390px không tràn ngang.
- tests/ui-server.cjs fixture localhost4174: thêm người thân, đặt ca, phân công và lọc, bắt đầu ca, 4 hoạt động và gửi báo cáo đều xác nhận thành công trên giao diện.
- Fixture chỉ kiểm tra frontend, không thay thế đăng nhập/gửi email/lưu dữ liệu trên Supabase thật. Không publish tests hoặc backend.
- Ảnh account-ready.jpg ở gốc dự án là popup chọn vai trò thật, ngoài public preview.

## Còn cần hoàn tất

1. Người dùng đã báo Published. CUA xác nhận bản mới online, popup đủ3 vai trò, điều phối chỉ mật khẩu; family.html chuyển về auth khi chưa login.
2. Sau deploy đã bỏ cụm bài đọc mẫu và thêm thông báo email address not authorized. Theo yêu cầu mới, điều phối hiện nhập email + mật khẩu, có quên mật khẩu, không còn email cố định. UI đã kiểm tra ở localhost; chưa deploy các thay đổi mới. backend/promote-coordinator.sql có target_email để chủ dự án cấp quyền cho từng người. Không cần đổi schema.
3. Người dùng đã publish repository private https://github.com/hienminh123/HOMACARE-APP. Kiểm tra Git trên máy xác nhận main theo dõi origin/main, remote đúng repo trên. .gitignore bỏ node_modules, env và ảnh kiểm tra; netlify.toml publish=preview. Chưa có xác nhận đã nối Netlify với repository; cần nối existing demo-homacare để tự deploy sau push.
3. Người dùng đã xác nhận đăng nhập Điều phối viên trên Netlify thành công. Không yêu cầu gửi password.
4. Người dùng thử đăng ký Gia đình và Chuyên viên bằng email khác. Email confirmation đang bật; SMTP mặc định Supabase thường giới hạn đến địa chỉ team. Nếu không nhận email, cần Custom SMTP (không tự tắt xác nhận email).
5. Kiểm tra luồng dữ liệu thật: gia đình thêm người thân/đặt ca → điều phối phân công → chuyên viên cập nhật/bắt đầu/nhật ký → gia đình cập nhật/xem/đánh giá.
6. SUPABASE-SETUP.md có hướng dẫn đầy đủ. Cập nhật checkpoint khi có kết quả mới.

## Giới hạn hiện tại

- Cập nhật dữ liệu qua nút Cập nhật hoặc tải lại, chưa realtime.
- Chưa thanh toán online, push notification, tin sức khỏe tự cập nhật; tin là nội dung trình diễn đã được chọn trước.
- Chuyên viên tự đăng ký; điều phối quản lý phân công, chưa có luồng xét duyệt/chứng chỉ riêng.

## Sửa lỗi mới nhất — chờ deploy

- Người dùng báo nhận email nhưng link lỗi, vẫn login được; ảnh cho thấy localhost:3000 với phiên đăng nhập trong fragment. Không đọc/sử dụng token trong ảnh. Kết luận lỗi địa chỉ chuyển về, không phải thiếu xác nhận email.
- Người dùng đã lưu Site URL thành https://demo-homacare.netlify.app/auth.html, giữ Redirect URL auth.html*.
- preview/config.js có siteUrl production; auth.js dùng URL đó để gửi link signup/reset, kể cả khi đăng ký từ localhost.
- Trang chủ có data-home-account (mobile/desktop), auth.js tải hồ sơ phiên thật và hiện nút Không gian gia đình/Ca chăm sóc của tôi/Không gian điều phối cùng Đăng xuất. Khi mất mạng hiện kết nối lại, không giả định đã logout.
- Bỏ signOut khi người dùng chọn nhầm vai trò ở màn login; điều hướng theo role DB. Phiên có sẵn trên auth.html cũng vào đúng role, xử lý callback không kèm role.
- Nhận callback phiên trên trang chủ thì chuyển về auth.html giữ nguyên fragment để SDK xử lý. Hiển thị thông báo callback lỗi.
- Đã build lại HTML và kiểm tra JS syntax. tests/session-ui-server.cjs dùng SDK giả lập chỉ trên localhost4175 để kiểm tra mã UI thật. Gia đình và chuyên viên về home/quay lại/reload vẫn giữ phiên; explicit logout hoạt động; callback caregiver thiếu role mở caregiver; menu mobile390px không tràn.
- Ảnh home-session-ready.jpg và home-session-mobile.jpg là UI với phiên kiểm thử giả lập, không phải dữ liệu người dùng thật; đã bỏ khỏi Git bằng .gitignore.
- Đang chờ người dùng tải folder preview mới lên Netlify rồi báo Published. Sau đó cần thử với tài khoản thật luồng về trang chủ và một email xác nhận mới. Thư cũ vẫn có thể chứa localhost.
- Dự án đã có commit đầu tiên và đã push lên GitHub private hienminh123/HOMACARE-APP. Những sửa đổi tiếp theo cần commit/push; không tự upload khi sửa file. Người dùng có thể dùng Claude Code tiếp tục trong đúng folder này, đọc checkpoint và kiểm tra Git trước khi làm.

## Công cụ

- Không spawn agent nếu chưa được người dùng yêu cầu.
- Browser qua mcp__cua_repl; cần rewriteDocumentation khi resume sau compaction.
- IAB browserID2. careTestTab tab4 hiện ở http://127.0.0.1:4173/auth.html?role=coordinator, màn email + mật khẩu; đánh dấu deliverable. Ảnh coordinator-email-login.jpg ở gốc dự án.
- Viewport override đã reset về mặc định.
- Python localhost4173 có thể vẫn chạy; kiểm tra trước nếu phiên mới.
- Fixture server4174 (session13279) đã dừng sau kiểm tra.
- Node: C:/Program Files/nodejs/node.exe. tests có PGlite trong node_modules.
- Không có active goal.

## Chỉnh độ dễ đọc và header điện thoại — 06/10/2026

- Người dùng yêu cầu tăng chữ/icon và thay nút ba gạch bằng Đăng nhập / Đăng ký trên điện thoại.
- Đã tăng font trong styles.css/account.css và inline copy: nội dung chính 16px, chữ phụ 12–14px; icon điều khiển 24px, icon dịch vụ 30px; nút chính tối thiểu 44px.
- Header trang chủ chỉ còn một data-home-account desktop, hiển thị cả trên điện thoại. Khách bấm Đăng nhập / Đăng ký mở popup ba vai trò. Đã đăng nhập thì mobile hiện Tài khoản, dẫn về đúng dashboard; Đăng xuất vẫn có trong dashboard và trên home desktop.
- Xếp các thẻ tin/dịch vụ, thông tin lộ trình và thống kê thành một cột trên mobile để giữ cỡ chữ lớn; dashboard metric mobile cũng thành một cột.
- backend/build-pages.cjs lưu header mới và chuẩn hóa wrapper, đã xác nhận chạy hai lần tạo kết quả giống nhau; không sinh wrapper tài khoản lồng nhau.
- Kiểm tra browser: trang chủ 320/390px và desktop1280px không tràn ngang; popup ba vai trò mở đúng, icon28px và tên17px. Header tài khoản chuyên viên và dashboard390px được kiểm tra bằng session fixture, không dùng tài khoản/dữ liệu Supabase thật.
- Ảnh mobile-readable-header.jpg là trang chủ thật chạy localhost, không có tài khoản giả. Đã thêm vào .gitignore.
- JS syntax checks thành công. Không đổi backend/schema hay quyền truy cập. Chưa commit/push/deploy các thay đổi giao diện lần này.
