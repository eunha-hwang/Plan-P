export type TravelMode = "walk" | "transit" | "car";
export const MODE_LABEL: Record<TravelMode, string> = {
  walk: "도보",
  transit: "대중교통",
  car: "자차·택시",
};

export type LateFrequency = "rare" | "sometimes" | "often";
export type LateSeverity = "minor" | "moderate" | "severe";

/** 약속 중요도 — 높을수록 버퍼·준비시간을 더 크게 잡는다 */
export type Importance = "normal" | "important" | "critical";
export const IMPORTANCE_LABEL: Record<Importance, string> = {
  normal: "보통",
  important: "중요",
  critical: "매우 중요",
};

/** 이 약속에서 지각을 유발할 수 있는 요인 (등록 시 다중 선택) — AI가 버퍼에 반영 */
export const RISK_FACTORS = [
  "비·눈 예보",
  "환승 많음",
  "낯선 길",
  "출발 전 다른 일",
  "짐 많음",
] as const;
export type RiskFactor = (typeof RISK_FACTORS)[number];

/** 자주 늦는 이유 태그 (온보딩에서 다중 선택) */
export const LATE_REASONS = [
  "늦잠",
  "씻는 데 오래 걸림",
  "옷 고르기",
  "화장·헤어",
  "아침 챙겨먹기",
  "출발 직전 딴짓",
  "챙길 것 확인하다가",
  "이동시간 계산 실수",
  "하던 일 마무리하다가",
] as const;
export type LateReason = (typeof LATE_REASONS)[number];

export interface UserProfile {
  /** 온보딩 완료 여부 */
  onboarded: boolean;
  /** 프리셋 값 또는 유저가 직접 입력한 사유 */
  lateReasons: string[];
  lateFrequency: LateFrequency;
  lateSeverity: LateSeverity;
  /**
   * 이동수단별 학습된 ETA 편차(분). 엔진이 도착 결과로 보정.
   * 유저에게 노출하지 않는 내부 값.
   */
  modeEtaBiasMin: Record<TravelMode, number>;
  /** 기본 도착 여유(분). 엔진이 관리·보정. 유저 비노출. */
  arriveEarlyBaseMin: number;
  /** 기본 준비 시간(분). 온보딩/학습으로 조정. 유저 비노출. */
  prepBaseMin: number;
}

export type AppointmentStatus = "scheduled" | "active" | "done";
export type Outcome = "early" | "ontime" | "late";

export interface Appointment {
  id: string;
  title: string;
  destination: string;
  /** 약속 시각 (epoch ms) */
  appointmentAt: number;
  travelMode: TravelMode;
  /** 유저가 입력한 지도앱 예상 이동시간(분) */
  mapEtaMin: number;
  /** 약속 중요도 */
  importance: Importance;
  /** 이 약속의 지각 위험 요인 */
  riskFactors: RiskFactor[];
  /** 유저가 이 약속에 한해 직접 지정한 준비 시간(분). 없으면 자동 계산 */
  prepOverrideMin?: number;

  /* ---- 엔진 산출값 (내부, UI 비노출) ---- */
  /** 이동 패딩(분) */
  paddingMin: number;
  /** 도착 여유(분) */
  arriveEarlyMin: number;
  /** 준비 시간(분) */
  prepMin: number;
  /** 준비 시작 시각 (epoch ms) */
  prepStartAt: number;
  /** 출발 시각 (epoch ms) */
  departAt: number;
  /** 도착 목표 시각 (epoch ms) — 약속시각보다 arriveEarlyMin분 이른 시각 */
  targetArriveAt: number;
  /** 유저가 수동으로 앞당긴 분(양수=더 일찍). 표시/재계산용 */
  userAdjustMin: number;

  status: AppointmentStatus;
  createdAt: number;

  /* ---- 도착 후 결과 ---- */
  arrivedAt?: number;
  outcome?: Outcome;
  /** 약속시각 대비 초과 분(양수=지각, 음수=조기) */
  lateByMin?: number;
}
