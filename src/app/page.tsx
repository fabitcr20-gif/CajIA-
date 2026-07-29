"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Coffee } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useCajiaStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const login = useCajiaStore((s) => s.login);
  const settings = useCajiaStore((s) => s.settings);

  const handleEnter = () => {
    login();
    const onboardingComplete = useCajiaStore.getState().onboardingComplete;
    router.push(onboardingComplete ? "/dashboard" : "/onboarding");
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-navy-950 px-5 py-12">
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #14b8a6 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #3d5580 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="mb-10 flex justify-center">
          <Logo light size="lg" />
        </div>

        <div className="rounded-3xl bg-white p-7 shadow-2xl sm:p-9">
          <div className="text-center">
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-navy-900 sm:text-3xl">
              Tu caja. Tus ventas.
              <br />
              Tu negocio.
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-navy-500">
              Registra ventas, cierra tu caja y entiende tu negocio desde cualquier dispositivo.
            </p>
          </div>

          <div className="mt-7 flex items-center gap-3 rounded-2xl border border-navy-100 bg-navy-50 px-4 py-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-800 text-white">
              <Coffee className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-navy-900">{settings.businessName}</p>
              <p className="truncate text-sm text-navy-500">{settings.businessType}</p>
            </div>
            <span className="ml-auto shrink-0 rounded-full bg-accent-100 px-2.5 py-1 text-xs font-medium text-accent-700">
              Demo
            </span>
          </div>

          <Button onClick={handleEnter} size="lg" fullWidth className="mt-6">
            Entrar al demo
            <ArrowRight className="h-[18px] w-[18px]" />
          </Button>

          <p className="mt-4 text-center text-xs text-navy-400">
            Datos de demostración · sin necesidad de crear una cuenta
          </p>
        </div>
      </div>
    </div>
  );
}
