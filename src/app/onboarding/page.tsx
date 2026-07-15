"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Header, Segmented } from "@/components/ui";
import { clsx } from "@/lib/clsx";
import { LATE_REASONS, type LateFrequency, type LateSeverity } from "@/lib/types";
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
}: {
  selected: string[];
  onChange: (next: string[]) => void;
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

  const summary =
    selected.length === 0
      ? "선택 안 함"
      : selected.length <= 2
        ? selected.join(", ")
        : `${selected.slice(0, 2).join(", ")} 외 ${selected.length - 2}개`;

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
                <span className="text-sm text-fg">{r}</span>
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
              placeholder="직접 입력 (예: 늑장 부리기)"
              className="h-10 flex-1 rounded-xl border border-border bg-surface-2 px-3 text-sm text-fg outline-none placeholder:text-muted focus:border-brand"
            />
            <button
              type="button"
              onClick={addCustom}
              className="rounded-xl bg-brand px-3 text-sm font-semibold text-brand-fg disabled:opacity-40"
              disabled={!customText.trim()}
            >
              추가
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

  const [reasons, setReasons] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<LateFrequency | null>(null);
  const [severity, setSeverity] = useState<LateSeverity | null>(null);
  const [prepBaseMin, setPrepBaseMin] = useState<"15" | "25" | "40" | null>(null);

  const canSubmit = frequency !== null && severity !== null;

  const submit = () => {
    if (!canSubmit) return;
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
      <Header />
      <main className="flex-1 px-5 pb-8">
        <h1 className="mt-2 text-2xl font-bold leading-snug text-fg">
          몇 가지만 알려주세요
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          출발 시각은 <b className="text-fg">Plan P가 알아서</b> 계산해요.
          <br />
          이제 지각 걱정은 넣어두세요.
        </p>

        <div className="mt-8 space-y-8">
          <Field label="평소 왜 늦나요?" hint="해당되는 걸 모두 골라주세요 (선택)">
            <ReasonPicker selected={reasons} onChange={setReasons} />
          </Field>

          <Field label="얼마나 자주 늦나요?">
            <Segmented<LateFrequency>
              value={frequency}
              onChange={setFrequency}
              options={[
                { value: "rare", label: "가끔", sub: "거의 안 늦어요" },
                { value: "sometimes", label: "종종", sub: "가끔 늦어요" },
                { value: "often", label: "자주", sub: "늘 아슬아슬" },
              ]}
            />
          </Field>

          <Field label="늦으면 보통 얼마나 늦나요?">
            <Segmented<LateSeverity>
              value={severity}
              onChange={setSeverity}
              options={[
                { value: "minor", label: "5분", sub: "살짝" },
                { value: "moderate", label: "10~15분", sub: "적당히" },
                { value: "severe", label: "20분+", sub: "많이" },
              ]}
            />
          </Field>

          <Field
            label="평소 준비하는 데 보통 얼마나 걸려요?"
            hint="씻고 옷 입고 챙기는 시간 다 합쳐서 (선택)"
          >
            <Segmented<"15" | "25" | "40">
              value={prepBaseMin}
              onChange={setPrepBaseMin}
              options={[
                { value: "15", label: "15분", sub: "빠른 편" },
                { value: "25", label: "25분", sub: "보통" },
                { value: "40", label: "40분+", sub: "느긋한 편" },
              ]}
            />
          </Field>
        </div>
      </main>

      <footer className="sticky bottom-0 bg-gradient-to-t from-bg via-bg to-transparent px-5 pb-6 pt-4">
        <Button onClick={submit} disabled={!canSubmit}>
          시작하기
        </Button>
      </footer>
    </div>
  );
}
