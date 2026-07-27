import clsx from "clsx";

export function Logo({ size = "md", light = false, className }: { size?: "sm" | "md" | "lg"; light?: boolean; className?: string }) {
  const heightClass = { sm: "h-7", md: "h-9", lg: "h-16" }[size];

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/cajia-logo-full.png" alt="CajIA" className={clsx(heightClass, "w-auto")} />
  );

  if (!light) {
    return <div className={clsx("flex items-center", className)}>{img}</div>;
  }

  return (
    <div className={clsx("inline-flex items-center rounded-xl bg-white px-3 py-2 shadow-sm", className)}>
      {img}
    </div>
  );
}
