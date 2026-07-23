import type { Importance, LateReason, RiskFactor, TravelMode } from "./types";

export type Language = "ko" | "en";

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
];

const ko = {
  "home.greeting.night": "늦은 밤이에요",
  "home.greeting.morning": "좋은 아침이에요",
  "home.greeting.afternoon": "좋은 오후예요",
  "home.greeting.evening": "좋은 저녁이에요",
  "home.subtitle.hasUpcoming": "다음 약속까지 여유 있게 준비해요",
  "home.subtitle.empty": "약속을 추가하면 출발 시각을 챙겨드릴게요",
  "home.empty.title": "첫 약속을 등록해보세요",
  "home.empty.body": "약속만 넣으면 언제 나가야 할지 Plan P가 알아서 정해드려요.",
  "home.viewAll": "전체 보기",
  "home.noAppointmentsThisDay": "이 날은 등록된 약속이 없어요.",
  "home.upcomingSection": "다가오는 약속",
  "home.editAria": "약속 수정",
  "home.prepStartAt": "{time} 준비 시작",
  "home.departAndArrive": "{depart} 출발 · {arrive} 약속",
  "home.departArrowArrive": "{depart} 출발 → {arrive} 약속",

  "outcome.early": "일찍 도착",
  "outcome.ontime": "정시 도착",
  "outcome.late": "{min}분 지각",

  "new.titleEdit": "약속 수정",
  "new.titleNew": "새 약속",
  "new.field.title.label": "어떤 약속이에요?",
  "new.field.title.hint": "예: 지수랑 저녁, 카페 모임 (선택)",
  "new.field.title.placeholder": "약속 이름",
  "new.field.destination.label": "어디로 가요?",
  "new.field.datetime.label": "언제 만나요?",
  "new.field.importance.label": "얼마나 중요한 약속이에요?",
  "new.field.importance.hint": "중요할수록 더 넉넉히, 더 일찍 준비하도록 잡아요.",
  "new.field.mode.label": "어떻게 가요?",
  "new.field.eta.label": "지도 앱 예상 소요시간",
  "new.field.eta.hint":
    "네이버·카카오·구글 지도가 알려준 시간을 그대로 넣어주세요. 나머지는 Plan P가 알아서 넉넉히 잡아요.",
  "new.hour": "시간",
  "new.min": "분",
  "new.field.risk.label": "지각할 만한 게 있나요?",
  "new.field.risk.hint": "해당되는 걸 골라주세요. Plan P가 버퍼에 반영해요. (선택)",
  "new.field.prep.label": "이 약속 준비 시간",
  "new.field.prep.hint":
    "비워두면 평소 습관 기준으로 자동 계산해요. 출장지 등에서 바로 이동해 준비가 따로 필요 없으면 0으로 두세요. (선택)",
  "new.autoPlaceholder": "자동",
  "new.footer.plannedBy": "Plan P가 정한 시간",
  "new.footer.adjustEarlier": "{min}분 더 일찍",
  "new.footer.adjustLater": "{min}분 더 늦게",
  "new.footer.prepStart": "준비 시작",
  "new.footer.departAndMeet": "{depart} 출발 · {meet} 약속",
  "new.footer.btnEarlier": "5분 더 일찍",
  "new.footer.btnLater": "5분 더 늦게",
  "new.footer.reset": "초기화",
  "new.save.edit": "수정 저장",
  "new.save.create": "이 시각으로 저장",

  "onboarding.reason.none": "선택 안 함",
  "onboarding.reason.summary": "{items} 외 {n}개",
  "onboarding.reason.customPlaceholder": "직접 입력 (예: 늑장 부리기)",
  "onboarding.reason.add": "추가",
  "onboarding.title": "몇 가지만 알려주세요",
  "onboarding.subtitle": "출발 시각은 **Plan P가 알아서** 계산해요.\n이제 지각 걱정은 넣어두세요.",
  "onboarding.field.reason.label": "평소 왜 늦나요?",
  "onboarding.field.reason.hint": "해당되는 걸 모두 골라주세요 (선택)",
  "onboarding.field.frequency.label": "얼마나 자주 늦나요?",
  "onboarding.frequency.rare.label": "가끔",
  "onboarding.frequency.rare.sub": "거의 안 늦어요",
  "onboarding.frequency.sometimes.label": "종종",
  "onboarding.frequency.sometimes.sub": "가끔 늦어요",
  "onboarding.frequency.often.label": "자주",
  "onboarding.frequency.often.sub": "늘 아슬아슬",
  "onboarding.field.severity.label": "늦으면 보통 얼마나 늦나요?",
  "onboarding.severity.minor.label": "5분",
  "onboarding.severity.minor.sub": "살짝",
  "onboarding.severity.moderate.label": "10~15분",
  "onboarding.severity.moderate.sub": "적당히",
  "onboarding.severity.severe.label": "20분+",
  "onboarding.severity.severe.sub": "많이",
  "onboarding.field.prep.label": "평소 준비하는 데 보통 얼마나 걸려요?",
  "onboarding.field.prep.hint": "씻고 옷 입고 챙기는 시간 다 합쳐서 (선택)",
  "onboarding.prep.15.label": "15분",
  "onboarding.prep.15.sub": "빠른 편",
  "onboarding.prep.25.label": "25분",
  "onboarding.prep.25.sub": "보통",
  "onboarding.prep.40.label": "40분+",
  "onboarding.prep.40.sub": "느긋한 편",
  "onboarding.start": "시작하기",

  "stats.header": "히스토리",
  "stats.empty.title": "아직 지난 일정이 없어요",
  "stats.empty.body": "약속을 마치고 Safe! 를 누르면 여기에 하나씩 쌓여요.",
  "stats.rateLabel": "정시·일찍 도착률",
  "stats.rateBody": "총 {total}번 중 {onTime}번 제시간에 도착했어요",
  "stats.tile.streak": "연속 정시",
  "stats.tile.onTime": "정시 도착",
  "stats.tile.late": "지각",
  "stats.recentSection": "최근 일정",

  "countdown.toPrep.relaxed": "아직 여유 있어요",
  "countdown.toPrep.soon": "곧 준비 시작이에요",
  "countdown.label.toPrep": "준비 시작까지",
  "countdown.toDepart.message": "지금 준비 시작하세요",
  "countdown.label.toDepart": "출발까지",
  "countdown.toAppt.message": "지금 나가세요!",
  "countdown.label.toAppt": "약속까지",
  "countdown.overdue.message": "지금 바로 나가세요",
  "countdown.label.overdue": "약속 시간에서",
  "countdown.timeline.prepStart": "준비 시작",
  "countdown.timeline.prepChip": "준비",
  "countdown.timeline.depart": "출발",
  "countdown.timeline.appt": "약속",
  "countdown.notify.prep.title": "준비 시작할 시간이에요 ⏰",
  "countdown.notify.prep.body": "{title} · {depart} 출발",
  "countdown.notify.depart.title": "지금 나가세요 🚨",
  "countdown.notify.depart.body": "{title} · {arrive} 약속",
  "countdown.notify.arrive.title": "도착했나요? 📍",
  "countdown.notify.arrive.body": "{title} · 도착하면 앱에서 눌러서 기록해요",
  "countdown.result.early": "일찍 도착했어요!",
  "countdown.result.ontime": "정시 도착!",
  "countdown.result.late": "{min}분 지각했어요",
  "countdown.result.body":
    "잘 저장했어요. 다음엔 더 정확하게 맞춰드릴게요.\n쌓일수록 Plan P가 당신에게 맞춰져요.",
  "countdown.editAria": "약속 수정",
  "countdown.notFound": "약속을 찾을 수 없어요.",
  "countdown.home": "홈으로",
  "countdown.safeBtn": "Safe! 도착했어요",

  "nav.home": "홈",
  "nav.addAria": "약속 추가",
  "nav.history": "히스토리",

  "calendar.prevYear": "이전 해",
  "calendar.prevMonth": "이전 달",
  "calendar.nextYear": "다음 해",
  "calendar.nextMonth": "다음 달",
  "calendar.yearLabel": "{year}년",

  "destination.placeholder": "도착지 검색 (예: 강남역)",
  "destination.kakaoMissing":
    "지도 검색이 아직 설정 안 됐어요. .env.local의 NEXT_PUBLIC_KAKAO_JS_KEY를 채워주세요.",

  "ui.delete": "삭제",
  "ui.cancel": "취소",
  "ui.deleteAria": "삭제",
  "ui.backAria": "뒤로",

  "language.toggleAria": "언어 변경",
  "common.defaultTitle": "약속",
} as const;

