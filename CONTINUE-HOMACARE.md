# HOMACARE — trạng thái tiếp tục

## PHIÊN THIẾT KẾ LẠI — 13/10/2026 (đọc phần này trước)

### Bối cảnh và luật làm việc
- Repo đã chuyển từ OneDrive sang `C:\dev\homacare`. Làm trên nhánh **`thiet-ke-lai`**. Tag **`ban-cu-v1`** = bản đang chạy trên homacare-demo.pages.dev.
- **Không sửa, không merge vào `main`. Không push nếu chưa hỏi người dùng.** Commit cục bộ sau mỗi giai đoạn là được phép.
- Cloudflare Pages chỉ build `main`, nên mọi thay đổi trên nhánh này chưa ảnh hưởng web thật.
- Lộ trình đầy đủ: (0) dọn repo → (1) design system → (2) chuyển sang Astro, tách trang giới thiệu khỏi app → (3) app gia đình, ưu tiên điện thoại → (4) app chuyên viên và điều phối → (5) realtime + chế độ demo cho giám khảo → (6) kiểm thử toàn bộ. **Đã xong 0 và 1.**

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

### Việc tiếp theo — Giai đoạn 2 · Chuyển sang Astro
1. Hỏi người dùng trước khi cài: tạo dự án Astro (output tĩnh, không SSR, để Cloudflare Pages miễn phí) trong thư mục riêng, ví dụ `web/`, giữ `preview/` chạy song song cho tới khi bản mới đủ chức năng.
2. Chép `preview/ds/` vào `src/styles/` (import đúng thứ tự trong DESIGN.md); mỗi thành phần `hc-*` thành một file `.astro`; `HC.pill/timeline` thành component nhận prop `status`.
3. Tách hai khu: trang giới thiệu (`/`, nội dung từ `index.html` + Góc sức khỏe) và app (`/app/gia-dinh`, `/app/chuyen-vien`, `/app/dieu-phoi`, `/app/dang-nhap`). Giữ redirect cho `auth.html`, `family.html`… vì email xác nhận Supabase đang trỏ `auth.html`.
4. Chuyển `auth.js`/`workspace.js` sang module dùng chung, giữ nguyên RPC và RLS (không đổi `backend/schema.sql` nếu không cần).
5. Trước khi merge vào `main` sau này: đổi cấu hình Cloudflare Pages (build command `npm run build`, output `web/dist`), cập nhật Site URL/Redirect URLs của Supabase nếu đường dẫn đổi. Đây là việc người dùng phải duyệt.

### Còn để ngỏ
- Cal Sans đang là TTF 100 KB; nên chuyển sang woff2 (cần `woff2_compress` hoặc fonttools, máy hiện chưa có).
- `tinh-nang.html` vẫn dùng CSS nội tuyến riêng, chưa chuyển sang design system.
- Ô `type="date"` hiển thị theo ngôn ngữ của máy (máy tiếng Anh sẽ ra mm/dd); khi làm app có thể cần ô chọn ngày riêng hiển thị dd/mm.
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
