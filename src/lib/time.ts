/** epoch ms → "오후 2:30" 형태 */
export function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** epoch ms → "7월 14일 (월) 오후 2:30" 형태 */
export function formatDateTime(ms: number): string {
  const d = new Date(ms);
  const date = d.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
  return `${date} ${formatClock(ms)}`;
}

/** 남은 밀리초 → { h, m, s, total } */
export function breakdown(remainMs: number) {
  const total = Math.max(0, remainMs);
  const totalSec = Math.floor(total / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { h, m, s, totalSec, totalMin: Math.floor(totalSec / 60) };
}

/** 분 단위를 "1시간 20분" / "25분"으로 */
export function formatDuration(min: number): string {
  const m = Math.max(0, Math.round(min));
  if (m < 60) return `${m}분`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h}시간` : `${h}시간 ${rem}분`;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** 카운트다운 표시용 mm:ss 또는 h:mm:ss */
export function formatCountdown(remainMs: number): string {
  const { h, m, s } = breakdown(remainMs);
  if (h > 0) return `${h}:${pad2(m)}:${pad2(s)}`;
  return `${pad2(m)}:${pad2(s)}`;
}

/** 카운트다운 표시용: 하루(24시간) 이상 남았으면 일단위("3일"), 아니면 h:mm:ss */
export function formatRemain(remainMs: number): string {
  const days = Math.floor(Math.abs(remainMs) / (24 * 60 * 60 * 1000));
  if (days >= 1) return `${days}일`;
  return formatCountdown(remainMs);
}

/** 로컬 datetime-input 값("2026-07-14T14:30") → epoch ms */
export function localInputToMs(value: string): number {
  return new Date(value).getTime();
}

/** epoch ms → 로컬 datetime-input 값("2026-07-14T14:30") */
export function msToLocalInput(ms: number): string {
  const d = new Date(ms);
  const off = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

/** 기본 datetime-input 값: 지금부터 2시간 뒤, 분은 0으로 반올림 */
export function defaultAppointmentInput(): string {
  const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  const off = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

/** epoch ms → 로컬 날짜 키 "YYYY-MM-DD" (캘린더 표시/그룹핑용) */
export function dateKey(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** epoch ms → "7월 14일 (월)" (요일 포함 짧은 날짜) */
export function formatDateShort(ms: number): string {
  return new Date(ms).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}