type TranslationKey = keyof typeof ko;

const en: Record<TranslationKey, string> = {
  "home.greeting.night": "Up late tonight",
  "home.greeting.morning": "Good morning",
  "home.greeting.afternoon": "Good afternoon",
  "home.greeting.evening": "Good evening",
  "home.subtitle.hasUpcoming": "Get ready ahead of your next plan",
  "home.subtitle.empty": "Add a plan and we'll tell you when to leave",
  "home.empty.title": "Add your first plan",
  "home.empty.body": "Just add the plan — Plan P figures out when you should leave.",
  "home.viewAll": "View all",
  "home.noAppointmentsThisDay": "No plans on this day.",
  "home.upcomingSection": "Upcoming",
  "home.editAria": "Edit plan",
  "home.prepStartAt": "Get ready at {time}",
  "home.departAndArrive": "Leave {depart} · Meet {arrive}",
  "home.departArrowArrive": "Leave {depart} → Meet {arrive}",

  "outcome.early": "Arrived early",
  "outcome.ontime": "On time",
  "outcome.late": "{min} min late",

  "new.titleEdit": "Edit Plan",
  "new.titleNew": "New Plan",
  "new.field.title.label": "What's the plan?",
  "new.field.title.hint": "e.g. Dinner with Jisoo, cafe hangout (optional)",
  "new.field.title.placeholder": "Plan name",
  "new.field.destination.label": "Where are you going?",
  "new.field.datetime.label": "When are you meeting?",
  "new.field.importance.label": "How important is this?",
  "new.field.importance.hint":
    "The more important it is, the more buffer and earlier prep time we add.",
  "new.field.mode.label": "How are you getting there?",
  "new.field.eta.label": "Map app's estimated travel time",
  "new.field.eta.hint":
    "Enter the time your maps app (Naver, Kakao, Google) shows. Plan P adds the right buffer on top.",
  "new.hour": "hr",
  "new.min": "min",
  "new.field.risk.label": "Anything that could make you late?",
  "new.field.risk.hint": "Pick anything that applies. Plan P factors it into your buffer. (optional)",
  "new.field.prep.label": "Prep time for this plan",
  "new.field.prep.hint":
    "Leave blank to auto-calculate from your habits. Set to 0 if you're leaving straight from somewhere and don't need prep time. (optional)",
  "new.autoPlaceholder": "Auto",
  "new.footer.plannedBy": "Plan P's schedule",
  "new.footer.adjustEarlier": "{min} min earlier",
  "new.footer.adjustLater": "{min} min later",
  "new.footer.prepStart": "get ready",
  "new.footer.departAndMeet": "Leave {depart} · Meet {meet}",
  "new.footer.btnEarlier": "5 min earlier",
  "new.footer.btnLater": "5 min later",
  "new.footer.reset": "Reset",
  "new.save.edit": "Save changes",
  "new.save.create": "Save this plan",

  "onboarding.reason.none": "None selected",
  "onboarding.reason.summary": "{items} +{n} more",
  "onboarding.reason.customPlaceholder": "Type your own (e.g. dawdling)",
  "onboarding.reason.add": "Add",
  "onboarding.title": "Just a few questions",
  "onboarding.subtitle": "**Plan P** figures out your departure time.\nNo more worrying about being late.",
  "onboarding.field.reason.label": "Why are you usually late?",
  "onboarding.field.reason.hint": "Select all that apply (optional)",
  "onboarding.field.frequency.label": "How often are you late?",
  "onboarding.frequency.rare.label": "Rarely",
  "onboarding.frequency.rare.sub": "Almost never",
  "onboarding.frequency.sometimes.label": "Sometimes",
  "onboarding.frequency.sometimes.sub": "Occasionally late",
  "onboarding.frequency.often.label": "Often",
  "onboarding.frequency.often.sub": "Cutting it close every time",
  "onboarding.field.severity.label": "When you're late, how late?",
  "onboarding.severity.minor.label": "5 min",
  "onboarding.severity.minor.sub": "A little",
  "onboarding.severity.moderate.label": "10–15 min",
  "onboarding.severity.moderate.sub": "Moderately",
  "onboarding.severity.severe.label": "20+ min",
  "onboarding.severity.severe.sub": "A lot",
  "onboarding.field.prep.label": "How long does getting ready usually take?",
  "onboarding.field.prep.hint": "Washing up, getting dressed, packing — all together (optional)",
  "onboarding.prep.15.label": "15 min",
  "onboarding.prep.15.sub": "Fast",
  "onboarding.prep.25.label": "25 min",
  "onboarding.prep.25.sub": "Average",
  "onboarding.prep.40.label": "40+ min",
  "onboarding.prep.40.sub": "Take it slow",
  "onboarding.start": "Get started",

  "stats.header": "History",
  "stats.empty.title": "No past plans yet",
  "stats.empty.body": "Tap Safe! after a plan and it'll show up here.",
  "stats.rateLabel": "On-time & early rate",
  "stats.rateBody": "{onTime} of {total} times on time",
  "stats.tile.streak": "Streak",
  "stats.tile.onTime": "On time",
  "stats.tile.late": "Late",
  "stats.recentSection": "Recent",

  "countdown.toPrep.relaxed": "Plenty of time",
  "countdown.toPrep.soon": "Getting ready soon",
  "countdown.label.toPrep": "Until get-ready time",
  "countdown.toDepart.message": "Start getting ready now",
  "countdown.label.toDepart": "Until departure",
  "countdown.toAppt.message": "Leave now!",
  "countdown.label.toAppt": "Until meeting",
  "countdown.overdue.message": "Leave right now",
  "countdown.label.overdue": "Past meeting time by",
  "countdown.timeline.prepStart": "Get ready",
  "countdown.timeline.prepChip": "Prep",
  "countdown.timeline.depart": "Leave",
  "countdown.timeline.appt": "Meet",
  "countdown.notify.prep.title": "Time to get ready ⏰",
  "countdown.notify.prep.body": "{title} · Leave at {depart}",
  "countdown.notify.depart.title": "Leave now 🚨",
  "countdown.notify.depart.body": "{title} · Meet at {arrive}",
  "countdown.notify.arrive.title": "Arrived? 📍",
  "countdown.notify.arrive.body": "{title} · Tap in the app once you're there",
  "countdown.result.early": "You arrived early!",
  "countdown.result.ontime": "Right on time!",
  "countdown.result.late": "You were {min} min late",
  "countdown.result.body":
    "Saved. We'll fine-tune your next plan.\nThe more you use it, the better Plan P knows you.",
  "countdown.editAria": "Edit plan",
  "countdown.notFound": "Plan not found.",
  "countdown.home": "Home",
  "countdown.safeBtn": "Safe! Arrived",

  "nav.home": "Home",
  "nav.addAria": "Add plan",
  "nav.history": "History",

  "calendar.prevYear": "Previous year",
  "calendar.prevMonth": "Previous month",
  "calendar.nextYear": "Next year",
  "calendar.nextMonth": "Next month",
  "calendar.yearLabel": "{year}",

  "destination.placeholder": "Search destination (e.g. Gangnam Stn.)",
  "destination.kakaoMissing":
    "Map search isn't set up yet. Add NEXT_PUBLIC_KAKAO_JS_KEY to .env.local.",

  "ui.delete": "Delete",
  "ui.cancel": "Cancel",
  "ui.deleteAria": "Delete",
  "ui.backAria": "Back",

  "language.toggleAria": "Change language",
  "common.defaultTitle": "Plan",
};

