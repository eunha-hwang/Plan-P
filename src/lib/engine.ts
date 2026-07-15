import type {
  Appointment,
  Importance,
  LateFrequency,
  LateReason,
  LateSeverity,
  Outcome,
  RiskFactor,
  TravelMode,
  UserProfile,
} from "./types";

/**
 * Plan P 개인화 엔진 (규칙 기반, 로컬)
 *
 * 핵심 명제: 버퍼를 "준비"가 아니라 "이동/도착" 쪽에 둔다.
 * - 지도 ETA는 진실이 아니라 하한선 → 이동수단 리스크만큼 패딩.
 * - 목표는 "정시"가 아니라 "N분 일찍 도착".
 * - 유저는 아무 수치도 고르지 않는다. 전부 여기서 산출한다.
 */

export const DEFAULT_PROFILE: UserProfile = {
  onboarded: false,
  lateReasons: [],
  lateFrequency: "sometimes",
  lateSeverity: "moderate",
  modeEtaBiasMin: { walk: 0, transit: 0, car: 0 },
  arriveEarlyBaseMin: 15,
  prepBaseMin: 25,
};

/** 지각 사유별 준비시간 가산(분) */
const REASON_PREP: Record<LateReason, number> = {
  "늦잠": 15,
  "씻는 데 오래 걸림": 10,
  "옷 고르기": 10,
  "화장·헤어": 10,
  "아침 챙겨먹기": 10,
  "출발 직전 딴짓": 5,
  "챙길 것 확인하다가": 5,
  "이동시간 계산 실수": 0,
  "하던 일 마무리하다가": 8,
};
/** 프리셋에 없는(직접 입력한) 사유는 평균치로 가정 */
const DEFAULT_REASON_PREP = 5;
const reasonPrepBump = (reason: string): number =>
  (REASON_PREP as Record<string, number>)[reason] ?? DEFAULT_REASON_PREP;

/** 중요도 계수 — 도착 여유 배수 / 준비시간 가산(분) */
const IMPORTANCE_EARLY_MULT: Record<Importance, number> = {
  normal: 1,
  important: 1.2,
  critical: 1.4,
};
const IMPORTANCE_PREP_ADD: Record<Importance, number> = {
  normal: 0,
  important: 8,
  critical: 16,
};

const PREP_MIN = 10;
const PREP_MAX = 120;

/** 약속별 지각 위험요인 → 이동 패딩 가산(분) */
const RISK_PAD: Record<RiskFactor, number> = {
  "비·눈 예보": 10,
  "환승 많음": 8,
  "낯선 길": 7,
  "출발 전 다른 일": 0,
  "짐 많음": 0,
};
/** 약속별 지각 위험요인 → 준비시간 가산(분) */
const RISK_PREP: Record<RiskFactor, number> = {
  "비·눈 예보": 0,
  "환승 많음": 0,
  "낯선 길": 0,
  "출발 전 다른 일": 8,
  "짐 많음": 6,
};

const sumBy = <T extends string>(
  keys: T[],
  table: Record<T, number>
): number => keys.reduce((acc, k) => acc + (table[k] ?? 0), 0);

/** 이동수단별 ETA 신뢰도 계수 — ETA에 곱해 리스크 패딩을 만든다 */
const MODE_RISK: Record<TravelMode, { ratio: number; floor: number }> = {
  // 대중교통: 만석 열차/버스 배차·환승 변동이 커서 가장 크게 패딩
  transit: { ratio: 0.5, floor: 10 },
  // 자차·택시: 교통 정체·배차 지연
  car: { ratio: 0.35, floor: 8 },
  // 도보: 가장 예측 가능
  walk: { ratio: 0.12, floor: 3 },
};

const FREQ_EARLY: Record<LateFrequency, number> = {
  rare: 0,
  sometimes: 5,
  often: 10,
};

const SEVERITY_EARLY: Record<LateSeverity, number> = {
  minor: 0,
  moderate: 5,
  severe: 12,
};

const BIAS_MIN = -10;
const BIAS_MAX = 30;
const EARLY_MIN = 10;
const EARLY_MAX = 45;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export interface PlanInput {
  travelMode: TravelMode;
  mapEtaMin: number;
  appointmentAt: number;
  importance: Importance;
  /** 이 약속의 지각 위험 요인 */
  riskFactors: RiskFactor[];
  /** 유저가 수동으로 더 일찍(양수) 당긴 분 */
  adjustMin?: number;
  /** 유저가 이 약속에 한해 직접 지정한 준비 시간(분). 없으면 자동 계산 */
  prepOverrideMin?: number;
}

export interface Plan {
  paddingMin: number;
  arriveEarlyMin: number;
  prepMin: number;
  /** 준비 시작 시각 (epoch ms) */
  prepStartAt: number;
  departAt: number;
  /** 도착 목표 시각 (epoch ms) — 약속시각보다 arriveEarlyMin분 이른 시각 */
  targetArriveAt: number;
  /** 유저에게 실제로 소요되는 총 리드타임(도착여유 + ETA + 패딩) */
  leadMin: number;
}

