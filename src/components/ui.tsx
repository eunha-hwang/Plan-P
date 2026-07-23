"use client";

import { clsx } from "@/lib/clsx";
import { useState } from "react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { t } from "@/lib/i18n";
import { useStore } from "@/store/useStore";

/* ---------------- Button ---------------- */

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-brand text-brand-fg hover:brightness-105 active:brightness-95 shadow-sm",
  secondary:
    "bg-surface text-fg border border-border hover:bg-surface-2 active:bg-surface-2",
  ghost: "bg-transparent text-muted hover:text-fg",
  danger: "bg-urgent-weak text-urgent hover:brightness-105",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={clsx(
        "inline-flex h-13 min-h-[52px] w-full items-center justify-center rounded-2xl px-5 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
        VARIANT[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------------- RichText (supports **bold** and \n line breaks) ---------------- */

export function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line.split("**").map((part, j) =>
            j % 2 === 1 ? (
              <b key={j} className="text-fg">
                {part}
              </b>
            ) : (
              part
            )
          )}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

/* ---------------- Card ---------------- */

export function Card({
  className,
  children,
  ...props
}: { className?: string; children: ReactNode } & ButtonHTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-border bg-surface p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ---------------- Field / Input ---------------- */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-fg">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "h-13 min-h-[52px] w-full rounded-2xl border border-border bg-surface-2 px-4 text-base text-fg outline-none transition placeholder:text-muted focus:border-brand focus:bg-surface",
        className
      )}
      {...props}
    />
  );
}

/* ---------------- Segmented (single choice) ---------------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  columns = 3,
}: {
  options: { value: T; label: string; sub?: string }[];
  value: T | null;
  onChange: (v: T) => void;
  columns?: number;
}) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={clsx(
              "flex flex-col items-center justify-center rounded-2xl border px-2 py-3 text-center transition",
              active
                ? "border-brand bg-surface text-brand"
                : "border-border bg-surface-2 text-muted hover:text-fg"
            )}
          >
            <span className="text-sm font-semibold">{o.label}</span>
            {o.sub && <span className="mt-0.5 text-[11px] opacity-80">{o.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Chip (multi choice) ---------------- */

export function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-full border px-4 py-2.5 text-sm font-medium transition",
        active
          ? "border-brand bg-surface text-brand"
          : "border-border bg-surface-2 text-muted hover:text-fg",
        className
      )}
    >
      {children}
    </button>
  );
}

/* ---------------- DeleteButton (탭 한 번으로 지워지지 않도록 인라인 확인) ---------------- */

export function DeleteButton({
  onDelete,
  size = "md",
}: {
  onDelete: () => void;
  size?: "sm" | "md";
}) {
  const [confirming, setConfirming] = useState(false);
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const lang = useStore((s) => s.language);

  if (confirming) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-full bg-urgent px-2.5 py-1.5 text-xs font-bold text-white"
        >
          {t(lang, "ui.delete")}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setConfirming(false);
          }}
          className="rounded-full px-2 py-1.5 text-xs font-semibold text-muted hover:text-fg"
        >
          {t(lang, "ui.cancel")}
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label={t(lang, "ui.deleteAria")}
      onClick={(e) => {
        e.stopPropagation();
        setConfirming(true);
      }}
      className={clsx(
        dim,
        "flex shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-urgent-weak hover:text-urgent"
      )}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/* ---------------- Header ---------------- */

export function Header({
  title,
  onBack,
  right,
}: {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const lang = useStore((s) => s.language);
  return (
    <header className="relative flex h-14 shrink-0 items-center justify-center px-4">
      {onBack && (
        <button
          onClick={onBack}
          aria-label={t(lang, "ui.backAria")}
          className="absolute left-2 flex h-10 w-10 items-center justify-center rounded-full text-fg hover:bg-surface-2"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      {title && <span className="text-base font-semibold text-fg">{title}</span>}
      {right && <div className="absolute right-2">{right}</div>}
    </header>
  );
}
