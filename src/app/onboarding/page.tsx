"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useCajiaStore } from "@/lib/store";
import { BUSINESS_PRESETS, BusinessPresetId } from "@/lib/data/businessPresets";

const PRESET_IDS = Object.keys(BUSINESS_PRESETS) as BusinessPresetId[];

export default function OnboardingPage() {
  const router = useRouter();
  const hasHydrated = useCajiaStore((s) => s.hasHydrated);
  const isAuthenticated = useCajiaStore((s) => s.isAuthenticated);
  const onboardingComplete = useCajiaStore((s) => s.onboardingComplete);
  const applyBusinessPreset = useCajiaStore((s) => s.applyBusinessPreset);

  const [selected, setSelected] = useState<BusinessPresetId | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace("/");
    } else if (onboardingComplete) {
      router.replace("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, onboardingComplete, router]);

  function handleContinue() {
    if (!selected || submitting) return;
    setSubmitting(true);
    applyBusinessPreset(selected);
    router.push("/dashboard");
  }

  if (!hasHydrated || !isAuthenticated || onboardingComplete) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-navy-950">
        <Spinner className="h-7 w-7 text-navy-300" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-navy-950 px-5 py-12">
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #14b8a6 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #3d5580 0%, transparent 70%)" }}
      />

      <div className="relative z-10 mx-auto w-full max-w-2xl animate-fade-in">
        <div className="mb-8 flex justify-center">
          <Logo light size="md" />
        </div>

        <div className="rounded-3xl bg-white p-7 shadow-2xl sm:p-9">
          <div className="text-center">
            <h1 className="text-2xl font-semibold leading-tight text-navy-900 sm:text-[28px]">
              ¿Qué tipo de negocio tienes?
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-navy-500">
              Elige la opción que más se parezca — cargaremos datos de ejemplo listos para explorar. Puedes
              cambiarlo después en Configuración.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PRESET_IDS.map((id) => {
              const preset = BUSINESS_PRESETS[id];
              const active = selected === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelected(id)}
                  className={`relative rounded-2xl border p-4 text-left transition-colors ${
                    active ? "border-accent-500 bg-accent-50" : "border-navy-100 hover:bg-navy-50"
                  }`}
                >
                  {active && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <p className="pr-6 text-[15px] font-semibold text-navy-900">{preset.label}</p>
                  <p className="mt-1 text-sm text-navy-500">{preset.description}</p>
                </button>
              );
            })}
          </div>

          <Button onClick={handleContinue} size="lg" fullWidth className="mt-7" disabled={!selected || submitting}>
            Continuar
            <ArrowRight className="h-[18px] w-[18px]" />
          </Button>
        </div>
      </div>
    </div>
  );
}
