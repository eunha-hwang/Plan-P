"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";

/** 클라이언트에서 localStorage를 수동 rehydrate (SSR mismatch 방지) */
export function Hydrator() {
  const language = useStore((s) => s.language);

  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
