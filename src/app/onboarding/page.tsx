"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Header, RichText, Segmented } from "@/components/ui";
import { LanguageToggle } from "@/components/LanguageToggle";
import { clsx } from "@/lib/clsx";
import { LATE_REASONS, type LateFrequency, type LateSeverity } from "@/lib/types";
import { LATE_REASON_LABEL, t, type Language } from "@/lib/i18n";
import { trackEvent } from "@/lib/mixpanel";
import { useStore } from "@/store/useStore";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className={clsx("shrink-0 transition-transform", open && "rotate-180")}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 프리셋 다중 선택 + 직접 입력이 가능한 드롭다운 */
function ReasonPicker({
  selected,
  onChange,
  lang,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
  lang: Language;
}) {
  const [open, setOpen] = useState(false);
  const [customText, setCustomText] = useState("");

  const toggle = (r: string) =>
    onChange(
      selected.includes(r) ? selected.filter((x) => x !== r) : [...selected, r]
    );

  const addCustom = () => {
    const v = customText.trim();
    if (!v || selected.includes(v)) return;
    onChange([...selected, v]);
    setCustomText("");
  };

  const customSelected = selected.filter(
    (r) => !(LATE_REASONS as readonly string[]).includes(r)
  );

  const label = (r: string) =>
    (LATE_REASON_LABEL[lang] as Record<string, string>)[r] ?? r;

  const summary =
    selected.length === 0
      ? t(lang, "onboarding.reason.none")
      : selected.length <= 2
        ? selected.map(label).join(", ")
        : t(lang, "onboarding.reason.summary", {
            items: selected.slice(0, 2).map(label).join(", "),
            n: selected.length - 2,
          });

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "flex h-13 min-h-[52px] w-full items-center justify-between rounded-2xl border px-4 text-left text-base transition",
          open ? "border-brand bg-surface" : "border-border bg-surface-2",
          selected.length === 0 ? "text-muted" : "text-fg"
        )}
      >
        <span className="truncate">{summary}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="mt-2 rounded-2xl border border-border bg-surface p-2">
          <div className="max-h-64 space-y-0.5 overflow-y-auto">
            {LATE_REASONS.map((r) => (
              <label
                key={r}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-2"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(r)}
                  onChange={() => toggle(r)}
                  className="h-4 w-4 accent-brand"
                />
                <span className="text-sm text-fg">{label(r)}</span>
              </label>
            ))}
            {customSelected.map((r) => (
              <label
                key={r}
                className="flex items-center gap-3 rounded-xl bg-brand-weak px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  checked
                  onChange={() => toggle(r)}
                  className="h-4 w-4 accent-brand"
                />
                <span className="text-sm text-fg">{r}</span>
              </label>
            ))}
          </div>
          <div className="mt-2 flex gap-2 border-t border-border pt-2">
            <input
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
              placeholder={t(lang, "onboarding.reason.customPlaceholder")}
              className="h-10 flex-1 rounded-xl border border-border bg-surface-2 px-3 text-sm text-fg outline-none placeholder:text-muted focus:border-brand"
            />
            <button
              type="button"
              onClick={addCustom}
              className="rounded-xl bg-brand px-3 text-sm font-semibold text-brand-fg disabled:opacity-40"
              disabled={!customText.trim()}
            >
              {t(lang, "onboarding.reason.add")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const lang = useStore((s) => s.language);

  const [reasons, setReasons] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<LateFrequency | null>(null);
  const [severity, setSeverity] = useState<LateSeverity | null>(null);
  const [prepBaseMin, setPrepBaseMin] = useState<"15" | "25" | "40" | null>(null);

  const canSubmit = frequency !== null && severity !== null;

  const submit = () => {
    if (!canSubmit) return;
    trackEvent("Onboarding Complete Click", {
      lateFrequency: frequency,
      lateSeverity: severity,
    });
    completeOnboarding({
      lateReasons: reasons,
      lateFrequency: frequency,
      lateSeverity: severity,
      ...(prepBaseMin ? { prepBaseMin: Number(prepBaseMin) } : {}),
    });
    router.replace("/");
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Header right={<LanguageToggle />} />
      <main className="flex-1 px-5 pb-32">
        <h1 className="mt-2 text-2xl font-bold leading-snug text-fg">
          {t(lang, "onboarding.title")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          <RichText text={t(lang, "onboarding.subtitle")} />
        </p>

        <div className="mt-8 space-y-8">
          <Field
            label={t(lang, "onboarding.field.reason.label")}
            hint={t(lang, "onboarding.field.reason.hint")}
          >
            <ReasonPicker selected={reasons} onChange={setReasons} lang={lang} />
          </Field>

          <Field label={t(lang, "onboarding.field.frequency.label")}>
            <Segmented<LateFrequency>
              value={frequency}
              onChange={setFrequency}
              options={[
                {
                  value: "rare",
                  label: t(lang, "onboarding.frequency.rare.label"),
                  sub: t(lang, "onboarding.frequency.rare.sub"),
                },
                {
                  value: "sometimes",
                  label: t(lang, "onboarding.frequency.sometimes.label"),
                  sub: t(lang, "onboarding.frequency.sometimes.sub"),
                },
                {
                  value: "often",
                  label: t(lang, "onboarding.frequency.often.label"),
                  sub: t(lang, "onboarding.frequency.often.sub"),
                },
              ]}
            />
          </Field>

          <Field label={t(lang, "onboarding.field.severity.label")}>
            <Segmented<LateSeverity>
              value={severity}
              onChange={setSeverity}
              options={[
                {
                  value: "minor",
                  label: t(lang, "onboarding.severity.minor.label"),
                  sub: t(lang, "onboarding.severity.minor.sub"),
                },
                {
                  value: "moderate",
                  label: t(lang, "onboarding.severity.moderate.label"),
                  sub: t(lang, "onboarding.severity.moderate.sub"),
                },
                {
                  value: "severe",
                  label: t(lang, "onboarding.severity.severe.label"),
                  sub: t(lang, "onboarding.severity.severe.sub"),
                },
              ]}
            />
          </Field>

          <Field
            label={t(lang, "onboarding.field.prep.label")}
            hint={t(lang, "onboarding.field.prep.hint")}
          >
            <Segmented<"15" | "25" | "40">
              value={prepBaseMin}
              onChange={setPrepBaseMin}
              options={[
                {
                  value: "15",
                  label: t(lang, "onboarding.prep.15.label"),
                  sub: t(lang, "onboarding.prep.15.sub"),
                },
                {
                  value: "25",
                  label: t(lang, "onboarding.prep.25.label"),
                  sub: t(lang, "onboarding.prep.25.sub"),
                },
                {
                  value: "40",
                  label: t(lang, "onboarding.prep.40.label"),
                  sub: t(lang, "onboarding.prep.40.sub"),
                },
              ]}
            />
          </Field>
        </div>
      </main>

      <footer className="sticky bottom-0 bg-gradient-to-t from-bg via-bg to-transparent px-5 pb-6 pt-4">
        <Button onClick={submit} disabled={!canSubmit}>
          {t(lang, "onboarding.start")}
        </Button>
      </footer>
    </div>
  );
}
