// Client Supabase GIẢ LẬP, chỉ nạp khi chạy `npm run dev:fixture` (astro dev --mode fixture).
// Bản build thật không chứa file này. Dữ liệu nằm trong sessionStorage của trình duyệt, không gửi đi đâu.
// Tên người là dữ liệu minh họa (Bác Trần Văn An, Nguyễn Thanh Trúc, Trần Lan Anh, Đỗ Thu Hà, Vũ Minh Châu, Bà Vũ Thị Lan).
// Đăng nhập: email bắt đầu bằng "caregiver" → chuyên viên, "coordinator" → điều phối, "family-new" → gia đình
// chưa có người thân (thử luồng bắt đầu), còn lại → gia đình có sẵn lịch; mật khẩu bất kỳ.
import type { SupabaseClient } from '@supabase/supabase-js';
import { SESSION_STORAGE_KEY } from './config';

type Row = Record<string, any>;
type Listener = (event: string, session: unknown) => void;

// key: giá trị lưu ở localStorage (SESSION_STORAGE_KEY) cho biết đang đăng nhập tài khoản nào
const PROFILES: Row[] = [
  { id: 'fx-family', full_name: 'Trần Lan Anh', role: 'family', key: 'family' },
  { id: 'fx-family-new', full_name: 'Đỗ Thu Hà', role: 'family', key: 'family-new' },
  { id: 'fx-family-2', full_name: 'Vũ Minh Châu', role: 'family' },
  { id: 'fx-caregiver', full_name: 'Nguyễn Thanh Trúc', role: 'caregiver', key: 'caregiver' },
  { id: 'fx-caregiver-2', full_name: 'Lê Minh Hà', role: 'caregiver' },
  { id: 'fx-coordinator', full_name: 'Phạm Quốc Bảo', role: 'coordinator', key: 'coordinator' },
];

function day(offset: number): string {
  return new Date(Date.now() + offset * 86400000 + 7 * 3600000).toISOString().slice(0, 10);
}
function stamp(offset: number, hour: number, minute = 0): string {
  return `${day(offset)}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+07:00`;
}

function seed(): Record<string, Row[]> {
  const relative = {
    id: 'fx-rel-1', family_id: 'fx-family', full_name: 'Trần Văn An', relationship: 'Bố', age: 78,
    area: 'Láng Thượng, Đống Đa, Hà Nội', preferences: 'Thích trà sen sau bữa tối. Đi bộ quanh sân lúc 19:30. Ăn nhạt.',
    created_at: stamp(-20, 9),
  };
  const base = { family_id: 'fx-family', relative_id: relative.id, care_note: '', tasks: [false, false, false, false], mood: null, report_text: null, next_note: '', rating: null, assigned_at: null, started_at: null, completed_at: null };
  // Gia đình thứ hai (không đăng nhập được): một yêu cầu mới tối nay, để điều phối thấy chuyên viên đã bận tối đó
  const other = {
    id: 'fx-rel-2', family_id: 'fx-family-2', full_name: 'Vũ Thị Lan', relationship: 'Bà', age: 83,
    area: 'Trung Hòa, Cầu Giấy, Hà Nội', preferences: 'Thích nghe nhạc trữ tình. Đi lại chậm, cần người dìu khi xuống cầu thang.',
    created_at: stamp(-9, 10),
  };
  return {
    profiles: PROFILES,
    relatives: [relative, other],
    visits: [
      { ...base, id: 'fx-v5', family_id: other.family_id, relative_id: other.id, caregiver_id: null, care_date: day(0), status: 'pending', care_note: 'Bà ăn cháo loãng buổi tối.', created_at: stamp(0, 8, 40) },
      { ...base, id: 'fx-v1', caregiver_id: null, care_date: day(2), status: 'pending', care_note: 'Nhờ chuyên viên nhắc bố uống đủ nước.', created_at: stamp(-1, 20, 14) },
      { ...base, id: 'fx-v2', caregiver_id: 'fx-caregiver', care_date: day(0), status: 'assigned', care_note: 'Bố thích nghe đọc báo thời sự.', created_at: stamp(-3, 21), assigned_at: stamp(-2, 9, 30) },
      { ...base, id: 'fx-v3', caregiver_id: 'fx-caregiver', care_date: day(-4), status: 'completed', tasks: [true, true, true, true], mood: 'Sinh hoạt như thường ngày', report_text: 'Bác ăn hết bát cháo cá, đi bộ hai vòng sân chung cư. Bác kể chuyện hồi dạy học và dặn lần sau mang bàn cờ tướng.', next_note: 'Mang bàn cờ tướng.', created_at: stamp(-7, 20), assigned_at: stamp(-6, 10), started_at: stamp(-4, 18, 4), completed_at: stamp(-4, 21, 52) },
      { ...base, id: 'fx-v4', caregiver_id: 'fx-caregiver', care_date: day(-11), status: 'completed', tasks: [true, true, true, true], mood: 'Sinh hoạt như thường ngày', report_text: 'Trời mưa nên hai bác cháu không xuống sân, thay bằng tập vươn vai trong nhà. Bác ngủ sớm lúc 21:30.', rating: 5, created_at: stamp(-14, 20), assigned_at: stamp(-13, 10), started_at: stamp(-11, 18), completed_at: stamp(-11, 21, 48) },
    ],
  };
}

