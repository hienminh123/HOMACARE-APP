// Dựng HTML thành phần hc-* từ dữ liệu thật (phía trình duyệt). Cùng cấu trúc với component .astro
// (VisitCard, CareLogCard, VisitRow, EmptyState) để giao diện giống hệt trang tĩnh.
import { esc, icon, initials } from '../lib/html';
import { pill, timeline, type TimelineTimes } from '../lib/status';
import { PACKAGE, TASKS, caregiverOf, dayLabel, familyOf, relativeOf, timeText, type Relative, type Visit } from '../lib/visits';

export const empty = (iconName: string, title: string, text: string, compact = false) =>
  `<div class="hc-card hc-empty${compact ? ' hc-empty--compact' : ''}"><span class="hc-empty__icon">${icon(iconName)}</span><h3 class="hc-empty__title">${esc(title)}</h3><p class="hc-empty__text">${esc(text)}</p></div>`;

const person = (name: string, detail: string, role: string, { size = 'md', boxed = false } = {}) =>
  `<div class="hc-person${boxed ? ' hc-person--boxed' : ''}"><span class="hc-avatar hc-avatar--${size}" data-role="${role}" aria-hidden="true">${esc(initials(name))}</span><span class="hc-person__text"><span class="hc-person__name">${esc(name)}</span><span class="hc-person__role">${esc(detail)}</span></span></div>`;

const pendingPerson = () =>
  `<div class="hc-person hc-person--boxed"><span class="hc-avatar hc-avatar--md hc-avatar--pending" aria-hidden="true">${icon('hourglass')}</span><span class="hc-person__text"><span class="hc-person__name">Đang chờ điều phối viên</span><span class="hc-person__role">Tên chuyên viên hiện khi ca được phân công</span></span></div>`;

export const relativeName = (r: Relative | null) => (r ? `${r.relationship} · ${r.full_name}` : 'Người thân');

export function times(v: Visit): TimelineTimes {
  return {
    pending: v.created_at ? `Gửi ${timeText(v.created_at)}` : undefined,
    assigned: v.assigned_at ? `Phân công ${timeText(v.assigned_at)}` : undefined,
    in_progress: v.started_at ? `Bắt đầu ${timeText(v.started_at)}` : undefined,
    completed: v.completed_at ? `Gửi nhật ký ${timeText(v.completed_at)}` : undefined,
  };
}

/** VisitCard của gia đình: ngày + giờ → timeline → chuyên viên. */
export function familyVisit(v: Visit, label: string): string {
  const cg = caregiverOf(v);
  return `<article class="hc-card hc-visit" aria-label="Ca ${esc(dayLabel(v.care_date))}">
    <div class="hc-card__head"><span class="hc-card__label">${esc(label)}</span>${pill(v.status)}</div>
    <div class="hc-visit__when"><span class="hc-visit__date">${esc(dayLabel(v.care_date))}</span><span class="hc-visit__meta">${PACKAGE.hours} · Gói ${PACKAGE.name} · ${esc(relativeName(relativeOf(v)))}</span></div>
    ${timeline(v.status)}
    ${cg ? person(cg.full_name, 'Chuyên viên chăm sóc', 'caregiver', { boxed: true }) : pendingPerson()}
    ${v.care_note ? `<div class="hc-visit__note"><strong>Lưu ý gia đình gửi</strong>${esc(v.care_note)}</div>` : ''}
  </article>`;
}

/** VisitCard của chuyên viên: người thân → thói quen → lời nhắn gia đình. */
export function caregiverVisit(v: Visit, label: string): string {
  const r = relativeOf(v);
  return `<article class="hc-card hc-visit" aria-label="Ca ${esc(dayLabel(v.care_date))}">
    <div class="hc-card__head"><span class="hc-card__label">${esc(label)}</span>${pill(v.status)}</div>
    ${person(r?.full_name || 'Người thân', `${r?.age ? r.age + ' tuổi · ' : ''}${r?.area || ''}`, 'relative', { size: 'lg' })}
    <div class="hc-visit__when"><span class="hc-visit__date">${esc(dayLabel(v.care_date))}</span><span class="hc-visit__meta">${PACKAGE.hours} · ${PACKAGE.duration} · Gói ${PACKAGE.name}</span></div>
    <div class="hc-visit__note"><strong>Thói quen & mong muốn</strong>${esc(r?.preferences || 'Gia đình chưa ghi thói quen. Hãy hỏi người thân thích gì khi đến nơi.')}</div>
    ${v.care_note ? `<div class="hc-visit__note"><strong>Gia đình nhắn</strong>${esc(v.care_note)}</div>` : ''}
  </article>`;
}

/** CareLogCard: luôn đủ 4 hoạt động; đánh giá chỉ hiển thị (đánh giá mới làm ở giai đoạn 3). */
export function careLog(v: Visit): string {
  const cg = caregiverOf(v);
  const acts = TASKS.map((t, i) => {
    const done = v.tasks?.[i];
    return `<li class="hc-log__act${done ? '' : ' is-skipped'}"><span class="hc-log__act-icon">${icon(t.icon)}</span>${esc(t.label)}${done ? `<svg class="hc-icon hc-log__act-state" role="img" aria-label="Đã làm"><use href="/icons.svg#check"/></svg>` : '<span class="hc-log__act-state">Không thực hiện</span>'}</li>`;
  }).join('');
  const stars = [1, 2, 3, 4, 5].map(n => `<span class="hc-rating__star${n <= (v.rating || 0) ? ' is-on' : ''}">${icon('star')}</span>`).join('');
  const rating = v.rating
    ? `<div class="hc-rating" data-readonly><span class="hc-rating__label">Gia đình đã đánh giá</span><div class="hc-rating__stars" role="img" aria-label="${v.rating} trên 5 sao">${stars}</div></div>`
    : '<p class="hc-card__meta">Chưa đánh giá</p>';
  return `<article class="hc-card hc-log" aria-label="Nhật ký ca ${esc(dayLabel(v.care_date))}">
    <div class="hc-card__head"><span class="hc-card__label">Nhật ký sau ca · ${esc(dayLabel(v.care_date))}</span>${pill('completed')}</div>
    <ul class="hc-log__acts">${acts}</ul>
    ${v.report_text ? `<blockquote class="hc-log__note">${esc(v.report_text)}<footer>${esc(cg?.full_name || 'Chuyên viên')}${v.completed_at ? ` ghi lúc <time>${esc(timeText(v.completed_at))}</time>` : ''}</footer></blockquote>` : ''}
    ${v.mood ? `<p><strong>Ghi nhận chung:</strong> ${esc(v.mood)}</p>` : ''}
    ${v.next_note ? `<p class="hc-hint">Lần tới: ${esc(v.next_note)}</p>` : ''}
    ${rating}
  </article>`;
}

/** Hàng gọn cho điều phối. */
export function visitRow(v: Visit, action: string): string {
  const r = relativeOf(v), cg = caregiverOf(v), fam = familyOf(v);
  const detail = cg ? `Chuyên viên: ${cg.full_name}` : `Gia đình: ${fam?.full_name || ''}`;
  return `<div class="hc-visit-row"><div class="hc-visit-row__inner">
    ${person(r?.full_name || 'Người thân', detail, 'relative', { size: 'sm' }).replace('class="hc-person"', 'class="hc-person hc-visit-row__who"')}
    <div class="hc-visit-row__when"><strong>${esc(dayLabel(v.care_date))}</strong><span>${PACKAGE.hours}</span></div>
    ${pill(v.status)}
    ${action}
  </div></div>`;
}

export { person };
