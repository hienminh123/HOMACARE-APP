// Thao tác của không gian gia đình (giai đoạn 3): thêm người thân, đặt ca Ân cần 2 bước, đánh giá sao.
// Gọi đúng bảng/RPC như preview/workspace.js qua src/lib/visits.ts; quyền vẫn do RLS/RPC kiểm tra.
import type { Context } from './workspace';
import { esc, icon, initials } from '../lib/html';
import { $, toast, sheet, close, refocus, setError, clearErrors, formError, busy, syncCounters } from './forms';
import { PACKAGE, addRelative, bookVisit, rateVisit, dayLabel, issue, today, type Relative } from '../lib/visits';

let ctx: Context | null = null;
/** Mỗi lần vẽ lại không gian, trang gọi hàm này để thao tác dùng dữ liệu mới nhất. */
export function setContext(next: Context) { ctx = next; }

/* ======================================================================
   Thêm người thân
   ====================================================================== */
let bookAfterRelative = false;

export function openRelative({ thenBook = false, opener = null as Element | null } = {}) {
  bookAfterRelative = thenBook;
  const form = $<HTMLFormElement>('#relative-form')!;
  form.reset();
  clearErrors(form);
  syncCounters(form);
  window.HC.openSheet('relative-sheet', opener);
  setTimeout(() => $<HTMLInputElement>('#relative-name')?.focus(), 50);
}

function validateRelative(form: HTMLFormElement) {
  const name = $<HTMLInputElement>('#relative-name', form)!;
  const age = $<HTMLInputElement>('#relative-age', form)!;
  const area = $<HTMLInputElement>('#relative-area', form)!;
  const checks: [HTMLElement, string | null][] = [
    [name, name.value.trim().length < 2 ? 'Bạn nhập họ và tên người thân, ít nhất 2 ký tự.' : null],
    [age, !/^\d+$/.test(age.value) || +age.value < 18 || +age.value > 120 ? 'Tuổi cần là số từ 18 đến 120.' : null],
    [area, area.value.trim().length < 2 ? 'Bạn ghi khu vực chăm sóc, ví dụ: Đống Đa, Hà Nội.' : null],
  ];
  checks.forEach(([f, m]) => setError(f, m));
  const first = checks.find(([, m]) => m);
  if (first) (first[0] as HTMLInputElement).focus();
  return !first;
}

document.addEventListener('submit', async e => {
  const form = e.target as HTMLFormElement;
  if (form.id !== 'relative-form') return;
  e.preventDefault();
  if (!ctx || !validateRelative(form)) return;
  const button = $<HTMLButtonElement>('[data-relative-submit]');
  const fields = Object.fromEntries(new FormData(form)) as Record<string, string>;
  busy(button, true);
  formError(form, null);
  try {
    await addRelative(ctx.client, ctx.profile.id, {
      full_name: fields.full_name, relationship: fields.relationship, age: Number(fields.age), area: fields.area, preferences: fields.preferences || '',
    });
    await Promise.all([close('relative-sheet'), ctx.reload()]);
    toast(`Chuyên viên sẽ đọc hồ sơ của ${fields.relationship.toLowerCase()} trước mỗi buổi.`, { tone: 'success', title: 'Đã lưu hồ sơ người thân' });
    if (bookAfterRelative) { bookAfterRelative = false; openBooking($('[data-action="book"]')); }
    else refocus('#nguoi-than [data-action="add-relative"]', '[data-action="book"]');
  } catch (error) {
    formError(form, issue(error));
  } finally {
    busy(button, false);
  }
});

/* ======================================================================
   Đặt ca: bước 1 Thông tin ca → bước 2 Xác nhận
   ====================================================================== */
const DAYS_AHEAD = 21;
const WEEKDAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const takenDates = (relativeId: string) =>
  new Set((ctx?.data.visits || []).filter(v => v.relative_id === relativeId).map(v => v.care_date));

/** Hàng chọn ngày: 21 ngày tới, hiển thị dd/mm, khóa ngày người thân đã có ca (DB chỉ cho một ca mỗi ngày).
 *  `keep`: giữ ngày đang chọn nếu còn trống; null = không chọn sẵn ngày nào (để gia đình tự chọn lại). */
