"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button, DeleteButton, Header } from "@/components/ui";
import { clsx } from "@/lib/clsx";
import { trackEvent } from "@/lib/mixpanel";
import { dateKey, formatClock, formatDuration, formatRemain } from "@/lib/time";
import type { Appointment } from "@/lib/types";
import { MODE_LABEL, t, type Language } from "@/lib/i18n";
import { useNow } from "@/lib/useNow";
import { useStore } from "@/store/useStore";

type Signal = "go" | "warn" | "urgent";

function phaseOf(
  appt: Appointment,
  now: number,
  lang: Language
): {
  signal: Signal;
  label: string;
  value: string;
  message: string;
} {
  const toPrep = appt.prepStartAt - now;
  const toDepart = appt.departAt - now;
  // 유저에게는 targetArriveAt이 곧 "약속 시각"이다 (실제 약속 시각은 내부 판정에만 사용)
  const toAppt = appt.targetArriveAt - now;

  // 준비 시작 전: 준비 시작까지 카운트다운 (차분). 며칠 남았으면 일단위로
  if (toPrep > 0) {
    const min = toPrep / 60_000;
    const signal: Signal = min > 30 ? "go" : "warn";
    const message =
      signal === "go" ? t(lang, "countdown.toPrep.relaxed") : t(lang, "countdown.toPrep.soon");
    return {
      signal,
      label: t(lang, "countdown.label.toPrep"),
      value: formatRemain(toPrep, lang),
      message,
    };
  }

  // 준비 구간: '출발까지'를 카운트다운해 촉박하게 → 낙관적 늑장 방지
  if (toDepart > 0) {
    const min = toDepart / 60_000;
    const signal: Signal = min > 10 ? "warn" : "urgent";
    return {
      signal,
      label: t(lang, "countdown.label.toDepart"),
      value: formatRemain(toDepart, lang),
      message: t(lang, "countdown.toDepart.message"),
    };
  }

  if (toAppt > 0) {
    return {
      signal: "urgent",
      label: t(lang, "countdown.label.toAppt"),
      value: formatRemain(toAppt, lang),
      message: t(lang, "countdown.toAppt.message"),
    };
  }

  return {
    signal: "urgent",
    label: t(lang, "countdown.label.overdue"),
    value: `+${formatRemain(-toAppt, lang)}`,
    message: t(lang, "countdown.overdue.message"),
  };
}

const SIGNAL_STYLE: Record<Signal, { accent: string; dot: string }> = {
  go: { accent: "text-go", dot: "bg-go" },
  warn: { accent: "text-warn", dot: "bg-warn" },
  urgent: { accent: "text-urgent", dot: "bg-urgent" },
};

