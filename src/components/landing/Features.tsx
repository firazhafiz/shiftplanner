"use client";

import {
  Zap,
  DollarSign,
  Palette,
  ShieldCheck,
  UserCheck,
  FileDown,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Penjadwalan Otomatis (Auto-Rolling)",
    desc: "Tinggalkan Excel manual. Terapkan pola shift (2-2-2 dsb) ke seluruh bulan hanya dalam hitungan detik.",
    color: "#D0F500",
    bg: "#FAFFD4",
  },
  {
    icon: DollarSign,
    title: "Estimasi Biaya (Labor Cost)",
    desc: "Pantau budget operasional secara real-time. Hitung total gaji berdasarkan tarif per tipe shift secara otomatis.",
    color: "#10B981",
    bg: "#ECFDF5",
  },
  {
    icon: Palette,
    title: "Identitas Brand Kustom",
    desc: "Sesuaikan warna tema, pasang logo, dan beri nama bisnis Anda sendiri agar aplikasi terasa eksklusif milik Anda.",
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    icon: ShieldCheck,
    title: "Keamanan Data Lokal (Privacy First)",
    desc: "100% data tersimpan di browser Anda. Tidak ada risiko kebocoran data di cloud. Privasi bisnis Anda terjaga total.",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
  {
    icon: UserCheck,
    title: "Manajemen Ketersediaan",
    desc: "Hindari salah jadwal. Monitor hari libur, cuti, dan ketersediaan karyawan lewat deteksi konflik pintar.",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    icon: FileDown,
    title: "Ekspor Profesional Sekali Klik",
    desc: "Unduh jadwal dalam format Excel (.xlsx) siap cetak atau gambar (PNG) beresolusi tinggi lengkap dengan logo Anda.",
    color: "#EF4444",
    bg: "#FEF2F2",
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
