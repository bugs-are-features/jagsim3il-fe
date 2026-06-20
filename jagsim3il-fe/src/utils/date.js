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
