// Thao tác của không gian chuyên viên (giai đoạn 4): bắt đầu ca, ghi nhật ký sau ca 2 bước rồi hoàn thành ca.
// Gọi start_homa_visit / complete_homa_visit qua src/lib/visits.ts; điều kiện (đúng chuyên viên, đúng trạng thái,
// đủ 4 hoạt động, nhật ký ≥ 10 ký tự) vẫn do RPC trong backend/schema.sql kiểm tra.
import type { Context } from './workspace';
import { careLog, person } from './render';
import { $, toast, close, refocus, setError, clearErrors, formError, busy, syncCounters } from './forms';
import { esc } from '../lib/html';
import { MOODS, PACKAGE, completeVisit, dayLabel, issue, relativeOf, startVisit, timeText, type Visit } from '../lib/visits';

let ctx: Context | null = null;
/** Mỗi lần vẽ lại không gian, trang gọi hàm này để thao tác dùng dữ liệu mới nhất. */
export function setContext(next: Context) { ctx = next; }

const findVisit = (id?: string) => ctx?.data.visits.find(v => v.id === id);
const who = (v: Visit) => relativeOf(v)?.full_name || 'người thân';

/* ---------- Bản nháp nhật ký: gõ trên điện thoại lỡ đóng sheet thì không mất ---------- */
interface Draft { tasks: boolean[]; mood: string; report_text: string; next_note: string }
const draftKey = (id: string) => `homa-report-draft-${id}`;
export function readDraft(id: string): Draft | null {
  try { const raw = localStorage.getItem(draftKey(id)); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
const saveDraft = (id: string, d: Draft) => { try { localStorage.setItem(draftKey(id), JSON.stringify(d)); } catch { /* bỏ qua */ } };
const dropDraft = (id: string) => { try { localStorage.removeItem(draftKey(id)); } catch { /* bỏ qua */ } };

/* ======================================================================
   Bắt đầu ca: xác nhận trong sheet vì không hoàn tác được
   ====================================================================== */
function openStart(v: Visit, opener: Element) {
  const sheet = $<HTMLDialogElement>('#start-sheet')!;
  sheet.dataset.visit = v.id;
  $('[data-start-body]', sheet)!.innerHTML = `
    ${person(who(v), `${dayLabel(v.care_date)} · ${PACKAGE.hours}`, 'relative', { boxed: true })}
    <p>Gia đình sẽ thấy trạng thái <strong>Đang chăm sóc</strong> ngay khi bạn bấm. Chỉ bắt đầu khi bạn đã đến nơi và gặp ${esc(who(v))}.</p>`;
  window.HC.openSheet('start-sheet', opener);
}

async function confirmStart(button: HTMLButtonElement) {
  const id = $<HTMLDialogElement>('#start-sheet')!.dataset.visit!;
  const v = findVisit(id);
  if (!ctx || !v) return;
  busy(button, true);
  try {
    await startVisit(ctx.client, id);
    await Promise.all([close('start-sheet'), ctx.reload()]);
    toast(`Khi xong ca, bấm "Ghi nhật ký" để gửi cho gia đình.`, { tone: 'success', title: `Đã bắt đầu ca với ${who(v)}` });
    refocus(`[data-visit="${CSS.escape(id)}"] [data-action="report"]`, `[data-visit="${CSS.escape(id)}"]`);
  } catch (error) {
    await Promise.all([close('start-sheet'), ctx.reload()]);
    toast(issue(error), { tone: 'danger' });
    refocus(`[data-visit="${CSS.escape(id)}"]`, '#open-title');
  } finally {
    busy(button, false);
  }
}

/* ======================================================================
   Nhật ký sau ca: bước 1 Ghi nhận → bước 2 Xem lại (đúng như gia đình sẽ thấy) → complete_homa_visit
   ====================================================================== */
const form = () => $<HTMLFormElement>('#report-form')!;

function readForm(): Draft {
  const f = form();
  return {
    tasks: [...f.querySelectorAll<HTMLInputElement>('[name="task"]')].map(i => i.checked),
    mood: f.querySelector<HTMLInputElement>('[name="mood"]:checked')?.value || MOODS[0],
    report_text: $<HTMLTextAreaElement>('#report-text', f)!.value,
    next_note: $<HTMLInputElement>('#report-next', f)!.value,
  };
}
function fillForm(d: Draft) {
  const f = form();
  f.querySelectorAll<HTMLInputElement>('[name="task"]').forEach((i, n) => { i.checked = !!d.tasks[n]; });
  f.querySelectorAll<HTMLInputElement>('[name="mood"]').forEach(i => { i.checked = i.value === d.mood; });
  $<HTMLTextAreaElement>('#report-text', f)!.value = d.report_text || '';
  $<HTMLInputElement>('#report-next', f)!.value = d.next_note || '';
  updateMoodHint();
}
function updateMoodHint() {
  const hint = $<HTMLElement>('[data-mood-hint]');
  if (hint) hint.hidden = readForm().mood !== MOODS[2];
}

function setStep(step: 'details' | 'review') {
  const f = form();
  const review = step === 'review';
  $<HTMLElement>('[data-step="details"]', f)!.hidden = review;
  $<HTMLElement>('[data-step="review"]', f)!.hidden = !review;
  $('#report-sheet-desc')!.textContent = review
    ? 'Bước 2 trên 2 · Gia đình sẽ thấy nhật ký đúng như dưới đây.'
    : 'Bước 1 trên 2 · Ghi lại buổi chăm sóc vừa xong.';
  $('[data-report-back]')!.textContent = review ? 'Quay lại sửa' : 'Để sau';
  $('[data-report-submit]')!.textContent = review ? 'Gửi nhật ký và hoàn thành ca' : 'Xem lại nhật ký';
  f.dataset.step = step;
  formError(f, null);
  $<HTMLElement>('.hc-sheet__body', $('#report-sheet')!)!.scrollTop = 0;
  if (review) $<HTMLElement>('[data-step="review"]', f)!.focus();
}

function openReport(v: Visit, opener: Element) {
  const f = form();
  f.reset();
  f.dataset.visit = v.id;
  clearErrors(f);
  const draft = readDraft(v.id);
  if (draft) fillForm(draft); else updateMoodHint();
  syncCounters(f);
  $('[data-report-who]')!.innerHTML = person(who(v),
    `${dayLabel(v.care_date)}${v.started_at ? ` · bắt đầu ${timeText(v.started_at).split(' · ')[0]}` : ''}`, 'relative', { boxed: true });
  $<HTMLElement>('[data-draft-note]')!.hidden = !draft;
  setStep('details');
  window.HC.openSheet('report-sheet', opener);
}

/** Kiểm tra bước 1; lỗi đặt cạnh ô, focus vào chỗ lỗi đầu tiên. */
function validate(d: Draft): boolean {
  const f = form();
  const tasksBox = $<HTMLElement>('#report-tasks', f)!;
  const text = $<HTMLTextAreaElement>('#report-text', f)!;
  const tasksOk = d.tasks.every(Boolean);
  const textOk = d.report_text.trim().length >= 10;
  setError(tasksBox, tasksOk ? null : 'Bạn cần đánh dấu đủ 4 hoạt động. Hoạt động nào chưa làm được, hãy gọi điều phối viên trước khi hoàn thành ca.');
  setError(text, textOk ? null : 'Nhật ký cần ít nhất 10 ký tự để gia đình hiểu buổi chăm sóc.');
  if (!tasksOk) tasksBox.querySelector<HTMLInputElement>('input:not(:checked)')?.focus();
  else if (!textOk) text.focus();
  return tasksOk && textOk;
}

document.addEventListener('input', e => {
  const f = (e.target as Element).closest?.<HTMLFormElement>('#report-form');
  if (!f?.dataset.visit) return;
  saveDraft(f.dataset.visit, readForm());
  if ((e.target as HTMLInputElement).name === 'mood') updateMoodHint();
});
document.addEventListener('change', e => {
  if ((e.target as HTMLInputElement).name === 'mood') updateMoodHint();
});
// Đóng sheet khi chưa gửi: thẻ ca báo "có bản nháp chưa gửi" mà không cần vẽ lại cả trang
document.getElementById('report-sheet')?.addEventListener('close', () => {
  const id = form().dataset.visit;
  const hint = id && readDraft(id) && $(`[data-visit="${CSS.escape(id)}"] [data-started]`);
  if (hint && !hint.textContent!.includes('bản nháp')) hint.textContent = hint.textContent!.replace(/\.$/, ' · có bản nháp chưa gửi.');
});

document.addEventListener('submit', async e => {
  const f = e.target as HTMLFormElement;
  if (f.id !== 'report-form' || !ctx) return;
  e.preventDefault();
  const id = f.dataset.visit!;
  const v = findVisit(id);
  const d = readForm();
  if (!v) return;

  if (f.dataset.step !== 'review') {
    if (!validate(d)) return;
    const preview = { ...v, status: 'completed' as const, tasks: d.tasks, mood: d.mood, report_text: d.report_text.trim(), next_note: d.next_note.trim(), completed_at: null, rating: null };
    $<HTMLElement>('[data-step="review"]', f)!.innerHTML = `${careLog(preview, { preview: true })}
      <p class="hc-hint">Gửi xong, nhật ký không sửa lại được trong app. Cần bổ sung thì gọi điều phối viên <a href="tel:0338031425">0338 031 425</a>.</p>`;
    setStep('review');
    return;
  }

  const button = $<HTMLButtonElement>('[data-report-submit]');
  busy(button, true);
  try {
    await completeVisit(ctx.client, id, d);
    dropDraft(id);
    await Promise.all([close('report-sheet'), ctx.reload()]);
    toast(`Gia đình đã nhận được nhật ký ca ${dayLabel(v.care_date)}.`, { tone: 'success', title: 'Đã hoàn thành ca' });
    refocus('#done-title');
  } catch (error) {
    const text = String((error as { message?: string })?.message);
    if (/incomplete_tasks|invalid_report/.test(text)) { setStep('details'); validate(d); }
    else formError(f, issue(error));
  } finally {
    busy(button, false);
  }
});

/* ======================================================================
   Nút trong trang
   ====================================================================== */
document.addEventListener('click', e => {
  const target = e.target as Element;
  if (target.closest('[data-report-back]')) {
    if (form().dataset.step === 'review') setStep('details'); else close('report-sheet');
    return;
  }
  if (target.closest('[data-start-confirm]')) { confirmStart(target.closest<HTMLButtonElement>('[data-start-confirm]')!); return; }
  const action = target.closest<HTMLElement>('[data-action]');
  if (!action || !ctx) return;
  const v = findVisit(action.closest<HTMLElement>('[data-visit]')?.dataset.visit || action.dataset.visit);
  if (!v) return;
  if (action.dataset.action === 'start') openStart(v, action);
  if (action.dataset.action === 'report') openReport(v, action);
  if (action.dataset.action === 'view-log') {
    $('[data-log-body]')!.innerHTML = careLog(v);
    window.HC.openSheet('log-sheet', action);
  }
});
