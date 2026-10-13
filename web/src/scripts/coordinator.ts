// Thao tác của không gian điều phối (giai đoạn 4): lọc ca theo trạng thái, xem chi tiết, phân công chuyên viên.
// Gọi assign_homa_visit qua src/lib/visits.ts; RPC kiểm tra vai trò, trạng thái "Chờ phân công" và
// unique index visits_unique_caregiver_evening (mỗi chuyên viên một ca mỗi tối).
import type { Context } from './workspace';
import { careLog, person, relativeName, times } from './render';
import { $, toast, close, setError, clearErrors, formError, busy } from './forms';
import { esc, initials } from '../lib/html';
import { pill, timeline } from '../lib/status';
import { PACKAGE, assignVisit, availableStaff, caregiverOf, dayLabel, familyOf, issue, relativeOf, type Visit } from '../lib/visits';

let ctx: Context | null = null;
/** Bộ lọc đang chọn, giữ qua các lần vẽ lại (sau khi phân công, bấm Cập nhật). */
export let filter = 'all';
export function setContext(next: Context) { ctx = next; }

const findVisit = (id?: string) => ctx?.data.visits.find(v => v.id === id);
/** Số ca chuyên viên đang nhận (đã phân công hoặc đang chăm sóc). */
export const load = (staffId: string) => (ctx?.data.visits || []).filter(v => v.caregiver_id === staffId && v.status !== 'completed').length;

/* ---------- Lọc theo tab (sự kiện hc:tabchange từ components.js) ---------- */
function applyFilter() {
  let shown = 0;
  document.querySelectorAll<HTMLElement>('#visit-list [data-row-status]').forEach(row => {
    row.hidden = filter !== 'all' && row.dataset.rowStatus !== filter;
    if (!row.hidden) shown++;
  });
  const emptyBox = $<HTMLElement>('[data-list-empty]');
  if (emptyBox) emptyBox.hidden = shown > 0;
}
document.addEventListener('hc:tabchange', e => {
  filter = (e as CustomEvent).detail.value as string;
  applyFilter();
});

/* ---------- Chi tiết ca + phân công ---------- */
function staffOptions(v: Visit): string {
  const staff = ctx!.data.staff;
  if (!staff.length) return '<p class="hc-hint">Chưa có tài khoản chuyên viên nào để phân công.</p>';
  const free = new Set(availableStaff(ctx!.data, v).map(p => p.id));
  return staff.map(p => {
    const ok = free.has(p.id);
    const n = load(p.id);
    const note = ok ? `Còn trống tối này · ${n ? `đang nhận ${n} ca` : 'chưa nhận ca nào'}` : 'Đã có ca tối này';
    return `<label class="hc-check app-staff-option">
      <input type="radio" name="caregiver_id" value="${esc(p.id)}" ${ok ? '' : 'disabled'}>
      <span class="hc-check__text"><span class="hc-avatar hc-avatar--sm" data-role="caregiver" aria-hidden="true">${esc(initials(p.full_name))}</span>${esc(p.full_name)}<small>${note}</small></span>
    </label>`;
  }).join('');
}

function detailHtml(v: Visit): string {
  const r = relativeOf(v), cg = caregiverOf(v), fam = familyOf(v);
  const assign = v.status === 'pending' ? `
    <form id="assign-form" class="hc-stack" novalidate data-visit="${esc(v.id)}" style="--stack-gap: var(--space-3)">
      <fieldset class="hc-field app-fieldset" id="assign-staff">
        <legend class="hc-label">Chọn chuyên viên cho ${esc(dayLabel(v.care_date))}</legend>
        <div class="hc-stack" style="--stack-gap: var(--space-2)">${staffOptions(v)}</div>
      </fieldset>
      ${availableStaff(ctx!.data, v).length ? '' : '<p class="hc-hint">Mọi chuyên viên đã có ca tối này. Hãy gọi gia đình để đổi sang ngày khác.</p>'}
      <p class="app-form-error" data-form-error role="alert" hidden></p>
    </form>` : '';
  return `
    <div class="hc-card__head">${person(r?.full_name || 'Người thân', `${r?.age ? r.age + ' tuổi · ' : ''}${r?.area || ''}`, 'relative')}${pill(v.status)}</div>
    <dl class="app-dl">
      <div><dt>Ngày</dt><dd>${esc(dayLabel(v.care_date))}</dd></div>
      <div><dt>Khung giờ</dt><dd>${PACKAGE.hours} · Gói ${PACKAGE.name}</dd></div>
      <div><dt>Gia đình</dt><dd>${esc(fam?.full_name || '')}</dd></div>
      <div><dt>Người thân</dt><dd>${esc(relativeName(r))}</dd></div>
      <div><dt>Chuyên viên</dt><dd>${esc(cg?.full_name || 'Chưa phân công')}</dd></div>
    </dl>
    ${r?.preferences ? `<div class="hc-visit__note"><strong>Thói quen & mong muốn</strong>${esc(r.preferences)}</div>` : ''}
    <div class="hc-visit__note"><strong>Lưu ý của gia đình</strong>${esc(v.care_note || 'Chưa có lưu ý thêm')}</div>
    ${assign}
    ${timeline(v.status, { vertical: true, times: times(v) })}
    ${v.status === 'completed' ? careLog(v) : ''}`;
}

