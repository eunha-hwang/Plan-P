"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Button, Chip, Field, Header, Input, Segmented } from "@/components/ui";
import { computePlan } from "@/lib/engine";
import {
  formatClock,
  defaultAppointmentInput,
  localInputToMs,
  msToLocalInput,
} from "@/lib/time";
import {
  RISK_FACTORS,
  type Importance,
  type RiskFactor,
  type TravelMode,
} from "@/lib/types";
import { useStore } from "@/store/useStore";

const ADJUST_MIN_LO = -30;
const ADJUST_MIN_HI = 120;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={null}>
      <NewAppointmentForm />
    </Suspense>
  );
}

function NewAppointmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const hydrated = useStore((s) => s.hydrated);
  const profile = useStore((s) => s.profile);
  const addAppointment = useStore((s) => s.addAppointment);
  const updateAppointment = useStore((s) => s.updateAppointment);
  const getAppointment = useStore((s) => s.getAppointment);
  const editing = editId ? getAppointment(editId) : undefined;

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [dateStr, setDateStr] = useState(() => defaultAppointmentInput().slice(0, 10));
  const [timeStr, setTimeStr] = useState(() => defaultAppointmentInput().slice(11, 16));
  const [importance, setImportance] = useState<Importance>("normal");
  const [travelMode, setTravelMode] = useState<TravelMode | null>(null);
  const [etaH, setEtaH] = useState("");
  const [etaM, setEtaM] = useState("");
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [adjustMin, setAdjustMin] = useState(0);
  const [prepOverrideStr, setPrepOverrideStr] = useState("");
  const [prefilled, setPrefilled] = useState(false);

  // 수정 모드: 기존 약속 데이터로 폼을 한 번 채운다
  useEffect(() => {
    if (!editing || prefilled) return;
    const local = msToLocalInput(editing.appointmentAt);
    setTitle(editing.title === "약속" ? "" : editing.title);
    setDestination(editing.destination);
    setDateStr(local.slice(0, 10));
    setTimeStr(local.slice(11, 16));
    setImportance(editing.importance);
    setTravelMode(editing.travelMode);
    setEtaH(String(Math.floor(editing.mapEtaMin / 60) || ""));
    setEtaM(String(editing.mapEtaMin % 60 || ""));
    setRiskFactors(editing.riskFactors);
    setAdjustMin(editing.userAdjustMin);
    setPrepOverrideStr(
      editing.prepOverrideMin != null ? String(editing.prepOverrideMin) : ""
    );
    setPrefilled(true);
  }, [editing, prefilled]);

  const appointmentAt =
    dateStr && timeStr ? localInputToMs(`${dateStr}T${timeStr}`) : NaN;

  const etaTotal =
    (parseInt(etaH || "0", 10) || 0) * 60 + (parseInt(etaM || "0", 10) || 0);
  const mapEtaMin = etaTotal > 0 ? etaTotal : NaN;

  const prepOverrideMin =
    prepOverrideStr.trim() === "" ? undefined : Number(prepOverrideStr);

  const toggleRisk = (r: RiskFactor) =>
    setRiskFactors((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );

  const ready =
    !!destination.trim() &&
    Number.isFinite(appointmentAt) &&
    travelMode !== null &&
    Number.isFinite(mapEtaMin) &&
    mapEtaMin > 0;

  const plan = useMemo(() => {
    if (travelMode === null || !Number.isFinite(mapEtaMin) || mapEtaMin <= 0)
      return null;
    if (!Number.isFinite(appointmentAt)) return null;
    return computePlan(profile, {
      travelMode,
      mapEtaMin,
      appointmentAt,
      importance,
      riskFactors,
      adjustMin,
      prepOverrideMin,
    });
  }, [
    profile,
    travelMode,
    mapEtaMin,
    appointmentAt,
    importance,
    riskFactors,
    adjustMin,
    prepOverrideMin,
  ]);

  const save = () => {
    if (!ready || travelMode === null) return;
    const input = {
      title,
      destination,
      appointmentAt,
      travelMode,
      mapEtaMin,
      importance,
      riskFactors,
      adjustMin,
      prepOverrideMin,
    };
    const appt = editId
      ? updateAppointment(editId, input) ?? addAppointment(input)
      : addAppointment(input);
    router.replace(`/countdown/${appt.id}`);
  };

  if (!hydrated) return null;

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title={editId ? "약속 수정" : "새 약속"} onBack={() => router.back()} />

      <main className="flex-1 space-y-7 px-5 pb-44 pt-2">
        <Field label="어떤 약속이에요?" hint="예: 지수랑 저녁, 카페 모임 (선택)">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="약속 이름"
            maxLength={30}
          />
        </Field>

        <Field label="어디로 가요?">
          <Input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="도착지 (예: 강남역)"
            maxLength={40}
          />
        </Field>

        <Field label="언제 만나요?">
          <div className="flex gap-2">
            <Input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="flex-1"
            />
            <Input
              type="time"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              className="flex-1"
            />
          </div>
        </Field>

        <Field
          label="얼마나 중요한 약속이에요?"
          hint="중요할수록 더 넉넉히, 더 일찍 준비하도록 잡아요."
        >
          <Segmented<Importance>
            value={importance}
            onChange={setImportance}
            options={[
              { value: "normal", label: "보통" },
              { value: "important", label: "중요" },
              { value: "critical", label: "매우 중요" },
            ]}
          />
        </Field>

        <Field label="어떻게 가요?">
          <Segmented<TravelMode>
            value={travelMode}
            onChange={setTravelMode}
            options={[
              { value: "walk", label: "도보" },
              { value: "transit", label: "대중교통" },
              { value: "car", label: "자차·택시" },
            ]}
          />
        </Field>

        <Field
          label="지도 앱 예상 소요시간"
          hint="네이버·카카오·구글 지도가 알려준 시간을 그대로 넣어주세요. 나머지는 Plan P가 알아서 넉넉히 잡아요."
        >
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                value={etaH}
                onChange={(e) => setEtaH(e.target.value)}
                placeholder="0"
                min={0}
                max={12}
                className="flex-1"
              />
              <span className="text-sm text-muted">시간</span>
            </div>
            <div className="flex flex-1 items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                value={etaM}
                onChange={(e) => setEtaM(e.target.value)}
                placeholder="0"
                min={0}
                max={59}
                className="flex-1"
              />
              <span className="text-sm text-muted">분</span>
            </div>
          </div>
        </Field>

        <Field
          label="지각할 만한 게 있나요?"
          hint="해당되는 걸 골라주세요. Plan P가 버퍼에 반영해요. (선택)"
        >
          <div className="flex flex-wrap gap-2">
            {RISK_FACTORS.map((r) => (
              <Chip key={r} active={riskFactors.includes(r)} onClick={() => toggleRisk(r)}>
                {r}
              </Chip>
            ))}
          </div>
        </Field>

        <Field
          label="이 약속 준비 시간"
          hint="비워두면 평소 습관 기준으로 자동 계산해요. 출장지 등에서 바로 이동해 준비가 따로 필요 없으면 0으로 두세요. (선택)"
        >
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              value={prepOverrideStr}
              onChange={(e) => setPrepOverrideStr(e.target.value)}
              placeholder="자동"
              min={0}
              max={180}
              className="flex-1"
            />
            <span className="text-sm text-muted">분</span>
          </div>
        </Field>
      </main>

      <footer className="sticky bottom-0 space-y-3 bg-gradient-to-t from-bg via-bg to-transparent px-5 pb-6 pt-4">
        {plan && Number.isFinite(appointmentAt) && (
          <div className="rounded-2xl border border-border bg-surface-2 px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted">Plan P가 정한 시간</p>
              {adjustMin !== 0 && (
                <span className="text-xs font-semibold text-brand">
                  {adjustMin > 0 ? `${adjustMin}분 더 일찍` : `${-adjustMin}분 더 늦게`}
                </span>
              )}
            </div>

            <p className="mt-1 text-2xl font-bold text-brand">
              {formatClock(plan.prepStartAt)}
              <span className="ml-1 text-base font-semibold text-fg">준비 시작</span>
            </p>
            <p className="mt-0.5 text-sm font-medium text-muted">
              {formatClock(plan.departAt)} 출발 · {formatClock(plan.targetArriveAt)} 도착 목표
            </p>
            <p className="mt-0.5 text-xs text-muted/80">
              약속 시각 {formatClock(appointmentAt)}보다 {plan.arriveEarlyMin}분 일찍이에요.
            </p>

            {/* 시간 직접 조정 */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAdjustMin((a) => clamp(a + 5, ADJUST_MIN_LO, ADJUST_MIN_HI))}
                className="flex-1 rounded-xl border border-border bg-surface py-2 text-sm font-semibold text-fg transition hover:border-brand hover:text-brand"
              >
                5분 더 일찍
              </button>
              <button
                type="button"
                onClick={() => setAdjustMin((a) => clamp(a - 5, ADJUST_MIN_LO, ADJUST_MIN_HI))}
                className="flex-1 rounded-xl border border-border bg-surface py-2 text-sm font-semibold text-fg transition hover:border-brand hover:text-brand"
              >
                5분 더 늦게
              </button>
              {adjustMin !== 0 && (
                <button
                  type="button"
                  onClick={() => setAdjustMin(0)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:text-fg"
                >
                  초기화
                </button>
              )}
            </div>
          </div>
        )}
        <Button onClick={save} disabled={!ready}>
          {editId ? "수정 저장" : "이 시각으로 저장"}
        </Button>
      </footer>
    </div>
  );
}
