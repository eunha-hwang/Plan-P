import type { ReactNode } from "react";
import { clsx } from "@/lib/clsx";
import { StatusBar } from "./StatusBar";

/**
 * 넓은 화면(≥ md, 컴퓨터)에서는 앱을 아이폰 목업 프레임 안에 렌더하고,
 * 좁은 화면(실제 폰)에서는 프레임 없이 풀스크린으로 렌더한다.
 *
 * 스크롤 영역(children)과 하단 네비(chrome)를 분리해, 데스크톱에서 네비는
 * 프레임 바닥에 고정(absolute)되고 내용만 그 아래에서 스크롤되게 한다.
 */
export function DeviceFrame({
  children,
  chrome,
}: {
  children: ReactNode;
  chrome?: ReactNode;
}) {
  return (
    <div className="contents md:fixed md:inset-0 md:flex md:items-center md:justify-center md:overflow-hidden md:bg-[#d7dbe0] md:p-5">
      {/* 프레임(모바일: 앱 셸 그대로 / 데스크톱: 아이폰 베젤) */}
      <div
        className={clsx(
          "mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-bg",
          "md:relative md:block md:h-[min(852px,calc(100dvh-2.5rem))] md:min-h-0 md:w-[394px] md:max-w-none md:overflow-hidden md:rounded-[3.3rem] md:border-[13px] md:border-black md:shadow-[0_30px_70px_rgba(17,24,39,0.35)]"
        )}
      >
        {/* 상태바 (데스크톱 프레임에서만) */}
        <StatusBar />

        {/* Dynamic Island (데스크톱 프레임에서만) */}
        <div className="hidden md:absolute md:left-1/2 md:top-2.5 md:z-50 md:block md:h-[26px] md:w-[104px] md:-translate-x-1/2 md:rounded-full md:bg-black" />

        {/* 스크롤 영역: 모바일은 일반 흐름, 데스크톱은 프레임 내부 스크롤 (상태바 높이만큼 여백) */}
        <div className="no-scrollbar contents md:absolute md:inset-0 md:block md:overflow-y-auto md:overflow-x-hidden md:pt-11">
          {children}
        </div>

        {/* 하단 네비: 프레임 바닥에 고정 */}
        {chrome}
      </div>
    </div>
  );
}
