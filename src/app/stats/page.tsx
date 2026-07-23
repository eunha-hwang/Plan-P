"use client";

import { useMemo } from "react";
import type { Appointment } from "@/lib/types";
import { formatDateTime } from "@/lib/time";
import { t, type Language } from "@/lib/i18n";
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

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="card-elev flex flex-col items-center rounded-2xl border border-border bg-surface px-3 py-4">
      <span className="text-xl font-bold text-fg">{value}</span>
      <span className="mt-1 text-xs text-muted">{label}</span>
    </div>
  );
}

export default function StatsPage() {
  const hydrated = useStore((s) => s.hydrated);
  const appointments = useStore((s) => s.appointments);
  const lang = useStore((s) => s.language);

  const stats = useMemo(() => {
    const done = appointments
      .filter((a) => a.status === "done")
      .sort((a, b) => (b.arrivedAt ?? 0) - (a.arrivedAt ?? 0));
    const total = done.length;
    const late = done.filter((a) => a.outcome === "late").length;
    const onTime = total - late;
    const rate = total > 0 ? Math.round((onTime / total) * 100) : 0;

    // 최근부터 연속 정시/일찍 도착 스트릭
    let streak = 0;
    for (const a of done) {
      if (a.outcome === "late") break;
      streak += 1;
    }

    return { done, total, late, onTime, rate, streak };
  }, [appointments]);

  if (!hydrated) return <Splash />;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-5 pb-2 pt-5">
        <span className="text-xl font-bold tracking-tight text-fg">{t(lang, "stats.header")}</span>
      </header>

      <main className="flex-1 px-5 pb-32">
        {stats.total === 0 ? (
          <div className="mt-24 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-surface-2 text-3xl">
              📈
            </div>
            <h2 className="text-lg font-bold text-fg">{t(lang, "stats.empty.title")}</h2>
            <p className="mx-auto mt-2 max-w-[260px] text-sm leading-relaxed text-muted">
              {t(lang, "stats.empty.body")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 정시 도착률 히어로 */}
            <section className="card-elev rounded-3xl border border-border bg-surface p-6 text-center">
              <p className="text-sm font-semibold text-muted">{t(lang, "stats.rateLabel")}</p>
              <p className="mt-1 text-5xl font-bold text-brand">{stats.rate}%</p>
              <p className="mt-2 text-sm text-muted">
                {t(lang, "stats.rateBody", { total: stats.total, onTime: stats.onTime })}
              </p>
            </section>

            {/* 요약 타일 */}
            <section className="grid grid-cols-3 gap-3">
              <StatTile value={`${stats.streak}`} label={t(lang, "stats.tile.streak")} />
              <StatTile value={`${stats.onTime}`} label={t(lang, "stats.tile.onTime")} />
              <StatTile value={`${stats.late}`} label={t(lang, "stats.tile.late")} />
            </section>

            {/* 최근 일정 */}
            <section>
              <h2 className="mb-3 px-1 text-sm font-bold text-muted">
                {t(lang, "stats.recentSection")}
              </h2>
              <div className="space-y-2">
                {stats.done.map((a) => (
                  <div
                    key={a.id}
                    className="card-elev flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-fg">
                        {a.title}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {formatDateTime(a.appointmentAt, lang)}
                      </p>
                    </div>
                    <OutcomeBadge appt={a} lang={lang} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