const DATA_KEY = 'homa-fixture-data';
function load(): Record<string, Row[]> {
  try { const raw = sessionStorage.getItem(DATA_KEY); if (raw) return JSON.parse(raw); } catch { /* bỏ qua */ }
  return seed();
}
function save(db: Record<string, Row[]>) { try { sessionStorage.setItem(DATA_KEY, JSON.stringify(db)); } catch { /* bỏ qua */ } }

export function createFixtureClient(): SupabaseClient {
  const db = load();
  const listeners: Listener[] = [];
  const current = (): Row | null => PROFILES.find(p => p.key && p.key === localStorage.getItem(SESSION_STORAGE_KEY)) || null;
  const session = () => (current() ? { user: { id: current()!.id }, access_token: 'fixture' } : null);
  const emit = (event: string) => listeners.forEach(fn => fn(event, session()));
  const delay = <T>(value: T) => new Promise<T>(resolve => setTimeout(() => resolve(value), 250));
  const profile = (id: string | null) => (id ? (({ id: pid, full_name }) => ({ id: pid, full_name }))(PROFILES.find(p => p.id === id)!) : null);

  // RLS giả lập: mỗi vai trò chỉ thấy dữ liệu của mình
  function visible(table: string): Row[] {
    const me = current();
    if (!me) return [];
    if (table === 'profiles') return me.role === 'coordinator' ? db.profiles : db.profiles.filter(p => p.id === me.id);
    if (table === 'relatives') return db.relatives.filter(r => me.role === 'coordinator' || r.family_id === me.id || db.visits.some(v => v.relative_id === r.id && v.caregiver_id === me.id));
    const visits = db.visits.filter(v => me.role === 'coordinator' || v.family_id === me.id || v.caregiver_id === me.id);
    return visits.map(v => ({ ...v, relative: db.relatives.find(r => r.id === v.relative_id) || null, caregiver: profile(v.caregiver_id), family: profile(v.family_id) }));
  }

  function from(table: string) {
    const filters: [string, unknown][] = [];
    const sorts: [string, boolean][] = [];
    let inserted: Row | null = null;
    const result = () => {
      if (inserted) { db[table].push({ ...inserted, id: 'fx-' + Date.now(), created_at: new Date().toISOString() }); save(db); return { data: null, error: null }; }
      const rows = visible(table).filter(r => filters.every(([k, v]) => r[k] === v));
      rows.sort((a, b) => { for (const [k, asc] of sorts) { if (a[k] !== b[k]) return (a[k] > b[k] ? 1 : -1) * (asc ? 1 : -1); } return 0; });
      return { data: rows, error: null };
    };
    const query: any = {
      select: () => query,
      order: (k: string, opts?: { ascending?: boolean }) => { sorts.push([k, opts?.ascending !== false]); return query; },
      eq: (k: string, v: unknown) => { filters.push([k, v]); return query; },
      insert: (row: Row) => { inserted = row; return query; },
      single: async () => { const rows = result().data as Row[]; return rows?.length ? { data: rows[0], error: null } : { data: null, error: { message: 'not found' } }; },
      then: (resolve: any, reject: any) => delay(result()).then(resolve, reject),
    };
    return query;
  }

  /** Cùng điều kiện với assign/start/complete_homa_visit trong backend/schema.sql (trả lỗi như Postgres). */
  function reject(name: string, v: Row, args: Row): Row | null {
    const me = current();
    const fail = (message: string, code?: string) => ({ message, code });
    if (name === 'assign_homa_visit') {
      if (me?.role !== 'coordinator') return fail('not_allowed');
      if (v.status !== 'pending') return fail('invalid_state');
      if (!PROFILES.some(p => p.id === args.p_caregiver_id && p.role === 'caregiver')) return fail('invalid_caregiver');
      if (db.visits.some(x => x.caregiver_id === args.p_caregiver_id && x.care_date === v.care_date)) return fail('duplicate key value violates unique constraint "visits_unique_caregiver_evening"', '23505');
    }
    if (name === 'start_homa_visit' || name === 'complete_homa_visit') {
      if (me?.role !== 'caregiver' || v.caregiver_id !== me.id) return fail('not_allowed');
      if (v.status !== (name === 'start_homa_visit' ? 'assigned' : 'in_progress')) return fail('invalid_state');
    }
    if (name === 'complete_homa_visit') {
      if (JSON.stringify(args.p_tasks) !== '[true,true,true,true]') return fail('incomplete_tasks');
      if (!args.p_report || args.p_report.trim().length < 10) return fail('invalid_report');
    }
    return null;
  }

  async function rpc(name: string, args: Row) {
    const now = new Date().toISOString();
    const v = db.visits.find(x => x.id === args.p_visit_id);
    // Giống backend/schema.sql: không đặt ngày đã qua, mỗi người thân một ca mỗi ngày (unique index)
    if (name === 'book_homa_visit' && args.p_care_date < day(0)) return delay({ data: null, error: { message: 'invalid_date' } });
    if (name === 'book_homa_visit' && db.visits.some(x => x.relative_id === args.p_relative_id && x.care_date === args.p_care_date)) return delay({ data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint "visits_unique_relative_evening"' } });
    if (name === 'book_homa_visit') db.visits.push({ id: 'fx-' + Date.now(), family_id: current()?.id, relative_id: args.p_relative_id, caregiver_id: null, care_date: args.p_care_date, status: 'pending', care_note: args.p_note || '', tasks: [false, false, false, false], mood: null, report_text: null, next_note: '', rating: null, created_at: now, assigned_at: null, started_at: null, completed_at: null });
    else if (!v) return delay({ data: null, error: { message: 'invalid_state' } });
    else if (reject(name, v, args)) return delay({ data: null, error: reject(name, v, args) });
    else if (name === 'assign_homa_visit') Object.assign(v, { status: 'assigned', caregiver_id: args.p_caregiver_id, assigned_at: now });
    else if (name === 'start_homa_visit') Object.assign(v, { status: 'in_progress', started_at: now });
    else if (name === 'complete_homa_visit') Object.assign(v, { status: 'completed', tasks: args.p_tasks, mood: args.p_mood, report_text: args.p_report, next_note: args.p_next_note, completed_at: now });
    else if (name === 'rate_homa_visit') v.rating = args.p_rating;
    save(db);
    return delay({ data: null, error: null });
  }

  const auth = {
    getUser: async () => (current() ? { data: { user: { id: current()!.id } }, error: null } : { data: { user: null }, error: { name: 'AuthSessionMissingError', status: 400 } }),
    getSession: async () => ({ data: { session: session() }, error: null }),
    onAuthStateChange: (fn: Listener) => { listeners.push(fn); return { data: { subscription: { unsubscribe() {} } } }; },
    signInWithPassword: async ({ email }: { email: string }) => {
      const key = ['caregiver', 'coordinator', 'family-new'].find(k => email.startsWith(k)) || 'family';
      localStorage.setItem(SESSION_STORAGE_KEY, key); emit('SIGNED_IN');
      return delay({ data: { session: session(), user: { id: current()!.id } }, error: null });
    },
    signUp: async () => delay({ data: { session: null, user: { identities: [{}] } }, error: null }),
    signOut: async () => { localStorage.removeItem(SESSION_STORAGE_KEY); emit('SIGNED_OUT'); return { error: null }; },
    resetPasswordForEmail: async () => delay({ data: {}, error: null }),
    updateUser: async () => delay({ data: {}, error: null }),
  };

  return { auth, from, rpc } as unknown as SupabaseClient;
}
