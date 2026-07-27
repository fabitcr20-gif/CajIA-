import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-700 shadow-sm shadow-accent-600/20",
  secondary:
    "bg-navy-800 text-white hover:bg-navy-900 active:bg-navy-900",
  outline:
    "bg-white text-navy-800 border border-navy-200 hover:bg-navy-50 active:bg-navy-100",
  ghost: "bg-transparent text-navy-700 hover:bg-navy-50 active:bg-navy-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "text-sm px-3.5 py-2 gap-1.5",
  md: "text-[15px] px-5 py-2.5 gap-2",
  lg: "text-base px-6 py-3.5 gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", fullWidth, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none select-none",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    />
  );
});
