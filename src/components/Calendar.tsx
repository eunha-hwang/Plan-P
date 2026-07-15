"use client";

import { useMemo, useState } from "react";
import { clsx } from "@/lib/clsx";
import { dateKey } from "@/lib/time";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 특정 날짜에 걸린 약속 상태 요약 (표시는 점 하나로 단순화) */
export type DayMark = {
  /** 예정된(미래) 약속이 있음 */
  upcoming: boolean;
  /** 지난 약속 중 지각이 있었음 */
  late: boolean;
  /** 지난 약속 중 정시/일찍 도착만 있었음 */
  ok: boolean;
};

function IconChevron({ dir }: { dir: "left" | "right" | "down" }) {
  const d =
    dir === "left" ? "M15 18l-6-6 6-6" : dir === "right" ? "M9 6l6 6-6 6" : "M6 9l6 6 6-6";
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowButton({
  dir,
  label,
  onClick,
}: {
  dir: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg"
    >
      <IconChevron dir={dir} />
    </button>
  );
}

export function Calendar({
  marks,
  selected,
  onSelect,
}: {
  marks: Record<string, DayMark>;
  selected: string | null;
  onSelect: (key: string | null) => void;
}) {
  const today = new Date();
  const todayKey = dateKey(today.getTime());
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [picking, setPicking] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => today.getFullYear());

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr: { date: Date; key: string }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      arr.push({ date, key: dateKey(date.getTime()) });
    }
    return { leading: firstDow, days: arr };
  }, [cursor]);

  const togglePicker = () => {
    if (!picking) setPickerYear(cursor.getFullYear());
    setPicking((p) => !p);
  };

  // 헤더의 화살표: 피커가 열려 있으면 '연도', 아니면 '월'을 이동한다.
  const goPrev = () =>
    picking
      ? setPickerYear((y) => y - 1)
      : setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  const goNext = () =>
    picking
      ? setPickerYear((y) => y + 1)
      : setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));

  return (
    <div className="card-elev rounded-3xl border border-border bg-surface p-4">
      {/* 헤더: 왼쪽 화살표 · 가운데 제목(클릭) · 오른쪽 화살표 */}
      <div className="mb-3 flex items-center justify-between px-1">
        <ArrowButton dir="left" label={picking ? "이전 해" : "이전 달"} onClick={goPrev} />
        <button
          type="button"
          onClick={togglePicker}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-bold text-fg transition hover:bg-surface-2"
        >
          {picking
            ? `${pickerYear}년`
            : `${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월`}
          <span className={clsx("text-muted transition", picking && "rotate-180")}>
            <IconChevron dir="down" />
          </span>
        </button>
        <ArrowButton dir="right" label={picking ? "다음 해" : "다음 달"} onClick={goNext} />
      </div>

      {picking ? (
        /* 월 빠른 선택 (연도는 헤더 화살표로 이동) */
        <div className="grid grid-cols-4 gap-2 px-1 pb-1">
          {Array.from({ length: 12 }).map((_, m) => {
            const isCur =
              pickerYear === cursor.getFullYear() && m === cursor.getMonth();
            const isThisMonth =
              pickerYear === today.getFullYear() && m === today.getMonth();
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setCursor(new Date(pickerYear, m, 1));
                  setPicking(false);
                }}
                className={clsx(
                  "rounded-xl py-3 text-sm transition",
                  isCur
                    ? "bg-brand font-bold text-brand-fg"
                    : isThisMonth
                      ? "font-semibold text-brand hover:bg-surface-2"
                      : "text-fg hover:bg-surface-2"
                )}
              >
                {m + 1}월
              </button>
            );
          })}
        </div>
      ) : (
        /* 날짜 그리드 */
        <div className="grid grid-cols-7">
          {WEEKDAYS.map((w) => (
            <span
              key={w}
              className="pb-2 text-center text-[11px] font-medium text-muted"
            >
              {w}
            </span>
          ))}

          {Array.from({ length: cells.leading }).map((_, i) => (
            <span key={`empty-${i}`} />
          ))}

          {cells.days.map(({ date, key }) => {
            const mark = marks[key];
            const isToday = key === todayKey;
            const isSelected = key === selected;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelect(isSelected ? null : key)}
                className="flex flex-col items-center gap-1 py-1"
              >
                <span
                  className={clsx(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm transition",
                    isSelected
                      ? "bg-brand font-bold text-brand-fg"
                      : isToday
                        ? "border border-brand font-semibold text-brand"
                        : "text-fg"
                  )}
                >
                  {date.getDate()}
                </span>
                <span className="flex h-1.5 items-center justify-center">
                  {mark && (
                    <span
                      className={clsx(
                        "h-1.5 w-1.5 rounded-full",
                        mark.late ? "bg-urgent" : mark.upcoming ? "bg-brand" : "bg-go"
                      )}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
