(() => {
  const config = window.HOMACARE_CONFIG || {};
  const callbackParams = new URLSearchParams(location.hash.slice(1));
  const callbackError = callbackParams.get('error_code') || callbackParams.get('error') || new URLSearchParams(location.search).get('error');
  if (!document.querySelector('#account-form') && (callbackParams.has('access_token') || callbackError || new URLSearchParams(location.search).has('code'))) {
    const target = new URL('auth.html', location.href); target.search = location.search; target.hash = location.hash;
    location.replace(target.href); return;
  }
  function publicKey(value) {
    if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(value || '')) return true;
    try { return JSON.parse(atob(value.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).role === 'anon'; } catch { return false; }
  }
  const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(config.supabaseUrl || '') && publicKey(config.supabasePublishableKey);
  const client = configured && window.supabase ? window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
  const destinations = { family: 'family.html', caregiver: 'caregiver.html', coordinator: 'coordinator.html' };
  const labels = { family: 'Gia đình', caregiver: 'Chuyên viên chăm sóc', coordinator: 'Điều phối viên' };
  function failure(error) {
    const text = String(error?.message || '');
    if (/Invalid login credentials/i.test(text)) return 'Email hoặc mật khẩu chưa đúng. Vui lòng kiểm tra lại.';
    if (/Email not confirmed/i.test(text)) return 'Bạn cần xác nhận email trước khi đăng nhập.';
    if (/email address not authorized|email_address_not_authorized/i.test(text)) return 'HomaCare chưa gửi được email xác nhận đến địa chỉ này. Vui lòng liên hệ đội ngũ HomaCare để được hỗ trợ.';
    if (/already registered|already been registered/i.test(text)) return 'Email này đã có tài khoản. Bạn có thể đăng nhập hoặc lấy lại mật khẩu.';
    if (/rate limit|too many requests|over_email_send_rate_limit/i.test(text)) return 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.';
    if (/fetch|network/i.test(text)) return 'Chưa kết nối được. Bạn kiểm tra mạng rồi thử lại nhé.';
    if (/password/i.test(text)) return 'Mật khẩu chưa đáp ứng yêu cầu. Hãy dùng ít nhất 8 ký tự.';
    return 'Chưa thực hiện được thao tác này. Vui lòng thử lại sau.';
  }
  async function profile() {
    if (!client) throw new Error('Hệ thống tài khoản đang được chuẩn bị. Vui lòng quay lại sau.');
    const { data: { user }, error } = await client.auth.getUser();
    if (error) {
      if (error.name === 'AuthSessionMissingError' || error.status === 401 || error.status === 403) return null;
      throw new Error(failure(error));
    }
    if (!user) return null;
    const result = await client.from('profiles').select('id,full_name,role').eq('id', user.id).single();
    if (result.error) throw new Error('Chưa tải được hồ sơ tài khoản. Vui lòng thử lại.');
    return result.data;
  }
  function go(role, booking = false) { location.assign(destinations[role] + (role === 'family' && booking ? '?booking=1' : '')); }
  async function logout() {
    if (client) { const { error } = await client.auth.signOut(); if (error) throw new Error(failure(error)); }
    location.assign('index.html');
  }
  window.HomaAuth = { client, configured: !!client, config, profile, go, logout, failure, destinations, labels };
  const homeAccounts = [...document.querySelectorAll('[data-home-account]')];
  if (homeAccounts.length) {
    const entryLinks = [...document.querySelectorAll('[data-modal="role-modal"]')].filter(link => !link.closest('[data-home-account]')).map(link => ({ link, href: link.getAttribute('href') }));
    const homeLabels = { family: 'Không gian gia đình', caregiver: 'Ca chăm sóc của tôi', coordinator: 'Không gian điều phối' };
    let revision = 0;
    function renderHomeAccount(current) {
      homeAccounts.forEach(container => {
        const desktop = container.dataset.homeAccount === 'desktop';
        container.innerHTML = current
          ? `<a class="${desktop ? 'btn small' : ''}" href="${destinations[current.role]}">${homeLabels[current.role]} <span data-icon="arrow"></span></a><button class="plain-link" data-home-logout>Đăng xuất</button>`
          : `<a class="${desktop ? 'btn small' : ''}" href="auth.html?role=family" data-modal="role-modal">Đăng nhập / Đăng ký <span data-icon="arrow"></span></a>`;
        window.HomaUI.icons(container);
      });
      entryLinks.forEach(({link, href}) => {
        link.setAttribute('href', current ? destinations[current.role] : href);
        if (current) link.removeAttribute('data-modal'); else link.setAttribute('data-modal', 'role-modal');
      });
    }
    async function refreshHomeAccount() {
      const request = ++revision;
      try {
        const current = client ? await profile() : null;
        if (request === revision) renderHomeAccount(current);
      } catch {
        if (request !== revision) return;
        homeAccounts.forEach(container => { container.innerHTML = '<button class="plain-link" data-home-retry>Kết nối lại tài khoản</button>'; });
      }
    }
    document.addEventListener('click', async event => {
      if (event.target.closest('[data-home-retry]')) refreshHomeAccount();
      const button = event.target.closest('[data-home-logout]');
      if (!button) return;
      button.disabled = true;
      try { await logout(); } catch (error) { window.HomaUI.notify(error.message); button.disabled = false; }
    });
    refreshHomeAccount();
    client?.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_OUT') { revision++; renderHomeAccount(null); }
      else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') setTimeout(refreshHomeAccount, 0);
    });
  }
  const form = document.querySelector('#account-form');
  if (!form) return;
  const params = new URLSearchParams(location.search);
  const role = ['family', 'caregiver', 'coordinator'].includes(params.get('role')) ? params.get('role') : 'family';
  let mode = params.get('mode') === 'recovery' ? 'recovery' : role !== 'coordinator' && params.get('mode') === 'signup' ? 'signup' : 'login';
  const message = document.querySelector('#auth-message');
  let busy = false, recoverySession = false;
  function announce(text, success = false) { message.textContent = text; message.className = 'form-message show' + (success ? ' success' : ''); }
  function render() {
    message.className = 'form-message'; message.textContent = '';
    document.querySelectorAll('[data-auth-field="name"],[data-auth-field="confirmation"]').forEach(el => el.hidden = mode !== 'signup' && !(mode === 'recovery' && el.dataset.authField === 'confirmation'));
    const emailVisible = mode !== 'recovery';
    document.querySelector('[data-auth-field="email"]').hidden = !emailVisible;
    document.querySelector('#account-email').required = emailVisible;
    document.querySelector('#account-name').required = mode === 'signup';
    document.querySelector('#account-confirmation').required = mode === 'signup' || mode === 'recovery';
    document.querySelector('[data-auth-field="password"]').hidden = mode === 'forgot';
    document.querySelector('#account-password').required = mode !== 'forgot';
    document.querySelector('#account-password').minLength = mode === 'login' ? 1 : 8;
    document.querySelector('#account-password').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
    document.querySelector('#account-confirmation').minLength = 8;
    document.querySelectorAll('[data-auth-field]').forEach(field => field.querySelectorAll('input').forEach(input => input.disabled = field.hidden));
    document.querySelector('#auth-role-label').textContent = labels[role];
    const headings = { signup: 'Bắt đầu sự đồng hành.', login: role === 'coordinator' ? 'Chào người kết nối.' : 'Chào mừng bạn trở lại.', forgot: 'Lấy lại mật khẩu.', recovery: 'Đặt mật khẩu mới.' };
    const descriptions = { signup: role === 'family' ? 'Tạo tài khoản để sắp xếp chăm sóc và theo dõi nhật ký của người thân.' : 'Tạo tài khoản để nhận lịch chăm sóc và ghi lại từng buổi đồng hành.', login: role === 'coordinator' ? 'Đăng nhập bằng email và mật khẩu của tài khoản điều phối được cấp.' : 'Đăng nhập để tiếp tục hành trình chăm sóc của bạn.', forgot: 'Chúng tôi sẽ gửi đường dẫn đặt lại mật khẩu đến email của bạn.', recovery: 'Chọn mật khẩu mới gồm ít nhất 8 ký tự.' };
    document.querySelector('#auth-title').textContent = headings[mode];
    document.querySelector('#auth-description').textContent = descriptions[mode];
    document.querySelector('#auth-submit').textContent = { signup: 'Tạo tài khoản', login: 'Đăng nhập', forgot: 'Gửi email khôi phục', recovery: 'Lưu mật khẩu mới' }[mode];
    document.querySelector('#auth-tabs').hidden = role === 'coordinator' || mode === 'forgot' || mode === 'recovery';
    document.querySelector('#forgot-password').hidden = mode !== 'login';
    document.querySelector('#auth-back-login').hidden = mode !== 'forgot';
    document.querySelectorAll('[data-auth-mode]').forEach(el => { const active = el.dataset.authMode === mode; el.classList.toggle('active', active); el.setAttribute('aria-selected', String(active)); });
  }
  document.querySelectorAll('[data-auth-mode]').forEach(button => button.addEventListener('click', () => { if (busy) return; mode = button.dataset.authMode; render(); }));
  document.querySelector('#forgot-password').addEventListener('click', () => { if (!busy) { mode = 'forgot'; render(); } });
  document.querySelector('#auth-back-login').addEventListener('click', () => { mode = 'login'; render(); });
  document.querySelector('#toggle-password').addEventListener('click', e => { const input = document.querySelector('#account-password'); const show = input.type === 'password'; input.type = show ? 'text' : 'password'; e.currentTarget.textContent = show ? 'Ẩn' : 'Hiện'; e.currentTarget.setAttribute('aria-label', show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'); });
  form.addEventListener('submit', async e => {
    e.preventDefault(); if (busy) return;
    if (!client) return announce('Hệ thống tài khoản đang được chuẩn bị. Vui lòng quay lại sau.');
    const email = document.querySelector('#account-email').value.trim();
    const password = document.querySelector('#account-password').value;
    const name = document.querySelector('#account-name').value.trim();
    if ((mode === 'signup' || mode === 'recovery') && password !== document.querySelector('#account-confirmation').value) return announce('Hai mật khẩu chưa khớp nhau.');
    if (mode === 'signup' && name.length < 2) return announce('Bạn nhập họ và tên để chúng tôi xưng hô nhé.');
    busy = true; const button = document.querySelector('#auth-submit'); button.disabled = true; button.textContent = 'Đang xử lý…';
    try {
      const base = new URL('auth.html', config.siteUrl || location.origin + '/').href;
      if (mode === 'forgot') {
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: base + '?role=' + role + '&mode=recovery' });
        if (error) throw error;
        announce('Nếu email này có tài khoản, bạn sẽ nhận được đường dẫn khôi phục. Hãy kiểm tra cả thư mục thư rác.', true);
      } else if (mode === 'recovery') {
        if (!recoverySession) throw new Error('recovery_invalid');
        const { error } = await client.auth.updateUser({ password }); if (error) throw error;
        const current = await profile(); if (current) go(current.role);
      } else {
        const result = mode === 'signup' ? await client.auth.signUp({ email, password, options: { data: { full_name: name, role }, emailRedirectTo: base + '?role=' + role } }) : await client.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
        if (mode === 'signup' && (!result.data.session || !result.data.user?.identities?.length)) {
          form.reset(); announce('Kiểm tra email để xác nhận tài khoản. Nếu bạn đã đăng ký trước đó, hãy chuyển sang Đăng nhập.', true); return;
        }
        const current = await profile();
        if (!current) { announce('Chưa tải được hồ sơ tài khoản. Vui lòng thử lại.'); return; }
        go(current.role, params.get('booking') === '1');
      }
    } catch (error) { announce(error.message === 'recovery_invalid' ? 'Đường dẫn khôi phục chưa hợp lệ hoặc đã hết hạn. Hãy yêu cầu một email mới.' : failure(error)); }
    finally { busy = false; button.disabled = false; button.textContent = { signup: 'Tạo tài khoản', login: 'Đăng nhập', forgot: 'Gửi email khôi phục', recovery: 'Lưu mật khẩu mới' }[mode]; }
  });
  render();
  if (callbackError) announce('Link xác nhận đã hết hạn hoặc đã được sử dụng. Nếu bạn đã xác nhận email, hãy đăng nhập bằng email và mật khẩu.');
  if (client) {
    client.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY') { recoverySession = true; mode = 'recovery'; render(); } });
    client.auth.getSession().then(async ({ data, error }) => {
      if (callbackError) return;
      if (error) { announce(failure(error)); return; }
      if (mode === 'recovery') { recoverySession = !!data.session; return; }
      if (data.session) { try { const current = await profile(); if (current) go(current.role, params.get('booking') === '1'); } catch (error) { announce(error.message); } }
    }).catch(error => announce(failure(error)));
  }
})();
