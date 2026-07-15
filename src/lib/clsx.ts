/** 가벼운 className 결합 유틸 (falsy 제거) */
export function clsx(
  ...parts: (string | false | null | undefined)[]
): string {
  return parts.filter(Boolean).join(" ");
}
