# HOMACARE — trạng thái tiếp tục

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
