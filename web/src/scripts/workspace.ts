// Khởi động chung cho ba không gian (thay phần boot/load/render của preview/workspace.js):
// kiểm tra phiên → đúng vai trò → tải dữ liệu → gọi hàm vẽ của từng vai trò.
import type { SupabaseClient } from '@supabase/supabase-js';
import { forwardAuthCallback, go, loginUrl, logout, profile, type Profile, type Role } from '../lib/auth';
import { getClient } from '../lib/supabase';
import { loadWorkspace, issue, type Workspace } from '../lib/visits';
import { esc, icon } from '../lib/html';
import { DEMO_PATH, DEMO_ROLES, demoSlug, demoUrl, isDemo, resetDemoData, type DemoSlug } from '../lib/demo';
import { watch, same, changes, focusKey, restoreFocus } from './live';

export interface Context {
  client: SupabaseClient; profile: Profile; data: Workspace; view: HTMLElement;
  /** Tải lại dữ liệu và vẽ lại; trả về false nếu tải lỗi (đã báo bằng toast). */
  reload: () => Promise<boolean>;
}
export type Renderer = (ctx: Context) => string;
export interface BootOptions {
  /** Chạy một lần sau lần vẽ đầu tiên, ví dụ mở sẵn sheet đặt ca khi URL có ?booking=1. */
  ready?: (ctx: Context) => void;
}

declare global {
  interface Window {
    HC: {
      toast(text: string, opts?: { tone?: string; title?: string; duration?: number }): void;
      init(root?: ParentNode): void;
      openSheet(id: string | HTMLElement, opener?: Element | null): void;
      /** Xong khi sheet đã đóng hẳn (sau hiệu ứng) và focus đã trả về nút mở. */
      closeSheet(dialog: HTMLDialogElement | null, value?: string): Promise<void>;
    };
  }
}

function blocked(view: HTMLElement, title: string, text: string, action = '') {
  view.innerHTML = `<div class="hc-card hc-empty app-blocked"><span class="hc-empty__icon">${icon('shield')}</span><h1 class="hc-empty__title">${esc(title)}</h1><p class="hc-empty__text">${esc(text)}</p>${action}</div>`;
}

/** Thanh trên cùng khi đang ở chế độ demo: nói rõ dữ liệu minh họa, đổi vai trò bằng /demo/?vai-tro=… (mở được trong tab mới). */
function demoBar(role: Role): string {
  const now = demoSlug();
  const roles = (['gia-dinh', 'chuyen-vien', 'dieu-phoi'] as DemoSlug[]).map(slug => {
    const on = now === slug || (now === 'gia-dinh-moi' && slug === 'gia-dinh' && role === 'family');
    return `<a class="app-demo__role" href="${demoUrl(slug)}"${on ? ' aria-current="page"' : ''}>${DEMO_ROLES[slug].label}</a>`;
  }).join('');
  return `<section class="app-demo" aria-label="Chế độ demo">
    <p class="app-demo__text">${icon('info')}<span><strong>Chế độ demo.</strong> Dữ liệu minh họa, chỉ lưu trên trình duyệt này, không gửi cho HomaCare.</span></p>
    <nav class="app-demo__roles" aria-label="Xem với vai trò">${roles}</nav>
    <button class="hc-btn hc-btn--ghost hc-btn--sm app-demo__reset" type="button" data-demo-reset>${icon('refresh')}Đặt lại dữ liệu</button>
  </section>`;
}

/** Phần tài khoản dùng chung ở cuối mỗi không gian. */
export function accountSection(p: Profile, roleLabel: string): string {
  return `<section class="app-section" id="tai-khoan" aria-labelledby="tai-khoan-title">
    <div class="app-section__head"><h2 id="tai-khoan-title">Tài khoản</h2></div>
    <div class="hc-card hc-stack" style="--stack-gap:var(--space-4)">
      <div class="hc-person"><span class="hc-avatar hc-avatar--lg" data-role="${esc(p.role)}" aria-hidden="true">${esc(p.full_name.trim().split(/\s+/).slice(-2).map(w => w[0]).join('').toUpperCase())}</span><span class="hc-person__text"><span class="hc-person__name">${esc(p.full_name)}</span><span class="hc-person__role">${esc(roleLabel)}</span></span></div>
      <p class="hc-hint">Cần đổi lịch, hủy ca hoặc phản ánh vấn đề? Gọi <a href="tel:0338031425">0338 031 425</a> hoặc email <a href="mailto:homacare@gmail.com">homacare@gmail.com</a>.</p>
      <div class="hc-cluster"><a class="hc-btn hc-btn--secondary" href="/">${icon('home')}Về trang giới thiệu</a><button class="hc-btn hc-btn--ghost" type="button" data-action="sign-out">${icon('log-out')}${isDemo() ? 'Thoát chế độ demo' : 'Đăng xuất'}</button></div>
    </div>
  </section>`;
}

