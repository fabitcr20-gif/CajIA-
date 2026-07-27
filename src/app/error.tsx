"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/ui/ErrorScreen";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorScreen onRetry={reset} />;
}
