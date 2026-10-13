// Dữ liệu và thao tác của ba không gian. Chuyển từ preview/workspace.js: cùng câu truy vấn, cùng tên RPC
// và tham số, nên RLS/RPC trong backend/schema.sql không cần đổi.
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Role } from './auth';
import type { VisitStatus } from './status';

export interface Relative {
  id: string; family_id: string; full_name: string; relationship: string; age: number; area: string; preferences: string; created_at?: string;
}
export interface PersonRef { id: string; full_name: string }
export interface Visit {
  id: string; family_id: string; relative_id: string; caregiver_id: string | null;
  care_date: string; status: VisitStatus; care_note: string; tasks: boolean[];
  mood: string | null; report_text: string | null; next_note: string; rating: number | null;
  created_at: string; assigned_at: string | null; started_at: string | null; completed_at: string | null;
  relative: Relative | Relative[] | null; caregiver: PersonRef | PersonRef[] | null; family: PersonRef | PersonRef[] | null;
}
export interface Workspace { visits: Visit[]; relatives: Relative[]; staff: PersonRef[] }

/** Gói duy nhất đang mở đặt lịch. */
export const PACKAGE = { name: 'Ân cần', hours: '18:00–22:00', duration: '4 giờ', price: '320.000đ' } as const;

/** Bốn hoạt động chuẩn, đúng thứ tự mảng visits.tasks. Icon lấy từ /icons.svg. */
export const TASKS = [
  { label: 'Hỗ trợ bữa tối', icon: 'utensils' },
  { label: 'Đồng hành vận động nhẹ', icon: 'walk' },
  { label: 'Trò chuyện & nhắc lịch sinh hoạt', icon: 'chat' },
  { label: 'Kiểm tra an toàn trước khi kết thúc', icon: 'shield' },
] as const;

export const MOODS = ['Sinh hoạt như thường ngày', 'Có điều gia đình cần lưu ý', 'Cần điều phối viên liên hệ'] as const;

const one = <T>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v);
export const relativeOf = (v: Visit) => one(v.relative);
export const caregiverOf = (v: Visit) => one(v.caregiver);
export const familyOf = (v: Visit) => one(v.family);

/* ---------- Ngày giờ (giờ Việt Nam) ---------- */
const TZ = 'Asia/Ho_Chi_Minh';
const noon = (date: string) => new Date(date + 'T12:00:00+07:00');

