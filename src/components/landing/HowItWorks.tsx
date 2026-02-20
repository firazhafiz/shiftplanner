"use client";

import { ShoppingCart, Zap, CalendarDays } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ShoppingCart,
    title: "Beli & Dapatkan Key",
    desc: "Setelah pembelian, kamu mendapatkan kunci lisensi unik via email atau WhatsApp.",
    color: "#3B82F6",
  },
  {
    number: "02",
    icon: "/assets/logo-lime.svg",
    title: "Aktivasi Sekali",
    desc: "Buka aplikasi, masukkan key. Sistem akan terikat ke perangkatmu secara otomatis.",
    color: "#D0F500",
  },
  {
    number: "03",
    icon: CalendarDays,
    title: "Kelola Jadwal",
    desc: "Langsung tambah karyawan, buat pola shift, dan ekspor jadwal — 100% offline.",
    color: "#8B5CF6",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-(--color-surface)">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block bg-white text-(--color-muted) text-xs font-semibold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            Cara Kerja
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-(--color-fg) mb-4">
            Mulai dalam 3 langkah.
          </h2>
          <p className="text-(--color-muted) max-w-xl mx-auto">
            Tidak perlu install software, tidak ada akun cloud, tidak ada biaya
            langganan bulanan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector lines (desktop) */}
          <div className="hidden md:block absolute top-12 left-[33%] right-[33%] h-[2px] bg-linear-to-r from-[#D0F5000] via-[#D0F500] to-transparent" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center group"
              >
                {/* Step number + icon */}
                <div className="relative mb-6">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center  transition-transform duration-300 group-hover:-translate-y-2"
                    style={{
                      background:
                        step.color === "#D0F500" ? "#D0F500" : "white",
                      border: `2px solid ${step.color}20`,
                    }}
                  >
                    {typeof step.icon === "string" ? (
                      <img
                        src={step.icon}
                        alt={step.title}
                        className="w-8 h-8 object-contain filter-[brightness(0)]"
                      />
                    ) : (
                      <Icon
                        className="w-8 h-8"
                        style={{
                          color:
                            step.color === "#D0F500" ? "#4a5500" : step.color,
                        }}
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                  <div
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                    style={{
                      background:
                        step.color === "#D0F500" ? "#a8c700" : step.color,
                    }}
                  >
                    {step.number.slice(1)}
                  </div>
                </div>
                <h3 className="font-bold text-lg text-(--color-fg) mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-(--color-muted) leading-relaxed max-w-xs">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
