"use client";

import { Check, Zap, Crown, Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getHardwareId } from "@/lib/fingerprint";
import { getDB } from "@/lib/db/db";

const tiers = [
  {
    name: "Starter",
    price: "0",
    description:
      "Ideal untuk tim kecil yang ingin mencoba efisiensi jadwal otomatis.",
    icon: Zap,
    features: [
      "Maksimal 5 Karyawan",
      "Otomatisasi 7 Hari",
      "Master Shift Dasar",
      "Export Gambar (Watermark)",
      "Penyimpanan Lokal Aman",
    ],
    cta: "Mulai Gratis Sekarang",
    href: "/setup",
    highlight: false,
  },
  {
    name: "Personal",
    price: "99k",
    description:
      "Pilihan terbaik untuk owner UMKM yang ingin kelola tim mandiri.",
    icon: User,
    features: [
      "Karyawan TANPA BATAS",
      "Otomatisasi 31 Hari (1 Bulan)",
      "Manajemen Ketersediaan (Izin/Cuti)",
      "Export Gambar & Excel (No Watermark)",
      "Semua Fitur pada Starter",
    ],
    cta: "Beli Rp 99.000",
    href: "/payment/checkout?tier=personal",
    highlight: false,
  },
  {
    name: "Pro",
    price: "349k",
    description: "Efisiensi manajemen profesional dengan kontrol biaya penuh.",
    icon: Crown,
    features: [
      "Otomatisasi TANPA BATAS",
      "Labor Cost Estimation (Real-time)",
      "WA Auto-Share ke Karyawan",
      "Live Portal & Publikasi Jadwal",
      "Custom Logo & Branding Bisnis",
      "Shift Templates Library Lengkap",
      "Semua Fitur pada Personal",
    ],
    cta: "Beli Rp 349.000",
    highlight: true,
    badge: "Efisiensi Maksimal",
    href: "/payment/checkout?tier=pro",
  },
];

export default function Pricing() {
  const router = useRouter();

  const handleStarterClick = async () => {
    try {
      const db = getDB();
      const activated = await db.isActivated();
      if (!activated) {
        const hardwareId = await getHardwareId();
        await db.saveActivation({
          licenseKey: "STARTER-FREE",
          hardwareId,
          activatedAt: new Date(),
          isActive: true,
          tier: "starter",
          maxDevices: 1,
        });
      }
      router.push("/setup");
    } catch {
      router.push("/setup");
    }
  };

  return (
    <section id="pricing" className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#D0F500]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-black/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto md:px-0 px-8 relative z-10">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-(--color-primary) bg-black inline-block px-4 py-1.5 rounded-full">
            Pricing Plans
          </h2>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-black leading-none">
            Investasi Sekali, <br />
            Untung Selamanya.
          </h1>
          <p className="text-(--color-muted) font-medium text-lg max-w-2xl mx-auto">
            Pilih paket yang paling sesuai dengan skala bisnis Anda. Tidak ada
            biaya langganan bulanan yang memberatkan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={cn(
                  "relative flex flex-col p-8 md:p-10 rounded-[32px] transition-all duration-500 group border",
                  tier.highlight
                    ? "bg-black text-white shadow-2xl scale-105 z-20 border-white/10 "
                    : " backdrop-blur-sm text-black border-black/30",
                )}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-(--color-primary) text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                    {tier.badge}
                  </div>
                )}

                <div className="mb-8">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                      tier.highlight
                        ? "bg-(--color-primary) text-black"
                        : "bg-black text-(--color-primary)",
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight mb-2">
                    {tier.name}
                  </h3>
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-5xl font-black tracking-tight">
                        {tier.price}
                      </span>
                    </div>
                    {tier.price !== "0" && (
                      <span
                        className={cn(
                          "text-[10px] font-black uppercase tracking-[0.2em] mt-1",
                          tier.highlight ? "text-white/70" : "text-black/40",
                        )}
                      >
                        / Lifetime Access
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "mt-4 text-sm font-medium leading-relaxed min-h-[40px]",
                      tier.highlight ? "text-white/60" : "text-(--color-muted)",
                    )}
                  >
                    {tier.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                          tier.highlight
                            ? "bg-(--color-primary)/20 text-(--color-primary)"
                            : "bg-black/5 text-black",
                        )}
                      >
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          tier.highlight ? "text-white/80" : "text-black/80",
                        )}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    if (tier.name === "Starter") {
                      handleStarterClick();
                    } else {
                      router.push(tier.href!);
                    }
                  }}
                  className={cn(
                    "w-full py-4 rounded-md font-black text-sm uppercase tracking-widest transition-all cursor-pointer",
                    tier.highlight
                      ? "bg-(--color-primary) text-black hover:scale-105 active:scale-95 shadow-xl shadow-(--color-primary)/20"
                      : "bg-black text-white hover:bg-(--color-primary) hover:text-black hover:shadow-xl active:scale-95",
                  )}
                >
                  {tier.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
