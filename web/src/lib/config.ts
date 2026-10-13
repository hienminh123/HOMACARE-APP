// Cấu hình công khai, giống preview/config.js. Chỉ đặt Project URL và Publishable key.
// Không bao giờ đưa Secret/service_role key vào thư mục web/.
export const config = Object.freeze({
  siteUrl: 'https://homacare-demo.pages.dev/',
  supabaseUrl: 'https://rjxknbmcsnbugjvgchla.supabase.co',
  supabasePublishableKey: 'sb_publishable_paSaibwehESdfX3wONy4JQ_Bk1MEV2i',
});

/** `astro dev --mode fixture`: dùng dữ liệu giả lập trong trình duyệt, không gọi Supabase thật. */
export const FIXTURE = import.meta.env.MODE === 'fixture';

/** Tên khóa phiên supabase-js lưu trong localStorage, dùng để trang giới thiệu biết đã đăng nhập mà không cần tải SDK. */
export const SESSION_STORAGE_KEY = FIXTURE
  ? 'homa-session-fixture'
  : `sb-${new URL(config.supabaseUrl).hostname.split('.')[0]}-auth-token`;
