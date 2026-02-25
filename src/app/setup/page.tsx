"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDB } from "@/lib/db/db";
import { TEMPLATES, applyTemplate, TemplateType } from "@/lib/db/templates";
import {
  CheckCircle2,
  Layout,
  Store,
  Coffee,
  ArrowRight,
  Loader,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AuthConfig } from "@/types";

export default function SetupPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<TemplateType>("cafe");
  const [isApplying, setIsApplying] = useState(false);
  const [authConfig, setAuthConfig] = useState<AuthConfig | undefined>();

  useEffect(() => {
    async function checkState() {
      const db = getDB();
      const activated = await db.isActivated();
      if (!activated) {
        router.push("/activate");
        return;
      }

      // If business profile exists and setup is complete, redirect to dashboard
      const profile = await db.getBusinessProfile();
      const auth = await db.getAuthConfig();
      setAuthConfig(auth);

      // Default to custom if not pro
      if (auth?.tier !== "pro") {
        setSelected("custom");
      }

      if (profile && profile.isSetupComplete) {
        router.push("/dashboard");
      }
    }
    checkState();
  }, [router]);

  const handleSetup = async () => {
    if (
      (selected === "cafe" || selected === "retail") &&
      authConfig?.tier !== "pro"
    ) {
      toast.error("Template ini eksklusif untuk paket Professional.");
      return;
    }
    setIsApplying(true);
    try {
      await applyTemplate(selected);
      toast.success("Workspace berhasil disiapkan!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (e) {
      toast.error("Gagal menyiapkan workspace: " + (e as Error).message);
    } finally {
      setIsApplying(false);
    }
  };

  const icons = {
    cafe: Coffee,
    retail: Store,
    custom: Layout,
  };

  return (
    <div className="min-h-screen bg-[#F8F8FA] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto shadow-2xl animate-bounce-slow">
            <span className="text-3xl text-[#D0F500]">⚡</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-black">
            Siapkan Workspace Anda
          </h1>
          <p className="text-(--color-muted) font-medium text-lg max-w-xl mx-auto">
            Selamat! Lisensi Anda telah aktif. Pilih template yang paling sesuai
            dengan jenis bisnis Anda untuk memulai lebih cepat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(TEMPLATES) as TemplateType[]).map((key) => {
            const template = TEMPLATES[key];
            const Icon = icons[key];
            const isSelected = selected === key;
            const isRestricted = key !== "custom" && authConfig?.tier !== "pro";

            return (
              <div
                key={key}
                onClick={() => {
                  if (isRestricted) {
                    toast.error(
                      "Template ini eksklusif untuk paket Professional.",
                    );
                    return;
                  }
                  setSelected(key);
                }}
                className={cn(
                  "relative p-8 rounded-3xl border-2 transition-all cursor-pointer group",
                  isSelected
                    ? "bg-white border-[#D0F500] shadow-2xl shadow-[#D0F500]/20 scale-105"
                    : "bg-white/50 border-black/5 hover:border-black/10 hover:bg-white",
                  isRestricted && "opacity-80 grayscale-[0.5]",
                )}
              >
                {isRestricted && (
                  <div className="absolute top-4 right-4 bg-black text-[#D0F500] text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                    Pro Only
                  </div>
                )}
                {isSelected && !isRestricted && (
                  <div className="absolute top-4 right-4 text-[#D0F500]">
                    <CheckCircle2 className="w-6 h-6 fill-black" />
                  </div>
                )}

                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all",
                    isSelected
                      ? "bg-black text-[#D0F500]"
                      : "bg-black/5 text-black",
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-black text-black mb-2 tracking-tight">
                  {template.name}
                </h3>
                <p className="text-sm text-(--color-muted) leading-relaxed">
                  {template.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-6 pt-8">
          <button
            onClick={handleSetup}
            disabled={isApplying}
            className={cn(
              "h-16 px-12 bg-black text-white rounded-2xl font-black text-lg flex items-center gap-4 transition-all hover:scale-105 active:scale-95 disabled:opacity-50",
              "hover:shadow-2xl hover:shadow-black/20",
            )}
          >
            {isApplying ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Mempersiapkan...
              </>
            ) : (
              <>
                Mulai Gunakan ShiftPlanner
                <ArrowRight
                  className="w-6 h-6 text-[#D0F500]"
                  strokeWidth={3}
                />
              </>
            )}
          </button>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-(--color-muted)/40">
            Anda dapat mengubah pengaturan ini nantinya di menu Pengaturan.
          </p>
        </div>
      </div>
    </div>
  );
}
