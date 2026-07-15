"use client";

import { useEffect, useState } from "react";

/**
 * 매 tick마다 Date.now()를 반환하는 훅.
 * 항상 Date.now()를 다시 읽으므로 백그라운드 복귀 시에도 시간이 어긋나지 않는다.
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") setNow(Date.now());
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs]);

  return now;
}