function renderDays(relativeId: string, keep?: string | null) {
  const box = $<HTMLElement>('[data-days]')!;
  const start = today();
  const taken = takenDates(relativeId);
  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(start, i));
  const preferred = keep === null ? null
    : keep && !taken.has(keep) ? keep : days.find((d, i) => i > 0 && !taken.has(d)) || days.find(d => !taken.has(d));
  box.innerHTML = days.map((d, i) => {
    const off = taken.has(d);
    const top = i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : WEEKDAY[new Date(d + 'T00:00:00Z').getUTCDay()];
    return `<label class="app-day${off ? ' is-taken' : ''}">
      <input type="radio" name="care_date" value="${d}" ${d === preferred ? 'checked' : ''} ${off ? 'disabled' : ''} aria-label="${esc(dayLabel(d))}/${d.slice(0, 4)}${off ? ', đã có ca' : ''}">
      <span class="app-day__top">${top}</span><span class="app-day__date hc-num">${d.slice(8, 10)}/${d.slice(5, 7)}</span>${off ? '<span class="app-day__note">Đã có ca</span>' : ''}
    </label>`;
  }).join('');
  updateDayHint();
  box.querySelector<HTMLInputElement>('input:checked')?.closest('label')?.scrollIntoView({ block: 'nearest', inline: 'center' });
}
function updateDayHint() {
  const picked = $<HTMLInputElement>('[data-days] input:checked');
  const hint = $<HTMLElement>('[data-day-hint]')!;
  hint.textContent = picked ? `Đã chọn: ${dayLabel(picked.value)}/${picked.value.slice(0, 4)} · ${PACKAGE.hours}` : 'Chưa chọn ngày.';
  $<HTMLElement>('[data-day-error]')!.hidden = true;
}

function setStep(step: 'details' | 'review') {
  const form = $<HTMLFormElement>('#booking-form')!;
  const review = step === 'review';
  $<HTMLElement>('[data-step="details"]', form)!.hidden = review;
  $<HTMLElement>('[data-step="review"]', form)!.hidden = !review;
  $('#booking-sheet-desc')!.textContent = review
    ? 'Bước 2 trên 2 · Kiểm tra thông tin trước khi gửi cho điều phối viên.'
    : 'Bước 1 trên 2 · Chọn người thân, ngày và điều cần lưu ý.';
  $('[data-booking-back]')!.textContent = review ? 'Quay lại sửa' : 'Để sau';
  $('[data-booking-submit]')!.textContent = review ? 'Xác nhận và gửi yêu cầu' : 'Xem lại yêu cầu';
  form.dataset.step = step;
  formError(form, null);
  $<HTMLElement>('.hc-sheet__body', sheet('booking-sheet'))!.scrollTop = 0;
  if (review) $<HTMLElement>('[data-step="review"]', form)!.focus();
}

export function openBooking(opener: Element | null = null) {
  if (!ctx) return;
  if (!ctx.data.relatives.length) {
    toast('Thêm hồ sơ người thân trước khi đặt ca nhé.', { tone: 'info' });
    openRelative({ thenBook: true, opener });
    return;
  }
  const form = $<HTMLFormElement>('#booking-form')!;
  form.reset();
  const select = $<HTMLSelectElement>('#booking-relative')!;
  select.innerHTML = ctx.data.relatives.map(r => `<option value="${esc(r.id)}">${esc(r.relationship)} · ${esc(r.full_name)}</option>`).join('');
  $<HTMLElement>('[data-relative-field]')!.hidden = ctx.data.relatives.length < 2;
  renderDays(select.value);
  syncCounters(form);
  setStep('details');
  window.HC.openSheet('booking-sheet', opener);
}

function reviewHtml(r: Relative, date: string, note: string) {
  return `
    <div class="hc-person hc-person--boxed"><span class="hc-avatar" data-role="relative" aria-hidden="true">${esc(initials(r.full_name))}</span><span class="hc-person__text"><span class="hc-person__name">${esc(r.relationship)} · ${esc(r.full_name)}</span><span class="hc-person__role">${r.age} tuổi · ${esc(r.area)}</span></span></div>
    <dl class="app-dl">
      <div><dt>Ngày chăm sóc</dt><dd>${esc(dayLabel(date))}/${date.slice(0, 4)}</dd></div>
      <div><dt>Khung giờ</dt><dd>${PACKAGE.hours} · ${PACKAGE.duration}</dd></div>
      <div><dt>Gói dịch vụ</dt><dd>${PACKAGE.name} · Hỗ trợ sinh hoạt tại nhà</dd></div>
      <div><dt>Giá đề xuất</dt><dd class="hc-num">${PACKAGE.price}/buổi</dd></div>
    </dl>
    <div class="hc-visit__note"><strong>Lưu ý cho chuyên viên</strong>${esc(note.trim() || 'Không có lưu ý thêm.')}</div>
    <p class="hc-hint">Gửi yêu cầu chưa tính phí. Ca sẽ ở trạng thái Chờ phân công cho tới khi điều phối viên sắp xếp chuyên viên. Mức giá là đề xuất cho giai đoạn thử nghiệm.</p>`;
}

document.addEventListener('change', e => {
  const t = e.target as HTMLElement;
  if (t.id === 'booking-relative') renderDays((t as HTMLSelectElement).value, $<HTMLInputElement>('[data-days] input:checked')?.value);
  if (t.matches?.('[data-days] input')) updateDayHint();
});

