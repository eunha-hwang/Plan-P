"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Button, Chip, Field, Header, Input, Segmented } from "@/components/ui";
import { DestinationPicker } from "@/components/DestinationPicker";
import { computePlan } from "@/lib/engine";
import { trackEvent } from "@/lib/mixpanel";
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
import { IMPORTANCE_LABEL, MODE_LABEL, RISK_FACTOR_LABEL, t } from "@/lib/i18n";
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
  const lang = useStore((s) => s.language);
  const profile = useStore((s) => s.profile);
  const addAppointment = useStore((s) => s.addAppointment);
  const updateAppointment = useStore((s) => s.updateAppointment);
  const getAppointment = useStore((s) => s.getAppointment);
  const editing = editId ? getAppointment(editId) : undefined;

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [destinationLat, setDestinationLat] = useState<number | undefined>(undefined);
  const [destinationLng, setDestinationLng] = useState<number | undefined>(undefined);
  const [dateStr, setDateStr] = useState(() => defaultAppointmentInput().slice(0, 10));
  const [timeStr, setTimeStr] = useState(() => defaultAppointmentInput().slice(11, 16));
  const [importance, setImportance] = useState<Importance>("normal");
  const [travelMode, setTravelMode] = useState<TravelMode | null>(null);
  const [etaH, setEtaH] = useState("");
  const [etaM, setEtaM] = useState("");
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [adjustMin, setAdjustMin] = useState(0);
  const [prepOverrideH, setPrepOverrideH] = useState("");
  const [prepOverrideM, setPrepOverrideM] = useState("");
  const [prefilled, setPrefilled] = useState(false);

  // 수정 모드: 기존 약속 데이터로 폼을 한 번 채운다
  useEffect(() => {
    if (!editing || prefilled) return;
    const local = msToLocalInput(editing.appointmentAt);
    setTitle(editing.title === t(lang, "common.defaultTitle") ? "" : editing.title);
    setDestination(editing.destination);
    setDestinationLat(editing.destinationLat);
    setDestinationLng(editing.destinationLng);
    setDateStr(local.slice(0, 10));
    setTimeStr(local.slice(11, 16));
    setImportance(editing.importance);
    setTravelMode(editing.travelMode);
    setEtaH(String(Math.floor(editing.mapEtaMin / 60) || ""));
    setEtaM(String(editing.mapEtaMin % 60 || ""));
    setRiskFactors(editing.riskFactors);
    setAdjustMin(editing.userAdjustMin);
    if (editing.prepOverrideMin != null) {
      // 명시적으로 0으로 지정했을 수도 있으니 빈 문자열로 뭉개지 않는다
      setPrepOverrideH(String(Math.floor(editing.prepOverrideMin / 60)));
      setPrepOverrideM(String(editing.prepOverrideMin % 60));
    } else {
      setPrepOverrideH("");
      setPrepOverrideM("");
    }
    setPrefilled(true);
  }, [editing, prefilled]);

  const appointmentAt =
    dateStr && timeStr ? localInputToMs(`${dateStr}T${timeStr}`) : NaN;

  const etaTotal =
    (parseInt(etaH || "0", 10) || 0) * 60 + (parseInt(etaM || "0", 10) || 0);
  const mapEtaMin = etaTotal > 0 ? etaTotal : NaN;

  const prepOverrideMin =
    prepOverrideH.trim() === "" && prepOverrideM.trim() === ""
      ? undefined
      : (parseInt(prepOverrideH || "0", 10) || 0) * 60 +
        (parseInt(prepOverrideM || "0", 10) || 0);

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
      destinationLat,
      destinationLng,
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
    trackEvent("Appointment Save Click", {
      mode: editId ? "edit" : "create",
      travelMode,
      importance,
    });
    router.replace(`/countdown/${appt.id}`);
  };

  if (!hydrated) return null;

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        title={editId ? t(lang, "new.titleEdit") : t(lang, "new.titleNew")}
        onBack={() => router.back()}
      />

      <main className="flex-1 space-y-7 px-5 pb-44 pt-2">
        <Field label={t(lang, "new.field.title.label")} hint={t(lang, "new.field.title.hint")}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t(lang, "new.field.title.placeholder")}
            maxLength={30}
          />
        </Field>

        <Field label={t(lang, "new.field.destination.label")}>
          <DestinationPicker
            value={{ address: destination, lat: destinationLat, lng: destinationLng }}
            onChange={(v) => {
              setDestination(v.address);
              setDestinationLat(v.lat);
              setDestinationLng(v.lng);
            }}
          />
        </Field>

        <Field label={t(lang, "new.field.datetime.label")}>
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
          label={t(lang, "new.field.importance.label")}
          hint={t(lang, "new.field.importance.hint")}
        >
          <Segmented<Importance>
            value={importance}
            onChange={setImportance}
            options={[
              { value: "normal", label: IMPORTANCE_LABEL[lang].normal },
              { value: "important", label: IMPORTANCE_LABEL[lang].important },
              { value: "critical", label: IMPORTANCE_LABEL[lang].critical },
            ]}
          />
        </Field>

        <Field label={t(lang, "new.field.mode.label")}>
          <Segmented<TravelMode>
            value={travelMode}
            onChange={setTravelMode}
            options={[
              { value: "walk", label: MODE_LABEL[lang].walk },
              { value: "transit", label: MODE_LABEL[lang].transit },
              { value: "car", label: MODE_LABEL[lang].car },
            ]}
          />
        </Field>

        <Field label={t(lang, "new.field.eta.label")} hint={t(lang, "new.field.eta.hint")}>
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
              <span className="text-sm text-muted">{t(lang, "new.hour")}</span>
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
              <span className="text-sm text-muted">{t(lang, "new.min")}</span>
            </div>
          </div>
        </Field>

        <Field label={t(lang, "new.field.risk.label")} hint={t(lang, "new.field.risk.hint")}>
          <div className="flex flex-wrap gap-2">
            {RISK_FACTORS.map((r) => (
              <Chip key={r} active={riskFactors.includes(r)} onClick={() => toggleRisk(r)}>
                {RISK_FACTOR_LABEL[lang][r]}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label={t(lang, "new.field.prep.label")} hint={t(lang, "new.field.prep.hint")}>
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                value={prepOverrideH}
                onChange={(e) => setPrepOverrideH(e.target.value)}
                placeholder={t(lang, "new.autoPlaceholder")}
                min={0}
                max={12}
                className="flex-1"
              />
              <span className="text-sm text-muted">{t(lang, "new.hour")}</span>
            </div>
            <div className="flex flex-1 items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                value={prepOverrideM}
                onChange={(e) => setPrepOverrideM(e.target.value)}
                placeholder={t(lang, "new.autoPlaceholder")}
                min={0}
                max={59}
                className="flex-1"
              />
              <span className="text-sm text-muted">{t(lang, "new.min")}</span>
            </div>
          </div>
        </Field>
      </main>

      <footer className="sticky bottom-0 space-y-3 bg-gradient-to-t from-bg via-bg to-transparent px-5 pb-6 pt-4">
        {plan && Number.isFinite(appointmentAt) && (
          <div className="rounded-2xl border border-border bg-surface-2 px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted">{t(lang, "new.footer.plannedBy")}</p>
              {adjustMin !== 0 && (
                <span className="text-xs font-semibold text-brand">
                  {adjustMin > 0
                    ? t(lang, "new.footer.adjustEarlier", { min: adjustMin })
                    : t(lang, "new.footer.adjustLater", { min: -adjustMin })}
                </span>
              )}
            </div>

            <p className="mt-1 text-2xl font-bold text-brand">
              {formatClock(plan.prepStartAt, lang)}
              <span className="ml-1 text-base font-semibold text-fg">
                {t(lang, "new.footer.prepStart")}
              </span>
            </p>
            <p className="mt-0.5 text-sm font-medium text-muted">
              {t(lang, "new.footer.departAndMeet", {
                depart: formatClock(plan.departAt, lang),
                meet: formatClock(plan.targetArriveAt, lang),
              })}
            </p>

            {/* 시간 직접 조정 */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAdjustMin((a) => clamp(a + 5, ADJUST_MIN_LO, ADJUST_MIN_HI))}
                className="flex-1 rounded-xl border border-border bg-surface py-2 text-sm font-semibold text-fg transition hover:border-brand hover:text-brand"
              >
                {t(lang, "new.footer.btnEarlier")}
              </button>
              <button
                type="button"
                onClick={() => setAdjustMin((a) => clamp(a - 5, ADJUST_MIN_LO, ADJUST_MIN_HI))}
                className="flex-1 rounded-xl border border-border bg-surface py-2 text-sm font-semibold text-fg transition hover:border-brand hover:text-brand"
              >
                {t(lang, "new.footer.btnLater")}
              </button>
              {adjustMin !== 0 && (
                <button
                  type="button"
                  onClick={() => setAdjustMin(0)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:text-fg"
                >
                  {t(lang, "new.footer.reset")}
                </button>
              )}
            </div>
          </div>
        )}
        <Button onClick={save} disabled={!ready}>
          {editId ? t(lang, "new.save.edit") : t(lang, "new.save.create")}
        </Button>
      </footer>
    </div>
  );
}
