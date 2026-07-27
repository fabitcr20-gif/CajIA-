import { ReactNode } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  accent?: "navy" | "accent" | "amber" | "sky";
  trend?: { value: string; positive: boolean };
  className?: string;
}

const ACCENT_CLASSES = {
  navy: "bg-navy-50 text-navy-700",
  accent: "bg-accent-50 text-accent-700",
  amber: "bg-amber-50 text-amber-700",
  sky: "bg-sky-50 text-sky-700",
};

export function StatCard({ label, value, icon, accent = "navy", trend, className }: StatCardProps) {
  return (
    <Card className={clsx("p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-navy-500">{label}</p>
        {icon && (
          <span className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", ACCENT_CLASSES[accent])}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-navy-900 sm:text-[26px]">{value}</p>
      {trend && (
        <p className={clsx("mt-1.5 text-xs font-medium", trend.positive ? "text-emerald-600" : "text-red-500")}>
          {trend.positive ? "↑" : "↓"} {trend.value}
        </p>
      )}
    </Card>
  );
}
