"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Users, Clock } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero-gradient min-h-screen flex items-center px-6 pt-32 pb-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Column: Text & CTA */}
        <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#D0F500]/20 border border-[#D0F500]/40 text-[#6b7c00] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 animate-fade-up">
            <img
              src="/assets/logo-lime.svg"
              alt="Logo"
              className="w-3.5 h-3.5 object-contain"
            />
            100% Local-First · Tanpa Server Bulanan
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl font-black tracking-tight text-(--color-fg) leading-[1.05] mb-6 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            Jadwal Shift
            <br />
            <span className="relative inline-block text-[#c1e300] border border-black/40">
              Tanpa Ribet.
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-md font-light md:text-lg text-(--color-muted) max-w-xl leading-relaxed mb-8 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            Kelola jadwal kerja karyawan dengan mudah. Auto-rolling shift,
            deteksi konflik otomatis, dan ekspor ke Excel.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col  items-center lg:items-start gap-8">
            <Link
              href="/activate"
              className="bg-black flex  text-white text-base px-8 py-3.5 animate-fade-up transition-all duration-300"
              style={{ animationDelay: "0.3s" }}
            >
              Kelola Shift
              <ArrowRight className="w-5 h-5" />
            </Link>
            {/* Social Proof */}
            <div
              className="flex items-center gap-3 animate-fade-up mt-2"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 15}`}
                      alt="User"
                      className="w-full h-full"
                    />
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-3.5 h-3.5 bg-amber-600 clip-star"
                      style={{
                        clipPath:
                          "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs font-semibold text-(--color-fg) mt-0.5">
                  Sederhanakan Operasional <br />
                  Tim Anda dengan{" "}
                  <span className="text-amber-600">Vibe Premium.</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Mock Preview */}
        <div
          className="relative w-full max-w-2xl mx-auto lg:mr-0 animate-fade-up"
          style={{ animationDelay: "0.45s" }}
        >
          <div className="bg-white/80 rounded-2xl border border-black/40 p-6 backdrop-blur-sm relative z-10 rotate-1 hover:rotate-0 transition-transform duration-700">
            {/* Mock calendar header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex md:flex-row flex-col md:items-center items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shadow-lg">
                  <Clock className="w-4 h-4 text-[#D0F500]" />
                </div>
                <div>
                  <p className="font-bold text-sm text-(--color-fg)">
                    Jadwal Februari 2026
                  </p>
                  <p className="text-xs text-(--color-muted)">
                    12 Karyawan · 3 Tipe Shift
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-md w-fit mx-auto lg:mx-0"></div>
                <div className="bg-(--color-primary) text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm">
                  Export Excel
                </div>
              </div>
            </div>

            {/* Mock grid rows */}
            <div className="space-y-2.5">
              {[
                {
                  name: "Budi S.",
                  initials: "BS",
                  shifts: ["P", "P", "M", "M", "L", "L", "S"],
                },
                {
                  name: "Citra A.",
                  initials: "CA",
                  shifts: ["M", "M", "L", "L", "S", "S", "P"],
                },
                {
                  name: "Deni R.",
                  initials: "DR",
                  shifts: ["L", "L", "S", "S", "P", "P", "M"],
                },
              ].map((row, ri) => (
                <div
                  key={ri}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/2 transition-colors"
                >
                  <div className="w-32 flex items-center gap-3 shrink-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm"
                      style={{
                        background: ["#3B82F6", "#8B5CF6", "#EC4899"][ri],
                      }}
                    >
                      {row.initials}
                    </div>
                    <span className="text-sm font-semibold truncate text-(--color-fg)">
                      {row.name}
                    </span>
                  </div>
                  <div className="flex gap-1.5 overflow-hidden flex-1">
                    {row.shifts.map((s, si) => (
                      <div
                        key={si}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm transition-transform hover:scale-110"
                        style={{
                          background:
                            s === "P"
                              ? "#3B82F6"
                              : s === "S"
                                ? "#F59E0B"
                                : s === "M"
                                  ? "#8B5CF6"
                                  : "#E5E7EB",
                          color: s === "L" ? "#6B7280" : "white",
                        }}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-black/5">
              {[
                { code: "P", label: "Pagi", color: "#3B82F6" },
                { code: "S", label: "Siang", color: "#F59E0B" },
                { code: "M", label: "Malam", color: "#8B5CF6" },
                { code: "L", label: "Libur", color: "#E5E7EB" },
              ].map((s) => (
                <div key={s.code} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: s.color }}
                  />
                  <span className="text-xs text-(--color-muted) font-medium">
                    {s.label}
                  </span>
                </div>
              ))}
              <div className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-md">
                ✅ Aman
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-(--color-primary)/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse-subtle" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-(--color-primary)/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
        </div>
      </div>
    </section>
  );
}
