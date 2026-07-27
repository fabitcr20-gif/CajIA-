import { AlertCircle } from "lucide-react";

export function ErrorNotice({ message = "No pudimos completar esta operación. Intenta nuevamente." }: { message?: string }) {
  return (
    <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
