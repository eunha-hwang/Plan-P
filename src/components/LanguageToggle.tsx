"use client";

import { LANGUAGES, t } from "@/lib/i18n";
import { trackEvent } from "@/lib/mixpanel";
import { useStore } from "@/store/useStore";

export function LanguageToggle({ className }: { className?: string }) {
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);

  const next = LANGUAGES.find((l) => l.value !== language) ?? LANGUAGES[0];

  return (
    <button
      type="button"
      aria-label={t(language, "language.toggleAria")}
      onClick={() => {
        trackEvent("Language Toggle Click", { from: language, to: next.value });
        setLanguage(next.value);
      }}
      className={`flex h-8 items-center justify-center rounded-full border border-border bg-surface-2 px-3 text-xs font-bold text-fg transition hover:bg-surface ${className ?? ""}`}
    >
      {language === "ko" ? "EN" : "한국어"}
    </button>
  );
}
