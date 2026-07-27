import clsx from "clsx";

export function Logo({ size = "md", light = false, className }: { size?: "sm" | "md" | "lg"; light?: boolean; className?: string }) {
  const dims = { sm: "h-7 w-7 text-sm", md: "h-9 w-9 text-base", lg: "h-14 w-14 text-2xl" }[size];
  const textSize = { sm: "text-base", md: "text-lg", lg: "text-3xl" }[size];

  return (
    <div className={clsx("flex items-center gap-2.5", className)}>
      <span
        className={clsx(
          "flex items-center justify-center rounded-xl font-bold shrink-0",
          dims,
          light ? "bg-white text-navy-800" : "bg-navy-800 text-white"
        )}
      >
        C
      </span>
      <span className={clsx("font-semibold tracking-tight", textSize, light ? "text-white" : "text-navy-900")}>
        CajIA
      </span>
    </div>
  );
}
