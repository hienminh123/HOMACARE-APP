# HOMACARE

**Gửi trọn quan tâm, vẹn tròn đạo hiếu.**

HOMACARE là nền tảng kết nối gia đình, chuyên viên chăm sóc và điều phối viên để sắp xếp chăm sóc người cao tuổi tại nhà. Gia đình có thể đặt lịch và theo dõi nhật ký; chuyên viên ghi nhận các hoạt động; điều phối viên tiếp nhận yêu cầu và phân công ca.

Dự án hiện là MVP phục vụ trình diễn và kiểm chứng luồng chăm sóc. Phạm vi dịch vụ trong ứng dụng là hỗ trợ sinh hoạt và đồng hành phi y tế.

- **Website:** [demo-homacare.netlify.app](https://demo-homacare.netlify.app/)
- **Repository:** [hienminh123/HOMACARE-APP](https://github.com/hienminh123/HOMACARE-APP) — riêng tư, cần quyền truy cập.
- **Thiết lập Supabase:** [SUPABASE-SETUP.md](SUPABASE-SETUP.md)
- **Trạng thái công việc và bàn giao:** [CONTINUE-HOMACARE.md](CONTINUE-HOMACARE.md)

## Chức năng

| Vai trò | Chức năng trong mã nguồn hiện tại |
| --- | --- |
| Khách truy cập | Xem Góc sức khỏe, giới thiệu, lộ trình chăm sóc, dịch vụ và đội ngũ; chọn vai trò để vào tài khoản. |
| Gia đình | Đăng ký/đăng nhập; thêm người thân; đặt ca Ân cần; theo dõi lịch, nhật ký và đánh giá ca. |
| Chuyên viên chăm sóc | Đăng ký/đăng nhập; xem ca được phân công; bắt đầu ca; ghi nhận bốn hoạt động; gửi nhật ký và xem lịch sử ca. |
| Điều phối viên | Đăng nhập bằng email và mật khẩu riêng; xem yêu cầu; phân công chuyên viên trống lịch; lọc và theo dõi trạng thái ca. |

Gia đình và chuyên viên có thể tự đăng ký. Điều phối viên được chủ dự án tạo tài khoản và cấp quyền trong Supabase. Việc chọn vai trò trên giao diện không cấp thêm quyền cho tài khoản.

Trang chủ nhận diện tài khoản đang đăng nhập và có nút quay lại không gian tương ứng. Tài khoản mới có dữ liệu trống; dữ liệu người thân và ca chăm sóc được lưu trong Supabase.

## Luồng chăm sóc

1. Gia đình tạo hồ sơ người thân và gửi yêu cầu chăm sóc.
2. Điều phối viên tiếp nhận, kiểm tra lịch và phân công chuyên viên.
3. Chuyên viên bắt đầu ca, ghi nhận các hoạt động và gửi nhật ký.
4. Gia đình xem nhật ký và đánh giá ca.

Trạng thái ca: **Chờ phân công → Đã phân công → Đang chăm sóc → Hoàn thành**.

MVP hiện hỗ trợ đặt ca **Ân cần**, khung giờ **18:00–22:00**, giá hiển thị **320.000đ/buổi**. Các gói khác trên trang chủ đang ở mức giới thiệu; chưa có luồng đặt lịch tương ứng.

## Công nghệ và thiết kế

| Thành phần | Sử dụng |
| --- | --- |
| Giao diện | HTML, CSS và JavaScript thuần; nhiều trang, không dùng framework. |
| Tài khoản | Supabase Auth, email và mật khẩu, xác nhận email và khôi phục mật khẩu. |
| Dữ liệu | PostgreSQL của Supabase; RLS giới hạn dữ liệu theo tài khoản; RPC kiểm tra thao tác thay đổi ca. |
| Hosting | Netlify, xuất bản folder `preview`. |
| Quản lý mã nguồn | Git và GitHub. |
| Kiểm thử cơ sở dữ liệu | PostgreSQL PGlite. |

Giao diện sử dụng font **Cal Sans** tải tại chỗ, logo do nhóm HOMACARE cung cấp và bảng màu nhận diện:

| Màu | Mã |
| --- | --- |
| Teal | `#0F4C46` |
| Apricot | `#F28C68` |
| Sand | `#F6EDE3` |
| Sky | `#C9D8E3` |
| Navy | `#1B2A41` |

Biểu tượng trình duyệt và màn hình chính chỉ có biểu tượng logo, không có chữ hoặc tagline. Giấy phép font nằm tại [preview/assets/CalSans-LICENSE.txt](preview/assets/CalSans-LICENSE.txt).

## Cấu trúc dự án

```text
HOMACARE APP/
├── preview/                     # Website được xuất bản lên Netlify
│   ├── index.html               # Trang chủ
│   ├── auth.html                # Đăng ký, đăng nhập và khôi phục mật khẩu
│   ├── family.html              # Không gian gia đình
│   ├── caregiver.html           # Không gian chuyên viên
│   ├── coordinator.html         # Không gian điều phối
│   ├── auth.js                  # Xác thực, nhận diện phiên và điều hướng vai trò
│   ├── workspace.js             # Dữ liệu và thao tác của ba dashboard
│   ├── preview.js               # Icon, popup, menu và thông báo
│   ├── config.js                # Website URL và cấu hình Supabase công khai
│   ├── styles.css               # Giao diện chung
│   ├── account.css              # Tài khoản, dashboard và responsive
│   ├── assets/                  # Logo, icon, font
│   ├── vendor/                  # Supabase JavaScript SDK
│   └── manifest.webmanifest     # Tên, icon và chế độ mở như ứng dụng
├── backend/
│   ├── schema.sql               # Bảng, RLS, trigger và RPC
│   ├── promote-coordinator.sql  # Cấp quyền điều phối theo email
│   ├── build-pages.cjs          # Tạo các trang từ template
│   ├── ui-handlers.txt          # Nguồn các thao tác giao diện chung
│   └── check-connection.cjs      # Kiểm tra kết nối chỉ đọc
├── tests/                       # Kiểm thử và máy chủ dữ liệu giả lập
├── netlify.toml                 # Publish directory: preview
├── SUPABASE-SETUP.md
├── CONTINUE-HOMACARE.md
└── README.md
```

Tên folder `preview` được giữ để tương thích cách triển khai hiện tại; đây là mã website kết nối Supabase.

## Chạy trên máy

### Chuẩn bị

- [Node.js](https://nodejs.org/) và npm để chạy máy chủ xem thử, tạo trang và kiểm thử.
- Trình duyệt Chrome, Edge, Safari hoặc tương đương.
- Có thể dùng GitHub Desktop để quản lý các lần cập nhật.

### Mở website

Mở terminal tại thư mục gốc dự án, chạy:

```powershell
npx --yes http-server preview -a 127.0.0.1 -p 4173 -c-1
```

Mở [http://127.0.0.1:4173/](http://127.0.0.1:4173/). Dừng máy chủ bằng `Ctrl+C`. Nếu cổng 4173 đang có máy chủ dự án chạy, sử dụng máy chủ đó hoặc dừng trước khi mở lại.

Lệnh dùng [http-server](https://github.com/http-party/http-server), chỉ phục vụ website trên máy và tắt cache để thấy các chỉnh sửa. Lần đầu cần mạng để tải công cụ. Luồng tài khoản và dữ liệu thật cần kết nối Internet.

`preview/config.js` hiện trỏ tới Supabase của HOMACARE. Đăng ký hoặc đặt ca khi chạy cục bộ vẫn ghi vào project đó. Link xác nhận/khôi phục hiện được gửi về Netlify theo `siteUrl`.

## Thiết lập Supabase

Xem hướng dẫn đầy đủ trong [SUPABASE-SETUP.md](SUPABASE-SETUP.md). Khi tạo một project mới:

1. Chạy `backend/schema.sql` trong SQL Editor.
2. Điền `siteUrl`, `supabaseUrl` và `supabasePublishableKey` trong `preview/config.js`.
3. Bật đăng nhập email và cấu hình xác nhận email.
4. Đặt **Site URL** và **Redirect URLs** đúng website.
5. Thiết lập dịch vụ gửi email riêng nếu cần gửi thư cho người đăng ký ngoài đội ngũ dự án.

Với website hiện tại:

- **Site URL:** `https://demo-homacare.netlify.app/auth.html`
- **Redirect URL:** `https://demo-homacare.netlify.app/auth.html*`

Chỉ đặt **Publishable key** trong website. Mật khẩu và Secret/service-role key không được đưa vào `preview` hoặc Git. Quyền dữ liệu được kiểm tra trong Supabase, không phụ thuộc việc ẩn nút trên giao diện.

Project HOMACARE hiện đã được tạo bảng và cấp tài khoản điều phối; không cần chạy lại schema mỗi lần sửa giao diện. Thay đổi cấu trúc dữ liệu cần được áp dụng riêng trong Supabase.

### Thêm điều phối viên

1. Chủ dự án tạo user trong **Authentication → Users**; mỗi người có email và mật khẩu riêng.
2. Sửa `target_email` trong `backend/promote-coordinator.sql` thành email của user đó.
3. Chủ dự án chạy query để cấp role `coordinator`.
4. Người đó chọn **Điều phối viên** và đăng nhập bằng tài khoản vừa cấp.

Không cần sửa email trong cấu hình website khi thêm điều phối viên.

## Triển khai và cập nhật Netlify

### Qua GitHub

Nối repository với dự án Netlify **demo-homacare** tại **Project configuration → Developer settings → Continuous deployment → Repository → Link repository**.

- Nhánh xuất bản: `main`.
- Thư mục xuất bản: `preview`, đã khai báo trong `netlify.toml`.
- Build command: để trống; các file website đã có sẵn trong repository.

Sau khi đã kết nối, Netlify tự triển khai khi thay đổi được push lên nhánh xuất bản. Chỉ sửa file trên máy sẽ chưa cập nhật GitHub hoặc website. Xem [hướng dẫn nối repository](https://docs.netlify.com/build/git-workflows/repo-permissions-linking/).

### Qua GitHub Desktop

1. Sửa file và kiểm tra trên máy.
2. Mở GitHub Desktop, xem danh sách **Changes**.
3. Nhập **Summary**, bấm **Commit to main**.
4. Bấm **Push origin**.
5. Kiểm tra Netlify báo **Published**, sau đó thử website thật.

### Tải folder thủ công

Nếu chưa nối GitHub, tải nguyên folder `preview` mới lên Netlify. Các folder `backend`, `tests` và tài liệu gốc không nằm trong phần website công khai.

## Tiếp tục phát triển bằng AI hoặc trình soạn thảo

Có thể dùng Codex, Claude Code hoặc trình soạn thảo khác trong cùng folder dự án.

1. Đọc README này, [CONTINUE-HOMACARE.md](CONTINUE-HOMACARE.md) và [SUPABASE-SETUP.md](SUPABASE-SETUP.md).
2. Kiểm tra nhánh và các thay đổi hiện có trước khi sửa; nếu dùng bản sao trên máy khác, lấy phiên bản mới nhất từ GitHub.
3. Nêu rõ tính năng hoặc lỗi cần xử lý, giữ nhận diện và luồng đã được duyệt.
4. Kiểm tra kết quả trước khi commit/push; cập nhật tài liệu bàn giao khi có thay đổi đáng kể.

Vị trí chỉnh sửa chính:

| Nội dung | File nguồn |
| --- | --- |
| Nội dung trang chủ | `preview/index.html` |
| Style chung và tài khoản | `preview/styles.css`, `preview/account.css` |
| Đăng nhập, phiên và vai trò | `preview/auth.js` |
| Dashboard và thao tác dữ liệu | `preview/workspace.js` |
| Template trang tài khoản/dashboard | `backend/build-pages.cjs` |
| Popup, menu và thông báo chung | `backend/ui-handlers.txt` |
| Dữ liệu, phân quyền và RPC | `backend/schema.sql` |

Sau khi sửa template hoặc UI handlers, chạy từ thư mục gốc:

```powershell
node backend/build-pages.cjs
```

Script ghi lại `auth.html`, ba trang dashboard và phần handlers trong `preview.js`. Sửa nội dung tương ứng ở file nguồn để giữ được thay đổi khi tạo lại trang. Commit cả file nguồn và file website đã tạo.

## Kiểm thử

### Cơ sở dữ liệu

Từ thư mục gốc:

```powershell
npm --prefix tests ci
npm --prefix tests test
```

Kiểm thử dùng PGlite trong bộ nhớ, không thay đổi Supabase thật. Bộ kiểm tra đã xác nhận 28 trường hợp về phân quyền, sở hữu dữ liệu, lịch trùng, trạng thái ca, nhật ký và đánh giá.

### Giao diện với dữ liệu giả lập

```powershell
node tests/ui-server.cjs
```

Mở các dashboard tại `http://127.0.0.1:4174/` để kiểm tra thao tác với dữ liệu giả lập, ví dụ `/family.html`, `/caregiver.html`, `/coordinator.html`.

```powershell
node tests/session-ui-server.cjs
```

Mở `http://127.0.0.1:4175/auth.html?role=family` để kiểm tra giữ phiên và điều hướng. Tài khoản giả lập dùng `family@example.invalid`, `caregiver@example.invalid` hoặc `coordinator@example.invalid`, cùng mật khẩu giả bất kỳ không rỗng. Máy chủ này thay SDK bằng giả lập và không xác thực với Supabase thật.

Các máy chủ kiểm thử chỉ chạy trên localhost, không đưa vào folder xuất bản. Kết quả giả lập không thay thế kiểm tra đăng ký, nhận email và lưu dữ liệu trên website thật.

### Kiểm tra một vòng với tài khoản thật

1. Gia đình đăng ký, nhận email xác nhận và đăng nhập đúng giao diện.
2. Thêm người thân, đặt một ca chăm sóc.
3. Điều phối viên phân công cho tài khoản chuyên viên.
4. Chuyên viên cập nhật, bắt đầu ca, ghi nhận bốn hoạt động và gửi nhật ký.
5. Gia đình cập nhật, xem nhật ký và đánh giá.
6. Cả hai vai trò về trang chủ, quay lại dashboard và tải lại trang để kiểm tra giữ phiên.

## Giới hạn hiện tại

- Danh sách cập nhật khi bấm **Cập nhật** hoặc tải lại trang; chưa có realtime.
- Chưa có thanh toán trực tuyến, thông báo đẩy hoặc tự động cập nhật tin sức khỏe.
- Chưa có quy trình duyệt chứng chỉ chuyên viên riêng hoặc đặt lịch các gói ngoài Ân cần.
- Có manifest và hỗ trợ **Add to Home Screen**; chưa có service worker để sử dụng dữ liệu khi mất mạng.
- Cần xác nhận bản Netlify mới nhất đã nhận các sửa đổi về email chuyển hướng, đăng nhập nhiều điều phối viên và nhận diện phiên trên trang chủ. Trạng thái chi tiết nằm trong file bàn giao.

## Xử lý lỗi thường gặp

| Hiện tượng | Kiểm tra |
| --- | --- |
| Email xác nhận mở `localhost:3000` | Site URL, Redirect URLs trong đúng project Supabase và `siteUrl` trong config. Thư cũ có thể giữ URL cũ; kiểm tra bằng thư mới. |
| Không nhận email hoặc email bị từ chối | Spam, giới hạn gửi thư và Custom SMTP. Xem [tài liệu Supabase](https://supabase.com/docs/guides/auth/auth-smtp). |
| Link báo hết hạn/đã sử dụng | Nếu email đã được xác nhận, đăng nhập bằng email và mật khẩu; nếu chưa, cần gửi lại thư xác nhận. |
| Về trang chủ vẫn thấy nút đăng ký | Kiểm tra đã deploy `auth.js`, HTML và CSS mới; dùng cùng trình duyệt và tên miền với lần đăng nhập. |
| Không vào được điều phối | Kiểm tra mật khẩu và role `coordinator` của đúng user trong Supabase. |
| Sửa trên máy nhưng website chưa đổi | Kiểm tra commit/push và kết quả deploy, hoặc tải lại folder `preview` nếu đang triển khai thủ công. |

## Nguồn dự án

- Tài liệu ý tưởng: `Ý tưởng HomaCare.pdf`.
- Logo gốc: `HOMACARE - logo.png` do nhóm cung cấp.
- Tham khảo cấu trúc nội dung: [Papa Resources](https://www.papa.com/resources).
- Bài đọc sức khỏe trên trang chủ có liên kết đến nguồn Cục Dân số và WHO.
