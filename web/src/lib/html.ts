// Tiện ích dựng HTML phía trình duyệt. Mọi dữ liệu người dùng phải qua esc().

export const ICON_SPRITE = '/icons.svg';

export const esc = (value: unknown): string =>
  String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const icon = (id: string, cls = 'hc-icon'): string =>
  `<svg class="${cls}" aria-hidden="true"><use href="${ICON_SPRITE}#${id}"/></svg>`;

/** Hai chữ cái đầu của hai từ cuối: "Trần Văn An" → "VA". */
export const initials = (name: string | null | undefined): string =>
  String(name || 'HC').trim().split(/\s+/).slice(-2).map(w => w[0]).join('').toUpperCase();
