"use client";

import {
  CalendarDays,
  Zap,
  AlertTriangle,
  FileSpreadsheet,
  Wifi,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Kalender Visual",
    desc: "Grid jadwal bulanan yang jelas dan interaktif. Klik sel untuk assign shift langsung.",
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    icon: "/assets/logo-lime.svg",
    title: "Auto-Rolling Shift",
    desc: "Terapkan pola 2-2-2 atau pola apapun ke seluruh bulan dengan satu klik.",
    color: "#D0F500",
    bg: "#FAFFD4",
  },
  {
    icon: AlertTriangle,
    title: "Deteksi Konflik",
    desc: "Sistem otomatis mendeteksi double shift atau waktu istirahat < 11 jam dan memberi peringatan.",
    color: "#EF4444",
    bg: "#FEF2F2",
  },
  {
    icon: FileSpreadsheet,
    title: "Ekspor Excel & Gambar",
    desc: "Export jadwal ke file .xlsx siap cetak atau simpan sebagai gambar PNG resolusi tinggi.",
    color: "#10B981",
    bg: "#ECFDF5",
  },
  {
    icon: Wifi,
    title: "100% Offline",
    desc: "Setelah aktivasi pertama, semua data tersimpan di browser. Tidak perlu internet.",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
  {
    icon: Shield,
    title: "Satu Lisensi, Satu Perangkat",
    desc: "Lisensi terikat ke perangkat spesifik. Backup JSON untuk pindah perangkat kapanpun.",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-(--color-surface) text-(--color-muted) text-xs font-semibold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            Fitur Unggulan
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-(--color-fg) mb-4">
            Semua yang kamu butuhkan.
          </h2>
          <p className="text-(--color-muted) max-w-xl mx-auto">
            Didesain khusus untuk manajer operasional yang butuh solusi cepat,
            rapi, dan tidak repot install software.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="feature-card group"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="relative mb-6">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ background: f.bg }}
                  >
                    {typeof f.icon === "string" ? (
                      <img
                        src={f.icon}
                        alt={f.title}
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      <f.icon
                        className="w-5 h-5"
                        style={{ color: f.color }}
                        strokeWidth={2}
                      />
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-[15px] text-(--color-fg) mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-(--color-muted) leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