/** 지도 ETA를 신뢰하지 않는 이동 패딩(분) 산출 */
function computePadding(profile: UserProfile, input: PlanInput): number {
  const risk = MODE_RISK[input.travelMode];
  const base = Math.max(risk.floor, Math.round(input.mapEtaMin * risk.ratio));
  const learned = profile.modeEtaBiasMin[input.travelMode] ?? 0;
  // "이동시간 계산 실수"를 자주 꼽은 유저는 이동 패딩을 조금 더
  const reasonBump = profile.lateReasons.includes("이동시간 계산 실수") ? 5 : 0;
  // 이 약속의 위험요인(날씨·환승·낯선 길 등) 반영
  const riskBump = sumBy(input.riskFactors, RISK_PAD);
  return clamp(base + learned + reasonBump + riskBump, risk.floor, 120);
}

/** "N분 일찍 도착" 목표(분) 산출 — 중요도 배수 반영 */
function computeArriveEarly(profile: UserProfile, importance: Importance): number {
  const base =
    profile.arriveEarlyBaseMin +
    FREQ_EARLY[profile.lateFrequency] +
    SEVERITY_EARLY[profile.lateSeverity];
  const v = base * IMPORTANCE_EARLY_MULT[importance];
  // 중요한 약속은 상한을 조금 더 넉넉히
  return clamp(Math.round(v), EARLY_MIN, importance === "normal" ? EARLY_MAX : 70);
}

/** 개인 준비 시간(분) 산출 — 사유·중요도·위험요인 반영. 유저가 직접 지정했으면 그 값을 우선 */
function computePrep(
  profile: UserProfile,
  importance: Importance,
  riskFactors: RiskFactor[],
  overrideMin?: number
): number {
  if (overrideMin != null && Number.isFinite(overrideMin)) {
    // 준비가 아예 필요 없는 경우(예: 출장지에서 바로 이동)도 있으므로 하한 없이 허용
    return clamp(Math.round(overrideMin), 0, PREP_MAX);
  }
  let v = profile.prepBaseMin;
  for (const r of profile.lateReasons) v += reasonPrepBump(r);
  v += IMPORTANCE_PREP_ADD[importance];
  v += sumBy(riskFactors, RISK_PREP);
  return clamp(Math.round(v), PREP_MIN, PREP_MAX);
}

/** 약속 맥락 + 유저 프로필 → 준비/출발 시각 전부 자동 산출 */
export function computePlan(profile: UserProfile, input: PlanInput): Plan {
  const paddingMin = computePadding(profile, input);
  const arriveEarlyMin = computeArriveEarly(profile, input.importance);
  const prepMin = computePrep(
    profile,
    input.importance,
    input.riskFactors,
    input.prepOverrideMin
  );
  const leadMin = arriveEarlyMin + input.mapEtaMin + paddingMin;
  const adjustMs = (input.adjustMin ?? 0) * 60_000;
  const departAt = input.appointmentAt - leadMin * 60_000 - adjustMs;
  const prepStartAt = departAt - prepMin * 60_000;
  const targetArriveAt = input.appointmentAt - arriveEarlyMin * 60_000;
  return {
    paddingMin,
    arriveEarlyMin,
    prepMin,
    prepStartAt,
    departAt,
    targetArriveAt,
    leadMin,
  };
}

/** 도착 결과 판정 */
export function judge(
  appt: Appointment,
  arrivedAt: number
): { outcome: Outcome; lateByMin: number } {
  const lateByMin = Math.round((arrivedAt - appt.appointmentAt) / 60_000);
  let outcome: Outcome;
  if (lateByMin > 0) outcome = "late";
  else if (lateByMin <= -appt.arriveEarlyMin) outcome = "early";
  else outcome = "ontime";
  return { outcome, lateByMin };
}

/**
 * 도착 결과로 프로필을 보정한다 (다음 약속의 정확도를 올리는 학습 루프).
 * 지각 → 이동 패딩·도착 여유↑, 과하게 일찍 → 소폭↓.
 */
export function applyLearning(
  profile: UserProfile,
  appt: Appointment,
  outcome: Outcome,
  lateByMin: number
): UserProfile {
  const bias = { ...profile.modeEtaBiasMin };
  let base = profile.arriveEarlyBaseMin;
  const mode = appt.travelMode;

  if (outcome === "late") {
    // 실제 초과분만큼 이동 편차를 키우되 상한 유지
    bias[mode] = clamp(bias[mode] + Math.min(lateByMin, 10), BIAS_MIN, BIAS_MAX);
    base = clamp(base + 2, EARLY_MIN, EARLY_MAX);
  } else if (outcome === "early") {
    // 목표보다 너무(+20분↑) 일찍 도착했으면만 살짝 줄인다 (일찍은 나쁜 게 아님)
    const excess = -lateByMin - appt.arriveEarlyMin;
    if (excess >= 20) {
      bias[mode] = clamp(bias[mode] - 3, BIAS_MIN, BIAS_MAX);
      base = clamp(base - 1, EARLY_MIN, EARLY_MAX);
    }
  }
  // ontime은 현 설정이 잘 맞은 것 → 변경 없음(안정적 수렴)

  return { ...profile, modeEtaBiasMin: bias, arriveEarlyBaseMin: base };
}
