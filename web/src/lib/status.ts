// Bốn trạng thái ca, đặt tên theo đúng giá trị cột visits.status trong database.
// Dùng chung cho component .astro (StatusPill, StatusTimeline) và phần app dựng HTML phía trình duyệt.
import { esc, icon } from './html';

export type VisitStatus = 'pending' | 'assigned' | 'in_progress' | 'completed';

export const STATUS: Record<VisitStatus, { label: string; icon: string | null }> = {
  pending: { label: 'Chờ phân công', icon: 'hourglass' },
  assigned: { label: 'Đã phân công', icon: 'user-check' },
  in_progress: { label: 'Đang chăm sóc', icon: null }, // dùng chấm nhịp .hc-live
  completed: { label: 'Hoàn thành', icon: 'check-circle' },
};

export const ORDER: VisitStatus[] = ['pending', 'assigned', 'in_progress', 'completed'];

export const isStatus = (value: unknown): value is VisitStatus => ORDER.includes(value as VisitStatus);

export type TimelineTimes = Partial<Record<VisitStatus, string>>;

/** Trạng thái của từng bước trên timeline: đã qua, hiện tại, hay chưa tới. */
export function timelineSteps(status: VisitStatus) {
  const at = ORDER.indexOf(status);
  return ORDER.map((key, i) => ({
    key,
    label: STATUS[key].label,
    state: i < at ? 'is-done' : i === at ? 'is-current' : '',
    current: i === at,
    finished: i < at || (i === at && key === 'completed'),
  }));
}

/** Chuỗi HTML StatusPill, giống HC.pill() của preview/ds/components.js. */
export function pill(status: VisitStatus, { size }: { size?: 'sm' } = {}): string {
  const s = STATUS[status];
  if (!s) return '';
  const lead = s.icon ? icon(s.icon) : '<span class="hc-live" aria-hidden="true"></span>';
  return `<span class="hc-pill${size === 'sm' ? ' hc-pill--sm' : ''}" data-status="${status}">${lead}${s.label}</span>`;
}

/** Chuỗi HTML StatusTimeline 4 bước, giống HC.timeline(). */
export function timeline(
  status: VisitStatus,
  { times = {}, vertical = false, label = 'Tiến trình ca' }: { times?: TimelineTimes; vertical?: boolean; label?: string } = {},
): string {
  const steps = timelineSteps(status).map(step => {
    const meta = times[step.key] ? `<span class="hc-timeline__meta">${esc(times[step.key])}</span>` : '';
    return `<li class="hc-timeline__step ${step.state}"${step.current ? ' aria-current="step"' : ''}><span class="hc-timeline__node">${step.finished ? icon('check') : ''}</span><span class="hc-timeline__label">${step.label}</span>${meta}</li>`;
  }).join('');
  return `<ol class="hc-timeline${vertical ? ' hc-timeline--vertical' : ''}" aria-label="${esc(label)}">${steps}</ol>`;
}
