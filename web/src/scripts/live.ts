// Cập nhật tức thì (giai đoạn 5). Ba nguồn báo "dữ liệu có thể đã đổi":
// 1. Supabase Realtime (postgres_changes trên bảng visits, lọc theo RLS) — chỉ chạy khi bảng visits đã
//    nằm trong publication supabase_realtime (xem CONTINUE-HOMACARE.md, cần người dùng duyệt).
//    Chế độ demo dùng kênh giả lập cùng dạng trong fixture.ts (tab demo khác ghi dữ liệu).
// 2. Quay lại tab sau một lúc (visibilitychange) hoặc có mạng trở lại.
// Không vẽ lại khi người dùng đang thao tác dở (sheet đang mở, đã chọn sao chưa gửi); vẽ khi họ xong.
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Role } from '../lib/auth';
import { caregiverOf, dayLabel, relativeOf, type Visit, type Workspace } from '../lib/visits';

const DEBOUNCE = 400;
const STALE_AFTER = 30_000;

/** Đang thao tác dở: vẽ lại lúc này sẽ làm mất lựa chọn hoặc đóng biểu mẫu. */
const busy = () => !!document.querySelector('dialog.hc-sheet[open], [data-rate-visit][data-value]:not([data-value="0"]):not([data-value=""])');

export function watch(client: SupabaseClient, refresh: () => Promise<unknown>, lastLoad: () => number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending = false;
  const run = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (busy()) { pending = true; return; }
      pending = false;
      refresh();
    }, DEBOUNCE);
  };
  // Sheet đóng (close không nổi bọt nên nghe ở pha bắt) hoặc gửi xong đánh giá: vẽ phần đang chờ
  document.addEventListener('close', () => { if (pending) run(); }, true);
  document.addEventListener('hc:rate', () => { if (pending) run(); });
  document.addEventListener('click', () => { if (pending) setTimeout(() => { if (pending && !busy()) run(); }, 600); });

  try {
    client.channel('homa-visits')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'visits' }, run)
      .subscribe();
  } catch { /* Realtime chưa sẵn sàng: vẫn còn cập nhật khi quay lại tab và nút Cập nhật */ }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Date.now() - lastLoad() > STALE_AFTER) run();
  });
  window.addEventListener('online', run);
}

/** Dữ liệu giống hệt lần trước thì không cần vẽ lại (ví dụ sự kiện realtime do chính thao tác của mình). */
export const same = (a: Workspace, b: Workspace) =>
  JSON.stringify([a.visits, a.relatives, a.staff]) === JSON.stringify([b.visits, b.relatives, b.staff]);

/** Câu báo những thay đổi do người khác tạo ra, theo vai trò đang xem. Thao tác của chính mình không sinh câu nào. */
export function changes(role: Role, before: Workspace, after: Workspace): string[] {
  const old = new Map(before.visits.map(v => [v.id, v]));
  const notes: string[] = [];
  const who = (v: Visit) => relativeOf(v)?.full_name || 'người thân';
  for (const v of after.visits) {
    const prev = old.get(v.id);
    const day = dayLabel(v.care_date);
    if (role === 'coordinator' && !prev && v.status === 'pending') notes.push(`Yêu cầu mới: ${who(v)} · ${day}.`);
    if (role === 'caregiver' && (!prev || prev.status === 'pending') && v.status === 'assigned') notes.push(`Bạn được giao ca ${day} với ${who(v)}.`);
    if (role === 'family' && prev && prev.status !== v.status) {
      const cg = caregiverOf(v)?.full_name || 'Chuyên viên';
      if (v.status === 'assigned') notes.push(`Ca ${day}: ${cg} sẽ đến chăm sóc ${who(v)}.`);
      if (v.status === 'in_progress') notes.push(`${cg} đã bắt đầu ca ${day} với ${who(v)}.`);
      if (v.status === 'completed') notes.push(`Đã có nhật ký ca ${day}. Bạn có thể đọc và đánh giá.`);
    }
    if (role === 'coordinator' && prev && prev.status !== v.status && v.status === 'completed') notes.push(`${caregiverOf(v)?.full_name || 'Chuyên viên'} đã gửi nhật ký ca ${day}.`);
  }
  return notes;
}

/** Khóa nhận diện phần tử đang focus, để tìm lại phần tử tương ứng sau khi vẽ lại. */
export function focusKey(view: HTMLElement): string | null {
  const el = document.activeElement as HTMLElement | null;
  if (!el || el === view || !view.contains(el)) return null;
  if (el.id) return `#${CSS.escape(el.id)}`;
  const attrs = ['data-action', 'data-detail', 'data-value', 'data-visit']
    .filter(a => el.hasAttribute(a)).map(a => `[${a}="${CSS.escape(el.getAttribute(a)!)}"]`).join('');
  if (!attrs) return null;
  const scope = el.parentElement?.closest<HTMLElement>('[data-visit]');
  return `${scope ? `[data-visit="${CSS.escape(scope.dataset.visit!)}"] ` : ''}${el.tagName.toLowerCase()}${attrs}`;
}
export function restoreFocus(view: HTMLElement, key: string | null) {
  if (!key || (document.activeElement && document.activeElement !== document.body)) return;
  view.querySelector<HTMLElement>(key)?.focus({ preventScroll: true });
}
