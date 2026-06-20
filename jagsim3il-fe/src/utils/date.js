// 날짜 포맷 유틸
const pad = (n) => String(n).padStart(2, '0');

// 2026-06-30 23:59
export function formatDateTime(value) {
  if (!value) return '';
  const d = new Date(value);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// 2026.06.30
export function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

// 종료까지 남은 일수 (음수면 종료됨)
export function daysLeft(endAt) {
  if (!endAt) return 0;
  const diff = new Date(endAt).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ── 백엔드 날짜/시간 포맷(YYMMDD / HHMM) 변환 ──
// Date → 'YYMMDD'
export function toApiDate(value) {
  const d = new Date(value);
  return `${pad(d.getFullYear() % 100)}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

// Date → 'HHMM'
export function toApiTime(value) {
  const d = new Date(value);
  return `${pad(d.getHours())}${pad(d.getMinutes())}`;
}

// 'YYMMDD' + 'HHMM' → Date (없으면 null)
export function fromApiDateTime(dt, tm) {
  if (!dt || dt.length < 6) return null;
  const year = 2000 + Number(dt.slice(0, 2));
  const month = Number(dt.slice(2, 4)) - 1;
  const day = Number(dt.slice(4, 6));
  let hour = 0;
  let min = 0;
  if (tm && tm.length >= 4) {
    hour = Number(tm.slice(0, 2));
    min = Number(tm.slice(2, 4));
  }
  return new Date(year, month, day, hour, min);
}
