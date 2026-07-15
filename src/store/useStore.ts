"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Appointment, UserProfile } from "@/lib/types";
import {
  DEFAULT_PROFILE,
  applyLearning,
  computePlan,
  judge,
  type PlanInput,
} from "@/lib/engine";

type NewApptInput = {
  title: string;
  destination: string;
  appointmentAt: number;
  travelMode: PlanInput["travelMode"];
  mapEtaMin: number;
  importance: PlanInput["importance"];
  riskFactors: PlanInput["riskFactors"];
  /** 유저가 수동으로 더 일찍(양수) 당긴 분 */
  adjustMin?: number;
  /** 유저가 이 약속에 한해 직접 지정한 준비 시간(분) */
  prepOverrideMin?: number;
};

interface Store {
  profile: UserProfile;
  appointments: Appointment[];
  /** localStorage rehydration 완료 여부 (초기 깜빡임 방지) */
  hydrated: boolean;

  _setHydrated: () => void;
  completeOnboarding: (
    data: Pick<UserProfile, "lateReasons" | "lateFrequency" | "lateSeverity"> &
      Partial<Pick<UserProfile, "prepBaseMin">>
  ) => void;
  addAppointment: (input: NewApptInput) => Appointment;
  updateAppointment: (id: string, input: NewApptInput) => Appointment | undefined;
  getAppointment: (id: string) => Appointment | undefined;
  markArrived: (id: string, arrivedAt?: number) => void;
  removeAppointment: (id: string) => void;
  resetAll: () => void;
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      appointments: [],
      hydrated: false,

      _setHydrated: () => set({ hydrated: true }),

      completeOnboarding: (data) =>
        set((s) => ({
          profile: { ...s.profile, ...data, onboarded: true },
        })),

      addAppointment: (input) => {
        const { profile } = get();
        const adjustMin = input.adjustMin ?? 0;
        const plan = computePlan(profile, {
          travelMode: input.travelMode,
          mapEtaMin: input.mapEtaMin,
          appointmentAt: input.appointmentAt,
          importance: input.importance,
          riskFactors: input.riskFactors,
          adjustMin,
          prepOverrideMin: input.prepOverrideMin,
        });
        const appt: Appointment = {
          id: makeId(),
          title: input.title.trim() || "약속",
          destination: input.destination.trim(),
          appointmentAt: input.appointmentAt,
          travelMode: input.travelMode,
          mapEtaMin: input.mapEtaMin,
          importance: input.importance,
          riskFactors: input.riskFactors,
          prepOverrideMin: input.prepOverrideMin,
          paddingMin: plan.paddingMin,
          arriveEarlyMin: plan.arriveEarlyMin,
          prepMin: plan.prepMin,
          prepStartAt: plan.prepStartAt,
          departAt: plan.departAt,
          targetArriveAt: plan.targetArriveAt,
          userAdjustMin: adjustMin,
          status: "scheduled",
          createdAt: Date.now(),
        };
        set((s) => ({ appointments: [appt, ...s.appointments] }));
        return appt;
      },

      updateAppointment: (id, input) => {
        const { profile, appointments } = get();
        const existing = appointments.find((a) => a.id === id);
        if (!existing || existing.status === "done") return undefined;
        const adjustMin = input.adjustMin ?? 0;
        const plan = computePlan(profile, {
          travelMode: input.travelMode,
          mapEtaMin: input.mapEtaMin,
          appointmentAt: input.appointmentAt,
          importance: input.importance,
          riskFactors: input.riskFactors,
          adjustMin,
          prepOverrideMin: input.prepOverrideMin,
        });
        const updated: Appointment = {
          ...existing,
          title: input.title.trim() || "약속",
          destination: input.destination.trim(),
          appointmentAt: input.appointmentAt,
          travelMode: input.travelMode,
          mapEtaMin: input.mapEtaMin,
          importance: input.importance,
          riskFactors: input.riskFactors,
          prepOverrideMin: input.prepOverrideMin,
          paddingMin: plan.paddingMin,
          arriveEarlyMin: plan.arriveEarlyMin,
          prepMin: plan.prepMin,
          prepStartAt: plan.prepStartAt,
          departAt: plan.departAt,
          targetArriveAt: plan.targetArriveAt,
          userAdjustMin: adjustMin,
        };
        set((s) => ({
          appointments: s.appointments.map((a) => (a.id === id ? updated : a)),
        }));
        return updated;
      },

      getAppointment: (id) => get().appointments.find((a) => a.id === id),

      markArrived: (id, arrivedAt = Date.now()) => {
        const { appointments, profile } = get();
        const appt = appointments.find((a) => a.id === id);
        if (!appt || appt.status === "done") return;
        const { outcome, lateByMin } = judge(appt, arrivedAt);
        const nextProfile = applyLearning(profile, appt, outcome, lateByMin);
        set({
          profile: nextProfile,
          appointments: appointments.map((a) =>
            a.id === id
              ? { ...a, status: "done", arrivedAt, outcome, lateByMin }
              : a
          ),
        });
      },

      removeAppointment: (id) =>
        set((s) => ({
          appointments: s.appointments.filter((a) => a.id !== id),
        })),

      resetAll: () => set({ profile: DEFAULT_PROFILE, appointments: [] }),
    }),
    {
      name: "early5-store",
      // SSR 하이드레이션 불일치 방지: 클라이언트에서 수동 rehydrate
      skipHydration: true,
      partialize: (s) => ({
        profile: s.profile,
        appointments: s.appointments,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 구버전 데이터 마이그레이션: 준비/중요도 필드 백필
          if (state.profile && state.profile.prepBaseMin == null) {
            state.profile.prepBaseMin = 25;
          }
          state.appointments = state.appointments.map((a) => ({
            ...a,
            importance: a.importance ?? "normal",
            riskFactors: a.riskFactors ?? [],
            prepMin: a.prepMin ?? 0,
            prepStartAt: a.prepStartAt ?? a.departAt,
            userAdjustMin: a.userAdjustMin ?? 0,
            targetArriveAt:
              a.targetArriveAt ?? a.appointmentAt - (a.arriveEarlyMin ?? 0) * 60_000,
          }));
        }
        state?._setHydrated();
      },
    }
  )
);
