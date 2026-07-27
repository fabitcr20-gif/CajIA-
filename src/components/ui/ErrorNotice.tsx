import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export function ErrorNotice({
  message = "No pudimos completar esta operación. Intenta nuevamente.",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn("mt-4 flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800", className)}>
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
