"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { clsx } from "@/lib/clsx";

function TabButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex w-16 flex-col items-center gap-0.5 py-0.5 transition",
        active ? "text-[#121212]" : "text-muted"
      )}
    >
      {children}
      <span className="text-[12px] font-medium">{label}</span>
    </button>
  );
}

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isStats = pathname.startsWith("/stats");

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:absolute md:pb-5">
      <div className="mx-auto max-w-[480px] px-6">
        <div className="pointer-events-auto flex items-center justify-around rounded-full border border-border bg-surface/95 px-5 py-1.5 shadow-[0_4px_16px_rgba(17,24,39,0.10)] backdrop-blur">
          <TabButton active={isHome} label="홈" onClick={() => router.push("/")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1v-8.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
                fill={isHome ? "currentColor" : "none"}
              />
            </svg>
          </TabButton>

          {/* center: add appointment */}
          <button
            onClick={() => router.push("/new")}
            aria-label="약속 추가"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#121212] text-white shadow-md transition active:scale-95"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <TabButton
            active={isStats}
            label="히스토리"
            onClick={() => router.push("/stats")}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="8.5"
                stroke="currentColor"
                strokeWidth="1.8"
                fill={isStats ? "currentColor" : "none"}
              />
              <path
                d="M12 7.5V12l3 1.8"
                stroke={isStats ? "var(--surface)" : "currentColor"}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M4.5 7.5 3 6l1.5-1.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </TabButton>
        </div>
      </div>
    </nav>
  );
}
