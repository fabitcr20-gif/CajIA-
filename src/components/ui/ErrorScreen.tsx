"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertTriangle className="h-8 w-8" />
      </span>
      <h1 className="mt-5 text-xl font-semibold text-navy-900">Algo salió mal</h1>
      <p className="mt-2 max-w-sm text-[15px] text-navy-500">
        No pudimos completar esta operación. Intenta nuevamente.
      </p>
      <Button size="lg" className="mt-6" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}
