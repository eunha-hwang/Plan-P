"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Calendar, type DayMark } from "@/components/Calendar";
import { DeleteButton } from "@/components/ui";
import { LanguageToggle } from "@/components/LanguageToggle";
import type { Appointment } from "@/lib/types";
import { IMPORTANCE_LABEL, MODE_LABEL, t, type Language } from "@/lib/i18n";
import { dateKey, formatClock, formatDateShort, formatDateTime } from "@/lib/time";
import { useStore } from "@/store/useStore";

function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <span className="text-lg font-bold tracking-tight text-brand">Plan P</span>
    </div>
  );
}

function OutcomeBadge({ appt, lang }: { appt: Appointment; lang: Language }) {
  const map = {
    early: { t: t(lang, "outcome.early"), c: "text-go bg-go-weak" },
    ontime: { t: t(lang, "outcome.ontime"), c: "text-brand bg-brand-weak" },
    late: {
      t: t(lang, "outcome.late", { min: appt.lateByMin ?? 0 }),
      c: "text-urgent bg-urgent-weak",
    },
  } as const;
  const o = appt.outcome ? map[appt.outcome] : null;
  if (!o) return null;
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${o.c}`}>
      {o.t}
    </span>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UpcomingCard({
  a,
  lang,
  onClick,
  onEdit,
  onDelete,
}: {
  a: Appointment;
  lang: Language;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="card-elev block w-full cursor-pointer rounded-3xl border border-border bg-surface p-5 text-left transition hover:bg-surface-2 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="min-w-0 truncate text-base font-bold text-fg">{a.title}</p>
            {a.importance && a.importance !== "normal" && (
              <span
                className={`shrink-0 text-[11px] font-bold ${
                  a.importance === "critical" ? "text-urgent" : "text-warn"
                }`}
              >
                {IMPORTANCE_LABEL[lang][a.importance]}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-muted">
            {a.destination || MODE_LABEL[lang][a.travelMode]} ·{" "}
            {formatDateTime(a.targetArriveAt, lang)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={t(lang, "home.editAria")}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg"
          >
            <EditIcon />
          </button>
          <DeleteButton size="sm" onDelete={onDelete} />
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-surface-2 px-4 py-3">
        {a.prepStartAt < a.departAt ? (
          <>
            <p className="text-sm font-bold text-brand">
              {t(lang, "home.prepStartAt", { time: formatClock(a.prepStartAt, lang) })}
            </p>
            <p className="mt-0.5 text-xs font-medium text-muted">
              {t(lang, "home.departAndArrive", {
                depart: formatClock(a.departAt, lang),
                arrive: formatClock(a.targetArriveAt, lang),
              })}
            </p>
          </>
        ) : (
          <p className="text-sm font-semibold text-fg">
            {t(lang, "home.departArrowArrive", {
              depart: formatClock(a.departAt, lang),
              arrive: formatClock(a.targetArriveAt, lang),
            })}
          </p>
        )}
      </div>
    </div>
  );
}

function PastRow({
  a,
  lang,
  onDelete,
}: {
  a: Appointment;
  lang: Language;
  onDelete: () => void;
}) {
  return (
    <div className="card-elev flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-fg">{a.title}</p>
        <p className="truncate text-xs text-muted">{formatDateTime(a.appointmentAt, lang)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <OutcomeBadge appt={a} lang={lang} />
        <DeleteButton size="sm" onDelete={onDelete} />
      </div>
    </div>
  );
}

function timeGreeting(lang: Language): string {
  const h = new Date().getHours();
  if (h < 6) return t(lang, "home.greeting.night");
  if (h < 12) return t(lang, "home.greeting.morning");
  if (h < 18) return t(lang, "home.greeting.afternoon");
  return t(lang, "home.greeting.evening");
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useStore((s) => s.hydrated);
  const onboarded = useStore((s) => s.profile.onboarded);
  const appointments = useStore((s) => s.appointments);
  const removeAppointment = useStore((s) => s.removeAppointment);
  const lang = useStore((s) => s.language);
  // 방금 저장한 약속의 날짜로 바로 이동해서 보여주기 위해 쿼리로 넘어온 날짜를 초기값으로 사용
  const [selectedDate, setSelectedDate] = useState<string | null>(
    () => searchParams.get("date")
  );

  useEffect(() => {
    if (hydrated && !onboarded) router.replace("/onboarding");
  }, [hydrated, onboarded, router]);

  const marks = useMemo(() => {
    const m: Record<string, DayMark> = {};
    for (const a of appointments) {
      const key = dateKey(a.appointmentAt);
      const cur = m[key] ?? { upcoming: false, late: false, ok: false };
      if (a.status === "done") {
        if (a.outcome === "late") cur.late = true;
        else cur.ok = true;
      } else {
        cur.upcoming = true;
      }
      m[key] = cur;
    }
    return m;
  }, [appointments]);

  const selectedList = useMemo(() => {
    if (!selectedDate) return null;
    return appointments
      .filter((a) => dateKey(a.appointmentAt) === selectedDate)
      .sort((a, b) => a.appointmentAt - b.appointmentAt);
  }, [appointments, selectedDate]);

  if (!hydrated || !onboarded) return <Splash />;

  // 다가오는 약속: 앞으로 7일 이내의 미완료 약속만 (더 먼 약속은 캘린더에서 확인)
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const weekLater = Date.now() + WEEK_MS;
  const upcoming = appointments
    .filter((a) => a.status !== "done" && a.appointmentAt <= weekLater)
    .sort((a, b) => a.departAt - b.departAt);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-start justify-between gap-3 pb-2 pl-6 pr-5 pt-6">
        <div>
          <h1 className="text-xl font-bold text-fg">{timeGreeting(lang)}</h1>
          <p className="mt-1 text-sm text-muted">
            {upcoming.length > 0
              ? t(lang, "home.subtitle.hasUpcoming")
              : t(lang, "home.subtitle.empty")}
          </p>
        </div>
        <LanguageToggle className="mt-0.5 shrink-0" />
      </header>

      <main className="flex-1 px-5 pb-32">
        {appointments.length === 0 ? (
          <div className="mt-24 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-surface-2 text-3xl">
              ⏰
            </div>
            <h2 className="text-lg font-bold text-fg">{t(lang, "home.empty.title")}</h2>
            <p className="mx-auto mt-2 max-w-[260px] text-sm leading-relaxed text-muted">
              {t(lang, "home.empty.body")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <Calendar marks={marks} selected={selectedDate} onSelect={setSelectedDate} />

            {selectedList ? (
              <section>
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-sm font-bold text-muted">
                    {formatDateShort(new Date(selectedDate + "T00:00:00").getTime(), lang)}
                  </h2>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-xs font-semibold text-brand"
                  >
                    {t(lang, "home.viewAll")}
                  </button>
                </div>
                {selectedList.length === 0 ? (
                  <p className="px-1 py-6 text-center text-sm text-muted">
                    {t(lang, "home.noAppointmentsThisDay")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedList.map((a) =>
                      a.status === "done" ? (
                        <PastRow
                          key={a.id}
                          a={a}
                          lang={lang}
                          onDelete={() => removeAppointment(a.id)}
                        />
                      ) : (
                        <UpcomingCard
                          key={a.id}
                          a={a}
                          lang={lang}
                          onClick={() => router.push(`/countdown/${a.id}`)}
                          onEdit={() => router.push(`/new?id=${a.id}`)}
                          onDelete={() => removeAppointment(a.id)}
                        />
                      )
                    )}
                  </div>
                )}
              </section>
            ) : (
              <div className="space-y-8">
                {upcoming.length > 0 && (
                  <section>
                    <h2 className="mb-3 px-1 text-sm font-bold text-muted">
                      {t(lang, "home.upcomingSection")}
                    </h2>
                    <div className="space-y-3">
                      {upcoming.map((a) => (
                        <UpcomingCard
                          key={a.id}
                          a={a}
                          lang={lang}
                          onClick={() => router.push(`/countdown/${a.id}`)}
                          onEdit={() => router.push(`/new?id=${a.id}`)}
                          onDelete={() => removeAppointment(a.id)}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
