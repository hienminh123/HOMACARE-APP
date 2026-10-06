const iconPaths={arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',check:'<path d="m5 12 4 4L19 6"/>',shield:'<path d="m12 3 8 4v5c0 5-8 9-8 9s-8-4-8-9V7l8-4Z"/><path d="m8 12 3 3 5-6"/>',home:'<path d="m3 10 9-7 9 7v10H3V10Z"/><path d="M9 20v-7h6v7"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-12 4h2m4 0h2m-8 3h2"/>',report:'<path d="M14 3H5v18h14V8l-5-5Z"/><path d="M14 3v5h5M8 12h8m-8 4h6"/>',users:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-16a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 5v2"/>',meal:'<path d="M5 3v6c0 3 4 3 4 0V3M7 3v18M19 3c-4 2-4 8 0 9v9M19 3v9"/>',walk:'<circle cx="14" cy="4" r="2"/><path d="m7 12 4-5 4 2 3 4m-7-6-1 7 4 3 1 5m-5-8-4 8"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-11 12h2"/>',book:'<path d="M12 5c-3-2-6-2-9-1v16c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v16"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',location:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',star:'<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z"/>',phone:'<path d="m5 3 4 5-2 3a16 16 0 0 0 6 6l3-2 5 4c-2 5-8 3-13-2S1 5 5 3Z"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/>'};
document.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[el.dataset.icon]||iconPaths.heart}</svg>`});
window.HomaUI = (() => {
  let toastTimer, previousFocus, activeOverlay;
  const toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role','status'); document.body.append(toast);
  function notify(text) { toast.textContent=text; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove('show'),4000); }
  function icons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => el.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[el.dataset.icon] || iconPaths.heart}</svg>`); }
  function open(id) { const modal=document.getElementById(id); if (!modal) return; previousFocus=document.activeElement; activeOverlay=modal; modal.classList.add('open'); document.body.classList.add('modal-open'); modal.querySelector('input:not([readonly]),select,button,a')?.focus(); }
  function close() { activeOverlay?.classList.remove('open'); activeOverlay=null; document.body.classList.remove('modal-open'); previousFocus?.focus(); }
  document.addEventListener('click', e => {
    const trigger=e.target.closest('[data-modal]'); if (trigger) { e.preventDefault(); open(trigger.dataset.modal); }
    if (e.target.closest('.close-modal') || e.target.classList.contains('modal-overlay')) close();
    const menu=e.target.closest('.mobile-menu-button'); if(menu) { const nav=document.querySelector('.nav-links'); const expanded=nav.classList.toggle('open'); menu.setAttribute('aria-expanded',String(expanded)); }
    if (e.target.closest('.nav-links a')) { document.querySelector('.nav-links')?.classList.remove('open'); document.querySelector('.mobile-menu-button')?.setAttribute('aria-expanded','false'); }
  });
  document.addEventListener('keydown', e => {
    if (!activeOverlay) return;
    if(e.key==='Escape') { e.preventDefault(); close(); }
    if(e.key==='Tab') { const options=[...activeOverlay.querySelectorAll('a,button,input,select,textarea')].filter(el=>!el.disabled && el.offsetParent!==null); const first=options[0],last=options.at(-1); if(e.shiftKey && document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()} }
  });
  return { notify, icons, open, close };
})();
