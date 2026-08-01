"use client";

import { useEffect } from "react";
import { useCajiaStore } from "@/lib/store";
import { initCloudSync } from "@/lib/supabase/cloudSync";

// Starts the (optional, no-op if unconfigured) Supabase backup sync as soon
// as the local store has finished hydrating from localStorage. Renders
// nothing — this only exists to run the effect at the app root, before the
// login/onboarding/app pages mount.
export function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  const hasHydrated = useCajiaStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated) {
      void initCloudSync();
    }
  }, [hasHydrated]);

  return <>{children}</>;
}