/** 준비-출발-도착을 티켓처럼 세로로 늘어놓는 타임테이블 (항상 흰 배경 고정) */
function TimelineStop({
  time,
  title,
  sub,
}: {
  time: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-14 shrink-0 pt-0.5 text-right text-sm font-bold tnum text-[#191f28]">
        {time}
      </span>
      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-[#3182f6] bg-white" />
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-bold text-[#191f28]">{title}</p>
        {sub && <p className="mt-0.5 text-xs text-[#8b95a1]">{sub}</p>}
      </div>
    </div>
  );
}

/** 아직 지나지 않은 구간은 점선, 현재 시각이 그 구간의 끝을 지났으면 실선 */
function TimelineLeg({
  duration,
  chip,
  passed,
}: {
  duration: string;
  chip?: string;
  passed: boolean;
}) {
  return (
    <div className="flex items-stretch gap-3 py-1.5">
      <span className="w-14 shrink-0 text-right text-xs text-[#8b95a1]">{duration}</span>
      <span className="flex w-2.5 shrink-0 justify-center">
        <svg width="3" viewBox="0 0 3 100" preserveAspectRatio="none" className="h-full min-h-[28px] w-[3px]">
          <line
            x1="1.5"
            y1="0"
            x2="1.5"
            y2="100"
            stroke={passed ? "#3182f6" : "#c1c7cd"}
            strokeWidth="1.5"
            strokeDasharray={passed ? undefined : "4 4"}
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="flex-1 py-0.5">
        {chip && (
          <span className="inline-flex items-center rounded-lg border border-[#e5e8eb] px-2 py-1 text-xs font-medium text-[#8b95a1]">
            {chip}
          </span>
        )}
      </span>
    </div>
  );
}

function Timetable({ appt, now, lang }: { appt: Appointment; now: number; lang: Language }) {
  const prepMin = Math.round((appt.departAt - appt.prepStartAt) / 60_000);
  const travelMin = Math.round((appt.targetArriveAt - appt.departAt) / 60_000);
  return (
    <div className="w-full rounded-2xl border border-[#f2f3f5] bg-white p-5 text-left shadow-sm">
      <TimelineStop
        time={formatClock(appt.prepStartAt, lang)}
        title={t(lang, "countdown.timeline.prepStart")}
      />
      <TimelineLeg
        duration={formatDuration(prepMin, lang)}
        chip={t(lang, "countdown.timeline.prepChip")}
        passed={now >= appt.departAt}
      />
      <TimelineStop
        time={formatClock(appt.departAt, lang)}
        title={t(lang, "countdown.timeline.depart")}
        sub={MODE_LABEL[lang][appt.travelMode]}
      />
      <TimelineLeg
        duration={formatDuration(travelMin, lang)}
        chip={MODE_LABEL[lang][appt.travelMode]}
        passed={now >= appt.targetArriveAt}
      />
      <TimelineStop
        time={formatClock(appt.targetArriveAt, lang)}
        title={t(lang, "countdown.timeline.appt")}
        sub={appt.destination || undefined}
      />
    </div>
  );
}

type NotifyPhase = "prep" | "depart" | "arrive";

function notifyCopy(
  phase: NotifyPhase,
  appt: Appointment,
  lang: Language
): { title: string; body: string } {
  if (phase === "prep") {
    return {
      title: t(lang, "countdown.notify.prep.title"),
      body: t(lang, "countdown.notify.prep.body", {
        title: appt.title,
        depart: formatClock(appt.departAt, lang),
      }),
    };
  }
  if (phase === "depart") {
    return {
      title: t(lang, "countdown.notify.depart.title"),
      body: t(lang, "countdown.notify.depart.body", {
        title: appt.title,
        arrive: formatClock(appt.targetArriveAt, lang),
      }),
    };
  }
  return {
    title: t(lang, "countdown.notify.arrive.title"),
    body: t(lang, "countdown.notify.arrive.body", { title: appt.title }),
  };
}

/** 알림 자체는 앱(탭)이 살아있는 동안만 울릴 수 있음(브라우저 알림의 한계).
 *  requireInteraction으로 유저가 직접 닫기 전까지는 화면에 남아있게 한다. */
function fireAlert(appt: Appointment, phase: NotifyPhase, lang: Language) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([400, 150, 400, 150, 600]);
  }
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }
  const { title, body } = notifyCopy(phase, appt, lang);
  const n = new Notification(title, {
    body,
    tag: `early5-${appt.id}-${phase}`,
    requireInteraction: true,
  });
  n.onclick = () => {
    window.focus();
    n.close();
  };
}