/** "2026-10-16" → "Thứ Năm, 16/10" */
export function dayLabel(date: string): string {
  if (!date) return '';
  const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', timeZone: TZ }).format(noon(date));
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${date.slice(8, 10)}/${date.slice(5, 7)}`;
}
/** "2026-10-16" → "16/10/2026" */
export const dateText = (date: string) => (date ? `${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)}` : '');
/** Mốc thời gian → "18:04 · 16/10" */
export function timeText(stamp: string | null): string {
  if (!stamp) return '';
  const d = new Date(stamp);
  const time = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ }).format(d);
  const [dd, mm] = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', timeZone: TZ }).format(d).split('/');
  return `${time} · ${dd}/${mm}`;
}
/** Hôm nay theo giờ Việt Nam, dạng YYYY-MM-DD. */
export function today(): string {
  const parts = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: TZ }).formatToParts(new Date());
  return ['year', 'month', 'day'].map(t => parts.find(p => p.type === t)!.value).join('-');
}

/* ---------- Lỗi ---------- */
/** Câu báo lỗi tiếng Việt cho lỗi truy vấn/RPC, cùng nội dung với bản cũ. */
export function issue(error: unknown): string {
  const e = error as { message?: string; code?: string };
  const text = String(e?.message || '');
  if (e?.code === '23505') return 'Lịch này đã được sắp xếp. Hãy chọn ngày hoặc chuyên viên khác.';
  if (/invalid_state/.test(text)) return 'Ca này vừa được cập nhật. Hãy tải lại danh sách trước khi thao tác.';
  if (/not_allowed|42501/.test(text)) return 'Bạn không có quyền thực hiện thao tác này.';
  if (/invalid_date/.test(text)) return 'Hãy chọn ngày từ hôm nay trở đi.';
  if (/incomplete_tasks/.test(text)) return 'Bạn cần ghi nhận đủ các hoạt động trước khi hoàn thành ca.';
  if (/invalid_report/.test(text)) return 'Nhật ký cần ít nhất 10 ký tự.';
  if (/fetch|network/i.test(text)) return 'Chưa kết nối được. Hãy kiểm tra mạng rồi thử lại.';
  return 'Chưa lưu được thông tin. Vui lòng thử lại.';
}

async function run<T>(request: PromiseLike<{ data: T; error: unknown }>): Promise<T> {
  const { data, error } = await request;
  if (error) throw error;
  return data;
}

/* ---------- Đọc ---------- */
const VISIT_SELECT =
  '*,relative:relatives(*),caregiver:profiles!visits_caregiver_id_fkey(id,full_name),family:profiles!visits_family_id_fkey(id,full_name)';

/** Tải dữ liệu cho một vai trò. RLS tự giới hạn: gia đình chỉ thấy ca của mình, chuyên viên chỉ thấy ca được giao. */
export async function loadWorkspace(client: SupabaseClient, role: Role): Promise<Workspace> {
  const visits = await run<Visit[]>(
    client.from('visits').select(VISIT_SELECT).order('care_date', { ascending: true }).order('created_at', { ascending: true }),
  );
  const relatives = role === 'family'
    ? await run<Relative[]>(client.from('relatives').select('*').order('created_at', { ascending: true }))
    : [];
  const staff = role === 'coordinator'
    ? await run<PersonRef[]>(client.from('profiles').select('id,full_name').eq('role', 'caregiver').order('full_name'))
    : [];
  return { visits: visits || [], relatives: relatives || [], staff: staff || [] };
}

/** Chuyên viên còn trống lịch trong ngày của ca (cùng quy tắc với bản cũ; DB vẫn chặn trùng lịch). */
export const availableStaff = (ws: Workspace, visit: Visit) =>
  ws.staff.filter(p => !ws.visits.some(v => v.caregiver_id === p.id && v.care_date === visit.care_date));

/* ---------- Ghi (dùng ở giai đoạn 3–4 khi dựng lại thao tác) ---------- */
export const addRelative = (client: SupabaseClient, familyId: string, r: Pick<Relative, 'full_name' | 'relationship' | 'age' | 'area' | 'preferences'>) =>
  run(client.from('relatives').insert({
    family_id: familyId, full_name: r.full_name.trim(), relationship: r.relationship,
    age: Number(r.age), area: r.area.trim(), preferences: (r.preferences || '').trim(),
  }));

export const bookVisit = (client: SupabaseClient, relativeId: string, careDate: string, note: string) =>
  run(client.rpc('book_homa_visit', { p_relative_id: relativeId, p_care_date: careDate, p_note: note.trim() }));

export const assignVisit = (client: SupabaseClient, visitId: string, caregiverId: string) =>
  run(client.rpc('assign_homa_visit', { p_visit_id: visitId, p_caregiver_id: caregiverId }));

export const startVisit = (client: SupabaseClient, visitId: string) =>
  run(client.rpc('start_homa_visit', { p_visit_id: visitId }));

export const completeVisit = (client: SupabaseClient, visitId: string, report: { tasks: boolean[]; mood: string; report_text: string; next_note: string }) =>
  run(client.rpc('complete_homa_visit', {
    p_visit_id: visitId, p_tasks: report.tasks, p_mood: report.mood,
    p_report: report.report_text.trim(), p_next_note: report.next_note.trim(),
  }));

export const rateVisit = (client: SupabaseClient, visitId: string, rating: number) =>
  run(client.rpc('rate_homa_visit', { p_visit_id: visitId, p_rating: rating }));