const DICTS: Record<Language, Record<TranslationKey, string>> = { ko, en };

export function t(
  lang: Language,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string {
  let s = DICTS[lang][key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.split(`{${k}}`).join(String(v));
    }
  }
  return s;
}

/** epoch ms → Intl locale tag */
export function localeOf(lang: Language): string {
  return lang === "ko" ? "ko-KR" : "en-US";
}

export const MODE_LABEL: Record<Language, Record<TravelMode, string>> = {
  ko: { walk: "도보", transit: "대중교통", car: "자차·택시" },
  en: { walk: "Walk", transit: "Transit", car: "Car/Taxi" },
};

export const IMPORTANCE_LABEL: Record<Language, Record<Importance, string>> = {
  ko: { normal: "보통", important: "중요", critical: "매우 중요" },
  en: { normal: "Normal", important: "Important", critical: "Critical" },
};

export const RISK_FACTOR_LABEL: Record<Language, Record<RiskFactor, string>> = {
  ko: {
    "비·눈 예보": "비·눈 예보",
    "환승 많음": "환승 많음",
    "낯선 길": "낯선 길",
    "출발 전 다른 일": "출발 전 다른 일",
    "짐 많음": "짐 많음",
  },
  en: {
    "비·눈 예보": "Rain/snow forecast",
    "환승 많음": "Many transfers",
    "낯선 길": "Unfamiliar route",
    "출발 전 다른 일": "Something else before leaving",
    "짐 많음": "Lots of luggage",
  },
};

export const LATE_REASON_LABEL: Record<Language, Record<LateReason, string>> = {
  ko: {
    "늦잠": "늦잠",
    "씻는 데 오래 걸림": "씻는 데 오래 걸림",
    "옷 고르기": "옷 고르기",
    "화장·헤어": "화장·헤어",
    "아침 챙겨먹기": "아침 챙겨먹기",
    "출발 직전 딴짓": "출발 직전 딴짓",
    "챙길 것 확인하다가": "챙길 것 확인하다가",
    "이동시간 계산 실수": "이동시간 계산 실수",
    "하던 일 마무리하다가": "하던 일 마무리하다가",
  },
  en: {
    "늦잠": "Oversleeping",
    "씻는 데 오래 걸림": "Taking too long to wash up",
    "옷 고르기": "Picking an outfit",
    "화장·헤어": "Makeup/hair",
    "아침 챙겨먹기": "Eating breakfast",
    "출발 직전 딴짓": "Getting distracted right before leaving",
    "챙길 것 확인하다가": "Double-checking what to bring",
    "이동시간 계산 실수": "Misjudging travel time",
    "하던 일 마무리하다가": "Finishing up what I was doing",
  },
};
