// Phần dùng chung cho thao tác ghi của ba không gian (giai đoạn 3–4): lỗi đặt cạnh ô, nút đang xử lý,
// đóng sheet rồi trả focus sau khi vẽ lại, bộ đếm ký tự.
import { esc, icon } from '../lib/html';

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
export const toast = (text: string, opts: { tone?: string; title?: string } = {}) => window.HC?.toast(text, opts);
export const sheet = (id: string) => document.getElementById(id) as HTMLDialogElement;
/** Đóng sheet; Promise xong khi sheet đóng hẳn, để focus đặt sau đó không bị closeSheet ghi đè. */
export const close = (id: string) => window.HC.closeSheet(sheet(id));

/** Sau khi vẽ lại, nút vừa bấm đã bị thay: đưa focus tới phần tử đầu tiên tìm thấy trong giao diện mới. */
export function refocus(...selectors: string[]) {
  for (const sel of selectors) {
    const el = $<HTMLElement>(sel);
    if (!el) continue;
    if (!el.matches('a[href], button, input, select, textarea, [tabindex]')) el.tabIndex = -1;
    el.focus();
    return;
  }
}

/** Lỗi đặt ngay dưới ô (hoặc cuối nhóm `fieldset.hc-field`), nối aria-describedby; message null = gỡ lỗi. */
export function setError(field: HTMLElement, message: string | null) {
  const id = field.id;
  const group = field.tagName === 'FIELDSET';
  let box = document.getElementById(`${id}-error`);
  if (!message) {
    field.removeAttribute('aria-invalid');
    box?.remove();
    const rest = (field.getAttribute('aria-describedby') || '').split(' ').filter(x => x && x !== `${id}-error`);
    if (rest.length) field.setAttribute('aria-describedby', rest.join(' ')); else field.removeAttribute('aria-describedby');
    return;
  }
  if (!box) {
    box = document.createElement('span');
    box.className = 'hc-error';
    box.id = `${id}-error`;
    (group ? field : field.closest('.hc-field') || field.parentElement)!.appendChild(box);
  }
  box.innerHTML = `${icon('alert')}${esc(message)}`;
  // aria-invalid không dùng cho nhóm (fieldset); nhóm chỉ nối câu lỗi qua aria-describedby
  if (!group) field.setAttribute('aria-invalid', 'true');
  const described = new Set((field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
  described.add(`${id}-error`);
  field.setAttribute('aria-describedby', [...described].join(' '));
}

/** Gỡ mọi lỗi đang hiện trong biểu mẫu. */
export function clearErrors(form: HTMLElement) {
  form.querySelectorAll<HTMLElement>('[aria-describedby*="-error"], [aria-invalid]').forEach(f => setError(f, null));
  formError(form, null);
}

/** Lỗi chung của biểu mẫu (mạng, quyền…), đặt cuối biểu mẫu trong [data-form-error]. */
export function formError(form: HTMLElement, message: string | null) {
  const box = $<HTMLElement>('[data-form-error]', form);
  if (!box) return;
  box.hidden = !message;
  box.textContent = message || '';
}

export function busy(button: HTMLButtonElement | null, on: boolean) {
  if (!button) return;
  button.disabled = on;
  if (on) button.setAttribute('aria-busy', 'true'); else button.removeAttribute('aria-busy');
}

/** Cập nhật bộ đếm [data-counter-for] của mọi textarea có maxlength trong root (gọi sau khi reset/điền sẵn). */
export function syncCounters(root: ParentNode) {
  root.querySelectorAll<HTMLTextAreaElement>('textarea[maxlength]').forEach(t => {
    const counter = document.querySelector<HTMLElement>(`[data-counter-for="${t.id}"]`);
    if (counter) counter.textContent = `${t.value.length}/${t.maxLength}`;
  });
}

// Đếm ký tự khi gõ; sửa ô đang báo lỗi thì gỡ lỗi của ô đó (hoặc của nhóm chứa nó)
function onEdit(e: Event) {
  const t = e.target as HTMLElement;
  if (t.matches?.('textarea[maxlength]')) syncCounters(t.parentElement || document);
  if (t.getAttribute?.('aria-invalid')) setError(t, null);
  const group = t.closest?.<HTMLElement>('fieldset[aria-describedby*="-error"]');
  if (group) setError(group, null);
}
document.addEventListener('input', onEdit);
document.addEventListener('change', onEdit);
