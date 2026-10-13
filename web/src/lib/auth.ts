// Tài khoản, phiên và điều hướng theo vai trò. Chuyển từ preview/auth.js, giữ nguyên cách gọi Supabase Auth
// và bảng profiles; chỉ đổi đường dẫn sang khu /app/.
import { config } from './config';
import { getClient } from './supabase';

export type Role = 'family' | 'caregiver' | 'coordinator';
export const ROLES: Role[] = ['family', 'caregiver', 'coordinator'];
export const isRole = (value: unknown): value is Role => ROLES.includes(value as Role);

export interface Profile { id: string; full_name: string; role: Role }

/** Đường dẫn mới của từng không gian. Bản cũ: family.html, caregiver.html, coordinator.html. */
export const DESTINATIONS: Record<Role, string> = {
  family: '/app/gia-dinh/',
  caregiver: '/app/chuyen-vien/',
  coordinator: '/app/dieu-phoi/',
};
export const LOGIN_PATH = '/app/dang-nhap/';

export const LABELS: Record<Role, string> = {
  family: 'Gia đình',
  caregiver: 'Chuyên viên chăm sóc',
  coordinator: 'Điều phối viên',
};

export function loginUrl(role: Role, extra: Record<string, string> = {}): string {
  return LOGIN_PATH + '?' + new URLSearchParams({ role, ...extra }).toString();
}

/** Địa chỉ đưa vào email xác nhận/khôi phục. Luôn dùng siteUrl thật, kể cả khi đăng ký từ máy cục bộ. */
export function emailRedirect(role: Role, mode?: 'recovery'): string {
  const base = new URL(LOGIN_PATH, config.siteUrl || location.origin + '/').href;
  return base + '?role=' + role + (mode ? '&mode=' + mode : '');
}

/** Câu báo lỗi tiếng Việt cho lỗi Supabase Auth. */
export function failure(error: unknown): string {
  const text = String((error as { message?: string })?.message || '');
  if (/Invalid login credentials/i.test(text)) return 'Email hoặc mật khẩu chưa đúng. Vui lòng kiểm tra lại.';
  if (/Email not confirmed/i.test(text)) return 'Bạn cần xác nhận email trước khi đăng nhập.';
  if (/email address not authorized|email_address_not_authorized/i.test(text)) return 'HomaCare chưa gửi được email xác nhận đến địa chỉ này. Vui lòng liên hệ đội ngũ HomaCare để được hỗ trợ.';
  if (/already registered|already been registered/i.test(text)) return 'Email này đã có tài khoản. Bạn có thể đăng nhập hoặc lấy lại mật khẩu.';
  if (/rate limit|too many requests|over_email_send_rate_limit/i.test(text)) return 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.';
  if (/fetch|network/i.test(text)) return 'Chưa kết nối được. Bạn kiểm tra mạng rồi thử lại nhé.';
  if (/password/i.test(text)) return 'Mật khẩu chưa đáp ứng yêu cầu. Hãy dùng ít nhất 8 ký tự.';
  return 'Chưa thực hiện được thao tác này. Vui lòng thử lại sau.';
}

/** Hồ sơ của phiên hiện tại; null nếu chưa đăng nhập. Lỗi mạng ném Error có câu tiếng Việt. */
export async function profile(): Promise<Profile | null> {
  const client = await getClient();
  if (!client) throw new Error('Hệ thống tài khoản đang được chuẩn bị. Vui lòng quay lại sau.');
  const { data: { user }, error } = await client.auth.getUser();
  if (error) {
    if (error.name === 'AuthSessionMissingError' || error.status === 401 || error.status === 403) return null;
    throw new Error(failure(error));
  }
  if (!user) return null;
  const result = await client.from('profiles').select('id,full_name,role').eq('id', user.id).single();
  if (result.error) throw new Error('Chưa tải được hồ sơ tài khoản. Vui lòng thử lại.');
  return result.data as Profile;
}

export function go(role: Role, booking = false): void {
  location.assign(DESTINATIONS[role] + (role === 'family' && booking ? '?booking=1' : ''));
}

export async function logout(): Promise<void> {
  const client = await getClient();
  if (client) {
    const { error } = await client.auth.signOut();
    if (error) throw new Error(failure(error));
  }
  location.assign('/');
}

/** Link trong email Supabase mang phiên trong #fragment hoặc ?code=. Trang nào nhận được thì chuyển sang trang đăng nhập, giữ nguyên tham số. */
export function forwardAuthCallback(): boolean {
  const hash = new URLSearchParams(location.hash.slice(1));
  const search = new URLSearchParams(location.search);
  const isCallback = hash.has('access_token') || hash.has('error_code') || hash.has('error') || search.has('code') || search.has('error');
  if (!isCallback || location.pathname.startsWith('/app/dang-nhap')) return false;
  const target = new URL(LOGIN_PATH, location.href);
  target.search = location.search;
  target.hash = location.hash;
  location.replace(target.href);
  return true;
}
