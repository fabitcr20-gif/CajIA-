"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useCajiaStore } from "@/lib/store";
import { Spinner } from "@/components/ui/Spinner";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hasHydrated = useCajiaStore((s) => s.hasHydrated);
  const isAuthenticated = useCajiaStore((s) => s.isAuthenticated);
  const onboardingComplete = useCajiaStore((s) => s.onboardingComplete);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace("/");
    } else if (!onboardingComplete) {
      router.replace("/onboarding");
    }
  }, [hasHydrated, isAuthenticated, onboardingComplete, router]);

  if (!hasHydrated || !isAuthenticated || !onboardingComplete) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-navy-50">
        <Spinner className="h-7 w-7 text-navy-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
        <main className="min-w-0 flex-1 px-4 pb-24 pt-5 sm:px-6 sm:pt-7 md:px-8 md:pb-8 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