/** Nút Phân công chỉ hiện với ca chờ, và tắt khi không còn chuyên viên nào trống tối đó. */
function syncSubmit(v: Visit | undefined) {
  const submit = $<HTMLButtonElement>('[data-assign-submit]')!;
  const pending = v?.status === 'pending';
  submit.hidden = !pending;
  submit.disabled = !pending || !availableStaff(ctx!.data, v!).length;
}

function showDetail(v: Visit) {
  const sheet = $<HTMLDialogElement>('#visit-detail')!;
  const pending = v.status === 'pending';
  $('#visit-detail-title')!.textContent = pending ? 'Phân công ca' : 'Chi tiết ca';
  $('#visit-detail-desc')!.textContent = pending
    ? 'Đọc hồ sơ người thân rồi chọn một chuyên viên còn trống tối đó.'
    : 'Thông tin ca, tiến trình và nhật ký nếu đã có.';
  $('[data-detail-body]', sheet)!.innerHTML = detailHtml(v);
  syncSubmit(v);
  $('[data-detail-close]', sheet)!.textContent = pending ? 'Để sau' : 'Đóng';
}

document.addEventListener('click', e => {
  const button = (e.target as Element).closest<HTMLButtonElement>('[data-detail]');
  if (!button || !ctx) return;
  const v = findVisit(button.dataset.detail);
  if (!v) return;
  showDetail(v);
  window.HC.openSheet('visit-detail', button);
});

/** Sau khi vẽ lại: focus nút của đúng ca nếu hàng còn hiện theo bộ lọc, không thì về tab đang chọn. */
function focusRow(id: string) {
  const row = $<HTMLElement>(`[data-detail="${CSS.escape(id)}"]`);
  if (row && !row.closest<HTMLElement>('[data-row-status]')?.hidden) row.focus();
  else $<HTMLElement>('.hc-tab[aria-selected="true"]')?.focus();
}

document.addEventListener('submit', async e => {
  const form = e.target as HTMLFormElement;
  if (form.id !== 'assign-form' || !ctx) return;
  e.preventDefault();
  const id = form.dataset.visit!;
  const v = findVisit(id);
  const group = $<HTMLElement>('#assign-staff', form)!;
  const picked = form.querySelector<HTMLInputElement>('[name="caregiver_id"]:checked');
  clearErrors(form);
  if (!v) return;
  if (!picked) {
    setError(group, 'Bạn chọn một chuyên viên còn trống tối này.');
    group.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus();
    return;
  }
  const staffName = ctx.data.staff.find(p => p.id === picked.value)?.full_name || 'Chuyên viên';
  const button = $<HTMLButtonElement>('[data-assign-submit]');
  busy(button, true);
  try {
    await assignVisit(ctx.client, id, picked.value);
    await Promise.all([close('visit-detail'), ctx.reload()]);
    toast(`${staffName} nhận ca ${dayLabel(v.care_date)} với ${relativeOf(v)?.full_name || 'người thân'}. Gia đình thấy tên chuyên viên ngay.`, { tone: 'success', title: 'Đã phân công' });
    focusRow(id);
  } catch (error) {
    const err = error as { code?: string; message?: string };
    if (err?.code === '23505') {
      // Chuyên viên vừa được giao ca khác tối đó: tải lại để khóa đúng người đã bận
      if (await ctx.reload()) { const fresh = findVisit(id); if (fresh) showDetail(fresh); }
      const box = $<HTMLElement>('#assign-staff');
      if (box) { setError(box, `${staffName} vừa nhận ca khác tối này. Hãy chọn người khác.`); box.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus(); }
    } else if (/invalid_state/.test(String(err?.message))) {
      await Promise.all([close('visit-detail'), ctx.reload()]);
      toast('Ca này vừa được điều phối viên khác phân công. Danh sách đã được cập nhật.', { tone: 'warning' });
      focusRow(id);
    } else formError(form, issue(error));
  } finally {
    busy(button, false);
    syncSubmit(findVisit(id));
  }
});
