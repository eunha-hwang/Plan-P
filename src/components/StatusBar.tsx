/**
 * 아이폰 목업용 상태바. 데스크톱 프레임(≥ md)에서만 표시된다.
 * 실제 폰에서는 OS 상태바가 이미 있으므로 숨긴다.
 */
export function StatusBar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 hidden h-11 items-center justify-between bg-bg px-8 md:flex">
      <span className="tabular-nums text-[15px] font-semibold text-fg">9:41</span>

      <div className="flex items-center gap-1.5 text-fg">
        {/* cellular */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden>
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0.5" width="3" height="11.5" rx="1" />
        </svg>
        {/* wifi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" aria-hidden>
          <path d="M8.5 2C11.9 2 15 3.3 17 5.4l-8.5 6.6L0 5.4C2 3.3 5.1 2 8.5 2Z" />
        </svg>
        {/* battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="16" height="8" rx="1.5" fill="currentColor" />
          <path d="M23 4.2c1 .4 1 3.4 0 3.8V4.2Z" fill="currentColor" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}
