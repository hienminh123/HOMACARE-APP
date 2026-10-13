/* ==========================================================================
   HomaCare Components · hành vi · v1.0
   JavaScript thuần, không phụ thuộc thư viện. Nạp bằng <script src="ds/components.js" defer>.
   Tự gắn cho phần tử có sẵn khi trang tải; phần tử thêm sau thì gọi HC.init(vùng).
   Đặt trong window.HC:
     HC.STATUS              nhãn 4 trạng thái theo giá trị trong database
     HC.pill(status)        chuỗi HTML StatusPill
     HC.timeline(status, times?)  chuỗi HTML StatusTimeline 4 bước
     HC.toast(text, opts?)  hiện thông báo ngắn
     HC.openSheet(id) / HC.closeSheet(dialog)
     HC.init(root?)         gắn hành vi cho tabs, sheet, rating, header
   ========================================================================== */
(() => {
  'use strict';

  const ICONS = (document.currentScript && document.currentScript.dataset.icons) || 'ds/icons.svg';
  const icon = (id, cls = 'hc-icon') => `<svg class="${cls}" aria-hidden="true"><use href="${ICONS}#${id}"/></svg>`;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Trạng thái ca ---------- */
  const STATUS = {
    pending:     { label: 'Chờ phân công', icon: 'hourglass' },
    assigned:    { label: 'Đã phân công',  icon: 'user-check' },
    in_progress: { label: 'Đang chăm sóc', icon: null },        // dùng chấm nhịp
    completed:   { label: 'Hoàn thành',    icon: 'check-circle' }
  };
  const ORDER = ['pending', 'assigned', 'in_progress', 'completed'];

  function pill(status, { size } = {}) {
    const s = STATUS[status];
    if (!s) return '';
    const lead = s.icon ? icon(s.icon) : '<span class="hc-live" aria-hidden="true"></span>';
    return `<span class="hc-pill${size === 'sm' ? ' hc-pill--sm' : ''}" data-status="${status}">${lead}${s.label}</span>`;
  }

  /** times: { pending: '20:14 · 12/10', assigned: '…' } — tùy chọn, hiện dưới nhãn */
  function timeline(status, { times = {}, vertical = false, label = 'Tiến trình ca' } = {}) {
    const at = ORDER.indexOf(status);
    const steps = ORDER.map((key, i) => {
      const state = i < at ? 'is-done' : i === at ? 'is-current' : '';
      const finished = i < at || (i === at && key === 'completed');
      const node = finished ? icon('check') : '';
      const meta = times[key] ? `<span class="hc-timeline__meta">${esc(times[key])}</span>` : '';
      return `<li class="hc-timeline__step ${state}"${i === at ? ' aria-current="step"' : ''}><span class="hc-timeline__node">${node}</span><span class="hc-timeline__label">${STATUS[key].label}</span>${meta}</li>`;
    }).join('');
    return `<ol class="hc-timeline${vertical ? ' hc-timeline--vertical' : ''}" aria-label="${esc(label)}">${steps}</ol>`;
  }

  /* ---------- Toast ---------- */
  const TOAST_ICON = { success: 'check-circle', info: 'info', warning: 'alert', danger: 'alert' };
  function region() {
    let r = document.querySelector('.hc-toast-region');
    if (!r) {
      r = document.createElement('div');
      r.className = 'hc-toast-region';
      r.setAttribute('role', 'status');
      r.setAttribute('aria-live', 'polite');
      document.body.appendChild(r);
    }
    return r;
  }
  function toast(text, { tone = 'info', title = '', duration = 4500 } = {}) {
    const el = document.createElement('div');
    el.className = 'hc-toast';
    el.dataset.tone = tone;
    el.innerHTML = `${icon(TOAST_ICON[tone] || 'info')}<div class="hc-toast__text">${title ? `<strong>${esc(title)}</strong>` : ''}${esc(text)}</div>
      <button class="hc-toast__close" type="button" aria-label="Đóng thông báo">${icon('x')}</button>`;
    const r = region();
    r.appendChild(el);
    while (r.children.length > 3) r.firstElementChild.remove();
    let timer;
    const leave = () => {
      clearTimeout(timer);
      if (el.classList.contains('is-leaving')) return;
      el.classList.add('is-leaving');
      const done = () => el.remove();
      el.addEventListener('animationend', done, { once: true });
      setTimeout(done, 400);
    };
    const arm = () => { if (duration > 0) timer = setTimeout(leave, duration); };
    el.querySelector('.hc-toast__close').addEventListener('click', leave);
    el.addEventListener('pointerenter', () => clearTimeout(timer));
    el.addEventListener('pointerleave', arm);
    el.addEventListener('focusin', () => clearTimeout(timer));
    arm();
    return { close: leave };
  }

  /* ---------- Sheet / Modal ---------- */
  function openSheet(id, opener) {
    const d = typeof id === 'string' ? document.getElementById(id) : id;
    if (!d || d.open) return;
    d._opener = opener || document.activeElement;
    d.classList.remove('is-closing');
    d.showModal();
  }
  function closeSheet(d, value) {
    if (!d || !d.open || d.classList.contains('is-closing')) return;
    const finish = () => {
      d.classList.remove('is-closing');
      d.close(value);
      if (d._opener && document.contains(d._opener)) d._opener.focus();
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return finish();
    d.classList.add('is-closing');
    d.addEventListener('animationend', finish, { once: true });
    setTimeout(() => d.open && finish(), 450);
  }
  function initSheet(d) {
    if (d._hc) return; d._hc = true;
    d.addEventListener('cancel', e => { e.preventDefault(); closeSheet(d); });          // phím Esc
    d.addEventListener('click', e => { if (e.target === d) closeSheet(d); });            // chạm nền tối
    d.querySelectorAll('[data-hc-close]').forEach(b => b.addEventListener('click', () => closeSheet(d, b.value)));
  }

  /* ---------- Tabs ---------- */
  function initTabs(list) {
    if (list._hc) return; list._hc = true;
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = t.getAttribute('aria-controls') && document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      list.dispatchEvent(new CustomEvent('hc:tabchange', { bubbles: true, detail: { tab, value: tab.dataset.value } }));
    };
    tabs.forEach(t => {
      t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1;
      t.addEventListener('click', () => select(t));
    });
    list.addEventListener('keydown', e => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in map)) return;
      e.preventDefault();
      select(tabs[(map[e.key] + tabs.length) % tabs.length], true);
    });
  }

  /* ---------- Đánh giá sao ---------- */
  function initRating(group) {
    if (group._hc || group.hasAttribute('data-readonly')) return; group._hc = true;
    const stars = [...group.querySelectorAll('.hc-rating__star')];
    const out = group.querySelector('.hc-rating__value');
    const paint = n => stars.forEach((s, i) => s.classList.toggle('is-on', i < n));
    const set = (n, focus) => {
      group.dataset.value = n;
      stars.forEach((s, i) => { s.setAttribute('aria-checked', String(i + 1 === n)); s.tabIndex = i + 1 === (n || 1) ? 0 : -1; });
      paint(n);
      if (out) out.textContent = n ? `${n}/5` : '';
      if (focus) stars[n - 1].focus();
      group.dispatchEvent(new CustomEvent('hc:rate', { bubbles: true, detail: { value: n } }));
    };
    const current = () => Number(group.dataset.value || 0);
    stars.forEach((s, i) => {
      s.setAttribute('role', 'radio');
      s.addEventListener('click', () => set(i + 1));
      s.addEventListener('pointerenter', () => paint(i + 1));
    });
    group.addEventListener('pointerleave', () => paint(current()));
    group.addEventListener('keydown', e => {
      const n = current() || 0;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(Math.min(5, n + 1), true); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(Math.max(1, n - 1), true); }
    });
    set(current());
  }

  /* ---------- Header: viền khi cuộn ---------- */
  function initHeader(h) {
    if (h._hc) return; h._hc = true;
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;pointer-events:none';
    document.body.prepend(sentinel);
    new IntersectionObserver(([e]) => h.classList.toggle('is-scrolled', !e.isIntersecting)).observe(sentinel);
  }

  function init(root = document) {
    root.querySelectorAll('dialog.hc-sheet').forEach(initSheet);
    root.querySelectorAll('.hc-tabs[role="tablist"]').forEach(initTabs);
    root.querySelectorAll('.hc-rating').forEach(initRating);
    root.querySelectorAll('.hc-header[data-hc-sticky]').forEach(initHeader);
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-hc-open]');
    if (b) { e.preventDefault(); openSheet(b.getAttribute('data-hc-open'), b); }
  });

  window.HC = { STATUS, ORDER, icon, pill, timeline, toast, openSheet, closeSheet, init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();
})();