document.addEventListener('click', e => {
  const back = (e.target as Element).closest('[data-booking-back]');
  if (!back) return;
  const form = $<HTMLFormElement>('#booking-form')!;
  if (form.dataset.step === 'review') setStep('details');
  else close('booking-sheet');
});

document.addEventListener('submit', async e => {
  const form = e.target as HTMLFormElement;
  if (form.id !== 'booking-form' || !ctx) return;
  e.preventDefault();
  const relative = ctx.data.relatives.find(r => r.id === $<HTMLSelectElement>('#booking-relative')!.value);
  const date = $<HTMLInputElement>('[data-days] input:checked')?.value;
  const note = $<HTMLTextAreaElement>('#booking-note')!.value;
  const dayError = $<HTMLElement>('[data-day-error]')!;
  const showDayError = (text: string) => {
    setStep('details');
    dayError.hidden = false;
    dayError.innerHTML = `${icon('alert')}${esc(text)}`;
    ($<HTMLInputElement>('[data-days] input:checked') || $<HTMLInputElement>('[data-days] input:not(:disabled)'))?.focus();
    dayError.scrollIntoView({ block: 'nearest' });
  };

  if (form.dataset.step !== 'review') {
    if (!relative) { formError(form, 'Bạn chọn người thân cần chăm sóc.'); return; }
    if (!date) { showDayError('Bạn chọn một ngày còn trống trong danh sách.'); return; }
    $<HTMLElement>('[data-step="review"]', form)!.innerHTML = reviewHtml(relative, date, note);
    setStep('review');
    return;
  }

  const button = $<HTMLButtonElement>('[data-booking-submit]');
  busy(button, true);
  try {
    await bookVisit(ctx.client, relative!.id, date!, note);
    await Promise.all([close('booking-sheet'), ctx.reload()]);
    toast(`Ca ${dayLabel(date!)} đang chờ điều phối viên phân công chuyên viên.`, { tone: 'success', title: 'Đã gửi yêu cầu chăm sóc' });
    refocus('[data-action="book"]');
  } catch (error) {
    const err = error as { code?: string; message?: string };
    if (err?.code === '23505') {
      // Dữ liệu trên máy đã cũ (ca được đặt từ nơi khác): tải lại để khóa đúng ngày đã có ca
      if (await ctx.reload()) renderDays(relative!.id, null);
      showDayError(`${relative!.relationship} đã có ca vào ${dayLabel(date!)}. Hãy chọn một ngày khác còn trống.`);
    }
    else if (/invalid_date/.test(String(err?.message))) showDayError('Hãy chọn ngày từ hôm nay trở đi.');
    else formError(form, issue(error));
  } finally {
    busy(button, false);
  }
});

/* ======================================================================
   Đánh giá sao
   ====================================================================== */
document.addEventListener('hc:rate', e => {
  const box = (e.target as Element).closest<HTMLElement>('[data-rate-visit]');
  if (!box) return;
  const value = (e as CustomEvent).detail.value as number;
  box.dataset.value = String(value);
  const send = $<HTMLButtonElement>('[data-action="send-rating"]', box);
  if (send) send.disabled = !value;
});

document.addEventListener('click', async e => {
  const target = e.target as Element;
  const action = target.closest<HTMLElement>('[data-action]');
  if (!action || !ctx) return;
  const name = action.dataset.action;
  if (name === 'book') openBooking(action);
  if (name === 'add-relative') openRelative({ opener: action });
  if (name === 'send-rating') {
    const box = action.closest<HTMLElement>('[data-rate-visit]')!;
    const value = Number(box.dataset.value || 0);
    if (!value) return;
    const visit = ctx.data.visits.find(v => v.id === box.dataset.rateVisit);
    busy(action as HTMLButtonElement, true);
    try {
      await rateVisit(ctx.client, box.dataset.rateVisit!, value);
      await ctx.reload();
      toast(`Bạn chấm ${value}/5 sao cho ca ${visit ? dayLabel(visit.care_date) : ''}.`, { tone: 'success', title: 'Cảm ơn đánh giá của bạn' });
      refocus(`[data-visit="${CSS.escape(box.dataset.rateVisit!)}"] .hc-rating`);
    } catch (error) {
      toast(issue(error), { tone: 'danger' });
      busy(action as HTMLButtonElement, false);
    }
  }
});

/** Mở thẳng đặt ca khi đến từ nút "Đặt ca chăm sóc" của trang giới thiệu (?booking=1), rồi bỏ tham số khỏi URL. */
export function handleBookingIntent() {
  const url = new URL(location.href);
  if (url.searchParams.get('booking') !== '1') return;
  url.searchParams.delete('booking');
  history.replaceState(null, '', url.pathname + url.search + url.hash);
  openBooking();
}

