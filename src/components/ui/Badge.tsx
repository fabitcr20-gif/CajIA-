import { ReactNode } from "react";
import clsx from "clsx";

type Tone = "navy" | "accent" | "success" | "warning" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  navy: "bg-navy-100 text-navy-700",
  accent: "bg-accent-100 text-accent-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  neutral: "bg-gray-100 text-gray-600",
};

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", TONE_CLASSES[tone], className)}>
      {children}
    </span>
  );
}