export async function boot(role: Role, render: Renderer, options: BootOptions = {}) {
  if (forwardAuthCallback()) return;
  const main = document.getElementById('workspace')!;
  const view = main.querySelector<HTMLElement>('[data-view]')!;
  const refresh = document.querySelector<HTMLButtonElement>('[data-action="refresh"]');
  const done = () => main.setAttribute('aria-busy', 'false');

  const client = await getClient();
  if (!client) {
    done();
    blocked(view, 'Không gian chăm sóc đang được chuẩn bị.', 'Bạn có thể trở lại trang chủ và tìm hiểu các dịch vụ của HomaCare.', '<a class="hc-btn" href="/">Về trang chủ</a>');
    return;
  }

  let current: Profile | null;
  try {
    current = await profile();
  } catch {
    done();
    blocked(view, 'Chưa tải được không gian chăm sóc.', 'Hãy kiểm tra kết nối rồi tải lại trang.', '<button class="hc-btn" type="button" onclick="location.reload()">Tải lại trang</button>');
    return;
  }
  const booking = new URLSearchParams(location.search).get('booking') === '1';
  // Tab demo mà chưa chọn vai trò (hoặc đã đặt lại): về trang /demo/ thay vì trang đăng nhập thật
  if (!current) { location.replace(isDemo() ? DEMO_PATH : loginUrl(role, booking ? { booking: '1' } : {})); return; }
  if (current.role !== role) { go(current.role, booking); return; }
  const me = current;

  if (isDemo()) main.insertAdjacentHTML('afterbegin', demoBar(role));

  let ctx: Context;
  let loadedAt = 0;
  /** initial: lần đầu (lỗi thì chặn trang) · refresh: nút Cập nhật (báo toast) · silent: sau khi ghi dữ liệu ·
   *  live: có thay đổi từ nơi khác (realtime, quay lại tab) — dữ liệu không đổi thì không vẽ lại */
  async function load(mode: 'initial' | 'refresh' | 'silent' | 'live' = 'initial'): Promise<boolean> {
    try {
      const data = await loadWorkspace(client!, role);
      loadedAt = Date.now();
      const before = mode === 'initial' ? null : ctx.data;
      if (mode === 'live' && before && same(before, data)) return true;
      const focused = focusKey(view);
      ctx = { client: client!, profile: me, data, view, reload: () => load('silent') };
      view.innerHTML = render(ctx);
      window.HC?.init(view);
      restoreFocus(view, focused);
      if (mode === 'refresh') window.HC?.toast('Đã cập nhật lịch chăm sóc.', { tone: 'success' });
      // Báo thay đổi do người khác tạo (điều phối phân công, chuyên viên gửi nhật ký…); thao tác của mình không sinh câu nào
      const notes = before ? changes(role, before, data) : [];
      if (notes.length > 2) window.HC?.toast(`${notes[0]} Và ${notes.length - 1} cập nhật khác.`, { tone: 'info', title: 'Có cập nhật mới' });
      else notes.forEach(text => window.HC?.toast(text, { tone: 'info', title: 'Có cập nhật mới' }));
      return true;
    } catch (error) {
      if (mode === 'initial') blocked(view, 'Chưa tải được không gian chăm sóc.', 'Hãy kiểm tra kết nối rồi bấm Cập nhật.');
      else if (mode === 'live') return false; // cập nhật nền lỗi (mất mạng): im lặng, lần sau thử lại
      else window.HC?.toast(issue(error), { tone: 'danger' });
      return false;
    } finally {
      done();
    }
  }

  if (await load()) options.ready?.(ctx!);
  watch(client, () => load('live'), () => loadedAt);
  if (refresh) {
    refresh.disabled = false;
    refresh.addEventListener('click', async () => {
      refresh.setAttribute('aria-busy', 'true');
      await load('refresh');
      refresh.removeAttribute('aria-busy');
    });
  }
  document.addEventListener('click', async e => {
    const button = (e.target as Element).closest<HTMLButtonElement>('[data-action="sign-out"]');
    if (!button) return;
    button.disabled = true;
    try { await logout(); } catch (error) { window.HC?.toast((error as Error).message, { tone: 'danger' }); button.disabled = false; }
  });
  client.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') location.replace(isDemo() ? DEMO_PATH : loginUrl(role)); });

  // Thanh demo: đổi vai trò (cùng dữ liệu minh họa), đặt lại dữ liệu
  document.addEventListener('click', e => {
    const reset = (e.target as Element).closest('[data-demo-reset]');
    if (!reset) return;
    resetDemoData();
    location.reload();
  });

  // BottomNav/Header: đánh dấu mục đang xem khi bấm liên kết trong trang
  document.querySelectorAll<HTMLAnchorElement>('.hc-bottomnav__item, .hc-header__nav a').forEach(link => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      document.querySelectorAll('.hc-bottomnav__item, .hc-header__nav a').forEach(l => {
        if (l.getAttribute('href') === href) l.setAttribute('aria-current', 'page'); else l.removeAttribute('aria-current');
      });
    });
  });
}
