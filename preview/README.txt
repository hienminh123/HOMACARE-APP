HOMACARE — NỀN TẢNG CHĂM SÓC

Folder này là website được Cloudflare Pages xuất bản từ nhánh main. Mở website qua HTTPS hoặc máy chủ localhost.
index.html: trang chủ (landing page) và popup chọn vai trò.
tinh-nang.html: trang tổng hợp tính năng, ảnh nằm trong assets/tinh-nang/.
Trang chủ có ảnh minh họa tạo bằng AI, phạm vi ca Ân cần, câu hỏi thường gặp và thông tin liên hệ HomaCare.
auth.html: đăng ký, đăng nhập, xác nhận email và khôi phục mật khẩu.
family.html: hồ sơ người thân, đặt ca, xem nhật ký và đánh giá.
Khi đặt ca Ân cần, gia đình xem lại thông tin và giá trước khi xác nhận gửi yêu cầu.
caregiver.html: lịch được phân công, bắt đầu ca, ghi nhận hoạt động và gửi nhật ký.
coordinator.html: tiếp nhận yêu cầu, phân công chuyên viên và theo dõi ca.

Tài khoản và dữ liệu dùng Supabase. Người dùng mới có không gian trống.
Các quyền được kiểm tra trong cơ sở dữ liệu. Không có mật khẩu điều phối trong mã website.
Chỉ dùng Publishable key trong config.js; không đưa Secret/service_role key vào folder này.
Hướng dẫn thiết lập nằm ở SUPABASE-SETUP.md trong folder dự án.

Danh sách cập nhật khi bấm Cập nhật hoặc tải lại trang.
Chưa có thanh toán online, thông báo đẩy hoặc cập nhật tin sức khỏe tự động.
Font Cal Sans tải tại chỗ; giấy phép tại assets/CalSans-LICENSE.txt.
Nguồn nhận diện: docs/thuong-hieu/homacare-logo-goc.png do nhóm cung cấp.
Nội dung dự án: docs/y-tuong-homacare.pdf.
Tham khảo cấu trúc nội dung: https://www.papa.com/resources

Biểu tượng màn hình chính chỉ có logo H, không có chữ hoặc tagline.
Sau khi website cập nhật, nếu iPhone vẫn giữ icon cũ, gỡ icon cũ và thêm website lại
bằng Safari → Share → Add to Home Screen.
