// Chế độ demo cho ban giám khảo (giai đoạn 5). Vào bằng đường dẫn riêng /demo/ hoặc /demo/?vai-tro=…
// Chỉ áp dụng cho tab đã vào demo (cờ trong sessionStorage), dùng client giả lập src/lib/fixture.ts:
// không gọi Supabase, không tạo tài khoản hay dữ liệu thật. Dữ liệu minh họa nằm ở localStorage nên
// nhiều tab demo (mỗi tab một vai trò) thấy cùng dữ liệu và cập nhật cho nhau.
import type { Role } from './auth';

const FLAG = 'homa-demo';
/** Vai trò demo của tab này (khóa hồ sơ trong fixture). */
export const DEMO_SESSION_KEY = 'homa-demo-session';
/** Dữ liệu minh họa dùng chung giữa các tab demo. */
export const DEMO_DATA_KEY = 'homa-demo-data';
export const DEMO_PATH = '/demo/';

/** Tham số ?vai-tro= của /demo/ → khóa hồ sơ trong fixture và vai trò của không gian. */
export const DEMO_ROLES = {
  'gia-dinh': { key: 'family', role: 'family', label: 'Gia đình' },
  'chuyen-vien': { key: 'caregiver', role: 'caregiver', label: 'Chuyên viên' },
  'dieu-phoi': { key: 'coordinator', role: 'coordinator', label: 'Điều phối' },
  'gia-dinh-moi': { key: 'family-new', role: 'family', label: 'Gia đình mới' },
} as const satisfies Record<string, { key: string; role: Role; label: string }>;
export type DemoSlug = keyof typeof DEMO_ROLES;
export const isDemoSlug = (value: unknown): value is DemoSlug => typeof value === 'string' && value in DEMO_ROLES;

export function isDemo(): boolean {
  try { return sessionStorage.getItem(FLAG) === '1'; } catch { return false; }
}
/** Vai trò demo đang dùng trong tab này, dạng slug của đường dẫn. */
export function demoSlug(): DemoSlug | null {
  try {
    const key = sessionStorage.getItem(DEMO_SESSION_KEY);
    return (Object.keys(DEMO_ROLES) as DemoSlug[]).find(s => DEMO_ROLES[s].key === key) || null;
  } catch { return null; }
}
export function startDemo(slug: DemoSlug) {
  try {
    sessionStorage.setItem(FLAG, '1');
    sessionStorage.setItem(DEMO_SESSION_KEY, DEMO_ROLES[slug].key);
  } catch { /* trình duyệt chặn bộ nhớ: demo không chạy được, trang /demo/ báo lỗi */ }
}
export function endDemo() {
  try { sessionStorage.removeItem(FLAG); sessionStorage.removeItem(DEMO_SESSION_KEY); } catch { /* bỏ qua */ }
}
/** Xóa dữ liệu minh họa để lần tải sau tạo lại từ đầu (mọi tab demo cùng thấy). */
export function resetDemoData() {
  try { localStorage.removeItem(DEMO_DATA_KEY); } catch { /* bỏ qua */ }
}
export const demoUrl = (slug: DemoSlug) => `${DEMO_PATH}?vai-tro=${slug}`;
