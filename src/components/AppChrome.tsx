"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";

/** Routes that are focused, full-screen flows without the tab bar. */
const HIDDEN = [/^\/new/, /^\/countdown/, /^\/onboarding/, /^\/connect/];

export function AppChrome() {
  const pathname = usePathname();
  if (HIDDEN.some((r) => r.test(pathname))) return null;
  return <BottomNav />;
}
