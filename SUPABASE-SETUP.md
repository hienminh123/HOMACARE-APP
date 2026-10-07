# Kết nối HOMACARE với Supabase

Website: https://homacare-demo.pages.dev/ (Cloudflare Pages)

Project: HOMACARE — `rjxknbmcsnbugjvgchla`.

URL và Publishable key đã được điền trong `preview/config.js`. Không cần cài thêm phần mềm.

## 1. Tạo dữ liệu và quyền truy cập

1. Mở project HOMACARE trên Supabase.
2. Vào **SQL Editor → New query**.
3. Mở `backend/schema.sql` trên máy, sao chép toàn bộ nội dung.
4. Dán vào SQL Editor rồi bấm **Run**.
5. Kết quả thành công thường là **Success. No rows returned**.

Script tạo bảng tài khoản, người thân, ca chăm sóc và các quyền truy cập. Script đã được kiểm tra bằng PostgreSQL PGlite: 28 kiểm tra về phân quyền, đặt lịch, phân công, bắt đầu/hoàn thành ca và đánh giá đều thành công. Đây là kiểm thử cục bộ; vẫn cần xác nhận script và đăng nhập hoạt động trên project thật.

## 2. Đặt đường dẫn xác nhận email

Vào **Authentication → URL Configuration**:

- **Site URL**: `https://homacare-demo.pages.dev/auth.html`
- Thêm vào **Redirect URLs**: `https://homacare-demo.pages.dev/**`
- Nếu kiểm tra trên máy: thêm `http://127.0.0.1:4173/auth.html*`.
- Bấm **Save changes**.

Wildcard cuối đường dẫn dành cho tham số vai trò và khôi phục mật khẩu. Không mở rộng sang tên miền khác.

## 3. Bật đăng nhập email

Trong **Authentication**, tìm mục cấu hình **Email** trong **Sign In / Providers** (tên mục có thể khác nhẹ):

- Bật đăng nhập bằng Email.
- Giữ xác nhận email nếu muốn người dùng xác minh email trước khi vào tài khoản.
- Đặt mật khẩu tối thiểu 8 ký tự.

Dịch vụ gửi email mặc định của Supabase có giới hạn và có thể chỉ gửi đến địa chỉ thuộc đội ngũ dự án. Muốn cho người ngoài đăng ký và nhận email thật, cần cấu hình **Custom SMTP** trong Authentication theo nhà cung cấp email của bạn. Không tắt xác nhận email chỉ để bỏ qua lỗi gửi thư nếu đang mở đăng ký thật.

## 4. Tạo tài khoản điều phối

1. Trong **Authentication → Users → Add user / Create new user**, tạo tài khoản `minh30d@gmail.com`.
2. Bạn tự đặt mật khẩu riêng; không gửi mật khẩu trong chat.
3. Xác nhận email của tài khoản (nếu có lựa chọn xác nhận khi tạo user, có thể dùng cho tài khoản quản trị do chính bạn tạo).
4. Mở một query mới, dán nội dung `backend/promote-coordinator.sql`, bấm **Run**.

Script có biến `target_email` mặc định là `minh30d@gmail.com`. Màn đăng nhập Điều phối viên yêu cầu email và mật khẩu của từng tài khoản; quyền điều phối được kiểm tra trong Supabase.

Để thêm điều phối viên: tạo một user mới trong Authentication, đổi `target_email` trong script thành email của user đó và chạy query. Mỗi người dùng tài khoản riêng. Không cần sửa config.js, không cần chạy lại schema và không ảnh hưởng quyền điều phối của tài khoản trước. Website không mở đăng ký điều phối công khai.

## 5. Cập nhật website

1. Commit và push lên nhánh `main` trên GitHub.
2. Cloudflare Pages (project **homacare-demo**) tự deploy thư mục `preview`.
3. Chờ deploy thành công, mở lại https://homacare-demo.pages.dev/.

Chỉ tải folder `preview`; các folder `backend`, `tests` và tài liệu thiết lập nằm ngoài phần website.

## 6. Kiểm tra sử dụng

1. Bấm **Đăng nhập / Đăng ký** → **Gia đình**, tạo tài khoản bằng email của bạn và xác nhận thư nếu đã bật.
2. Đăng nhập → thêm người thân → gửi yêu cầu ca Ân cần.
3. Đăng ký tài khoản **Chuyên viên chăm sóc** bằng một email khác, xác nhận thư.
4. Chọn **Điều phối viên**, nhập mật khẩu đã đặt → phân công ca cho chuyên viên.
5. Chuyên viên bấm **Cập nhật** hoặc tải lại trang → chọn ca → bắt đầu → ghi nhận 4 hoạt động → gửi nhật ký.
6. Gia đình bấm **Cập nhật** → xem nhật ký → đánh giá.

Ca và nhật ký được lưu trong Supabase, không tự mất khi tải lại trang. Danh sách cập nhật khi bấm Cập nhật hoặc tải lại trang; chưa có tự động cập nhật trực tiếp.

## Trạng thái hiện tại

- Giao diện tài khoản và mã kết nối đã chuẩn bị trên máy.
- Cấu hình URL/key đã điền. Đăng nhập điều phối dùng email nhập trong form.
- Người dùng xác nhận đã chạy schema thành công, lưu Site URL/Redirect URL, tạo user minh30d@gmail.com và cấp quyền điều phối ngày 06/10/2026.
- Người dùng đã tải bản mới lên Netlify; đã kiểm tra popup vai trò, form điều phối và chuyển trang đăng nhập khi chưa có phiên tài khoản.
- Người dùng xác nhận đăng nhập điều phối trên website thật thành công. Email xác nhận đã nhận được, nhưng ảnh lỗi cho thấy chuyển về localhost:3000 sau khi Supabase trả phiên đăng nhập. Người dùng đã sửa Site URL về auth.html trên Netlify ngày 06/10/2026; cần thử một thư mới để xác nhận.
- Có thay đổi sau deploy: màn điều phối nhập email + mật khẩu riêng, hỗ trợ quên mật khẩu; trang chủ nhận diện phiên và có nút vào dashboard/đăng xuất; gửi email xác nhận/khôi phục luôn dùng siteUrl Netlify trong config.js. Cần tải lại folder preview để nhận các thay đổi này.
- Đã kiểm tra UI bằng tài khoản giả lập: gia đình/chuyên viên → trang chủ → quay lại dashboard → tải lại vẫn giữ phiên; đăng xuất chủ động đưa về trạng thái khách; link nhận phiên mở đúng vai trò; menu điện thoại không tràn ngang. Đây không phải xác nhận gửi email thật hay đăng nhập thật trên bản mới.
- Email và xác nhận email đang bật; cần xác nhận khả năng gửi thư cho người đăng ký bên ngoài hoặc thiết lập Custom SMTP.
- Chưa khẳng định đăng nhập trên project thật đã thành công trước khi kiểm tra xong các bước trên.

## Tài liệu chính thức

- https://supabase.com/docs/guides/auth/managing-user-data
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/getting-started/api-keys