function ResultView({ appt, lang }: { appt: Appointment; lang: Language }) {
  const map = {
    early: { emoji: "🎉", title: t(lang, "countdown.result.early"), c: "text-go", bg: "bg-go-weak" },
    ontime: {
      emoji: "👍",
      title: t(lang, "countdown.result.ontime"),
      c: "text-brand",
      bg: "bg-brand-weak",
    },
    late: {
      emoji: "😵",
      title: t(lang, "countdown.result.late", { min: appt.lateByMin ?? 0 }),
      c: "text-urgent",
      bg: "bg-urgent-weak",
    },
  } as const;
  const o = map[appt.outcome ?? "ontime"];
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className={clsx("mb-6 flex h-24 w-24 items-center justify-center rounded-full text-5xl", o.bg)}>
        {o.emoji}
      </div>
      <h1 className={clsx("text-2xl font-bold", o.c)}>{o.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {t(lang, "countdown.result.body")
          .split("\n")
          .map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
      </p>
    </div>
  );
}

function HeaderActions({ appt, lang }: { appt: Appointment; lang: Language }) {
  const router = useRouter();
  const removeAppointment = useStore((s) => s.removeAppointment);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={t(lang, "countdown.editAria")}
        onClick={() => router.push(`/new?id=${appt.id}`)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-fg hover:bg-surface-2"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <DeleteButton
        onDelete={() => {
          removeAppointment(appt.id);
          router.replace("/");
        }}
      />
    </div>
  );
}

export default function CountdownPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const hydrated = useStore((s) => s.hydrated);
  const appt = useStore((s) => s.appointments.find((a) => a.id === id));
  const markArrived = useStore((s) => s.markArrived);
  const lang = useStore((s) => s.language);

  const now = useNow(1000);
  const notifiedRef = useRef<Record<NotifyPhase, boolean> | null>(null);

  // 알림 권한 요청 (부드럽게)
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // 준비 시작 / 출발 / 도착 목표, 세 시점을 '화면을 보고 있는 중에' 넘길 때만 각각 한 번씩 알림
  useEffect(() => {
    if (!appt || appt.status === "done") return;
    if (notifiedRef.current === null) {
      // 진입 시 이미 지난 단계는 알림하지 않음 (이미 인지한 상태로 간주)
      const nowMs = Date.now();
      notifiedRef.current = {
        prep: nowMs >= appt.prepStartAt,
        depart: nowMs >= appt.departAt,
        arrive: nowMs >= appt.targetArriveAt,
      };
      return;
    }
    const n = notifiedRef.current;
    if (!n.prep && now >= appt.prepStartAt) {
      n.prep = true;
      fireAlert(appt, "prep", lang);
    }
    if (!n.depart && now >= appt.departAt) {
      n.depart = true;
      fireAlert(appt, "depart", lang);
    }
    if (!n.arrive && now >= appt.targetArriveAt) {
      n.arrive = true;
      fireAlert(appt, "arrive", lang);
    }
  }, [now, appt, lang]);

  if (!hydrated) return null;

  if (!appt) {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header onBack={() => router.replace("/")} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-muted">{t(lang, "countdown.notFound")}</p>
          <Button variant="secondary" onClick={() => router.replace("/")}>
            {t(lang, "countdown.home")}
          </Button>
        </div>
      </div>
    );
  }

  // 홈으로 돌아갈 때 방금 확인한 약속의 날짜를 그대로 보여주기 위해 날짜를 실어서 이동
  const goHome = () => router.replace(`/?date=${dateKey(appt.targetArriveAt)}`);

  if (appt.status === "done") {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header onBack={goHome} />
        <ResultView appt={appt} lang={lang} />
        <footer className="px-5 pb-8 pt-4">
          <Button onClick={goHome}>{t(lang, "countdown.home")}</Button>
        </footer>
      </div>
    );
  }

  const { signal, label, value, message } = phaseOf(appt, now, lang);
  const style = SIGNAL_STYLE[signal];

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <Header onBack={goHome} right={<HeaderActions appt={appt} lang={lang} />} />

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        {/* 신호등 상태 */}
        <div className="mb-8 flex items-center gap-2">
          <span className={clsx("h-2.5 w-2.5 rounded-full", style.dot)} />
          <span className={clsx("text-lg font-bold", style.accent)}>{message}</span>
        </div>

        {/* 정직한 카운트다운 */}
        <p className="text-sm font-medium text-muted">{label}</p>
        <div className={clsx("tnum mt-1 text-[64px] font-bold leading-none tracking-tight sm:text-7xl", style.accent)}>
          {value}
        </div>

        {/* 준비-출발-도착 타임테이블 */}
        <div className="mt-10 w-full">
          <Timetable appt={appt} now={now} lang={lang} />
        </div>
      </main>

      <footer className="space-y-2 px-5 pb-8 pt-4">
        <Button variant="secondary" onClick={goHome}>
          {t(lang, "countdown.home")}
        </Button>
        <Button
          onClick={() => {
            trackEvent("Arrived Click", { appointmentId: appt.id });
            markArrived(appt.id);
          }}
        >
          {t(lang, "countdown.safeBtn")}
        </Button>
      </footer>
    </div>
  );
}
