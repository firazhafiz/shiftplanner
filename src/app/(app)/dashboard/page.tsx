"use client";

import { useEffect, useState, useCallback } from "react";
import { getDB } from "@/lib/db/db";
import { detectConflicts } from "@/lib/schedule/conflicts";
import type {
  Employee,
  ShiftType,
  ScheduleEntry,
  ScheduleConflict,
} from "@/types";
import {
  Users,
  Clock,
  CalendarDays,
  AlertTriangle,
  TrendingUp,
  Plus,
  ChevronRight,
  Database,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { cn, formatDateId } from "@/lib/utils";
import { seedDatabase } from "@/lib/db/seed";
import { toast } from "sonner";
import ConfirmModal from "@/components/shared/ConfirmModal";

interface Stats {
  employees: number;
  shiftTypes: number;
  scheduledDays: number;
  conflicts: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    employees: 0,
    shiftTypes: 0,
    scheduledDays: 0,
    conflicts: 0,
  });
  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const db = getDB();
      const [employees, shiftTypes, schedules] = await Promise.all([
        db.getAllEmployees(),
        db.getAllShiftTypes(),
        db.getScheduleForMonth(year, month),
      ]);
      const conflicts = detectConflicts(schedules, shiftTypes);
      setStats({
        employees: employees.length,
        shiftTypes: shiftTypes.length,
        scheduledDays: schedules.length,
        conflicts: conflicts.length,
      });
      setRecentEmployees(employees.slice(-4).reverse());
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSeed = async (force = false) => {
    if (force && !showSeedConfirm) {
      setShowSeedConfirm(true);
      return;
    }

    try {
      setLoading(true);
      await seedDatabase(force);
      toast.success(
        force ? "Data berhasil di-reset!" : "Data demo berhasil dimuat!",
      );
      // Ensure UI reflects changes immediately
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setShowSeedConfirm(false);
    }
  };

  const statCards = [
    {
      label: "Total Karyawan",
      sub: "Aktif terdaftar",
      value: stats.employees,
      icon: Users,
      color: "#3B82F6",
      bg: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
      href: "/employees",
    },
    {
      label: "Master Shift",
      sub: "Variasi jam kerja",
      value: stats.shiftTypes,
      icon: Clock,
      color: "#8B5CF6",
      bg: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
      href: "/shifts",
    },
    {
      label: "Draft Jadwal",
      sub: "Bulan ini",
      value: stats.scheduledDays,
      icon: CalendarDays,
      color: "#10B981",
      bg: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      href: "/schedule",
    },
    {
      label: "Konflik Shift",
      sub: "Butuh perhatian",
      value: stats.conflicts,
      icon: AlertTriangle,
      color: stats.conflicts > 0 ? "#EF4444" : "#D0F500",
      bg:
        stats.conflicts > 0
          ? "linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)"
          : "linear-gradient(135deg, #09090b 0%, #27272a 100%)",
      href: "/schedule",
    },
  ];

  return (
    <div className="min-h-screen p-8 pt-10 max-w-8xl mx-auto space-y-12 bg-[#F8F8FA]">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-[#D0F500]/20 border border-[#D0F500]/40 text-[#6b7c00] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-2">
              <img
                src="/assets/logo-lime.svg"
                alt="Logo"
                className="w-3.5 h-3.5 object-contain"
              />
              Workspace Aktif
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-(--color-fg) tracking-tighter leading-none">
              Ringkasan <span className="text-[#c1e300]">Dashboard.</span>
            </h1>
            <p className="text-(--color-muted) font-medium text-sm md:text-base mt-3">
              Pantau seluruh operasional tim Anda dalam satu tampilan cerdas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-end">
          <div className="px-6 py-3 rounded-md bg-white border border-black/15 text-xs font-black text-(--color-fg) flex items-center gap-3 uppercase tracking-widest">
            <CalendarDays className="w-4 h-4 text-[#D0F500]" />
            {formatDateId(now, "MMMM yyyy")}
          </div>
          {!loading && stats.employees > 0 && (
            <button
              onClick={() => handleSeed(true)}
              className="px-6 py-3 bg-red-100 text-red-600 border border-red-200 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all group"
              title="Reset data ke demo"
            >
              <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              <span className="hidden md:block">Reset Demo</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-[32px] bg-white border border-black/5 animate-pulse shadow-sm"
            />
          ))}
        </div>
      ) : stats.employees === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-black/15 relative overflow-hidden transition-all animate-fade-up">
          {/* Decorative background */}
          <div className="absolute top-0 left-0 w-full h-1 bg-[#D0F500]" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#D0F500]/10 rounded-full blur-3xl" />

          <div className="w-12 h-12 rounded-xl bg-(--color-primary) flex items-center justify-center mb-10 border border-black/5 animate-bounce-subtle">
            <Sparkles className="w-6 h-6 text-black" strokeWidth={2.5} />
          </div>

          <h2 className="text-3xl font-black text-(--color-fg) mb-4 tracking-tighter">
            Workspace Menanti <span className="text-[#c1e300]">Anda.</span>
          </h2>
          <p className="text-(--color-muted) text-lg mb-12 max-w-lg font-light leading-relaxed">
            Database Anda masih kosong. Mulai dengan membuat data karyawan atau
            gunakan fitur demo untuk melihat keajaiban ShiftPlanner.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <Link
              href="/employees"
              className="btn-primary py-4 px-12 rounded-md text-lg flex items-center gap-3 hover:scale-105 active:scale-95 transition-transform"
            >
              <Plus className="w-6 h-6" strokeWidth={3} /> Buat Manual
            </Link>
            <button
              onClick={() => handleSeed(false)}
              className="py-4 px-12 bg-black text-white rounded-md font-black text-lg flex items-center gap-3 hover:scale-105 active:scale-95 transition-all "
            >
              <Database className="w-6 h-6" /> Isi Data Demo
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-up">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <Link
                  key={i}
                  href={card.href}
                  className="group relative bg-white rounded-2xl p-5 md:p-8 border border-black/15 hover:shadow-2xl hover:shadow-[#D0F500]/10 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                >
                  <div className="relative z-10">
                    <div
                      className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-8 shadow-sm transition-transform duration-500 group-hover:rotate-6"
                      style={{ background: card.bg }}
                    >
                      <Icon
                        className="w-5 h-5 md:w-7 md:h-7 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                    <div className="space-y-0.5 md:space-y-1">
                      <p className="text-3xl md:text-5xl font-black text-(--color-fg) tracking-tighter tabular-nums">
                        {card.value}
                      </p>
                      <p className="text-[10px] md:text-sm font-black text-(--color-fg) uppercase tracking-wide">
                        {card.label}
                      </p>
                      <p className="hidden md:block text-xs text-(--color-muted) font-bold">
                        {card.sub}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-up "
            style={{ animationDelay: "0.1s" }}
          >
            {/* Recent Employees List */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 md:p-10 border border-black/15 shadow-sm">
              <div className="flex items-center justify-between mb-8 md:mb-10">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-(--color-fg) tracking-tight">
                    Karyawan <span className="text-[#c1e300]">Terbaru.</span>
                  </h2>
                  <p className="text-[10px] text-(--color-muted) font-black uppercase tracking-widest mt-1">
                    Update Terakhir Tim
                  </p>
                </div>
                <Link
                  href="/employees"
                  className="h-10 px-4 md:px-6 bg-black text-white rounded-xl text-[10px] md:text-xs font-black hover:bg-black/90 transition-all flex items-center gap-2"
                >
                  Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {recentEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-4 md:gap-5 p-3 md:p-5 rounded-2xl bg-[#F8F8FA] border border-black/5 hover:border-[#D0F500]/50 hover:bg-white hover:shadow-lg transition-all group cursor-pointer"
                  >
                    <div
                      className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[20px] flex items-center justify-center text-sm md:text-lg font-black text-white shadow-md"
                      style={{ background: emp.color }}
                    >
                      {emp.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-base md:text-lg font-black text-(--color-fg) truncate">
                        {emp.name}
                      </p>
                      <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest leading-none mt-1"></p>
                    </div>
                    <Link
                      href="/employees"
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-md border border-black/5 hover:bg-black hover:text-white transition-all group"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Profil
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="lg:col-span-4 bg-black text-white rounded-2xl p-6 md:p-10 relative overflow-hidden flex flex-col justify-between shadow-xl shadow-black/10">
              <div className="relative z-10">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#D0F500] flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-[#D0F500]/20">
                  <TrendingUp
                    className="w-5 h-5 md:w-6 md:h-6 text-black"
                    strokeWidth={3}
                  />
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-2 tracking-tighter">
                  Panel <span className="text-[#D0F500]">Kendali.</span>
                </h2>
                <p className="text-white/50 text-xs md:text-sm font-medium mb-8 md:mb-10">
                  Aksi cepat untuk pengaturan workspace
                </p>

                <div className="space-y-3 md:space-y-4">
                  <Link
                    href="/employees"
                    className="flex items-center gap-4 p-4 md:p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-[#D0F500]/30 transition-all group"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white flex items-center justify-center shadow-inner">
                      <Users className="w-5 h-5 md:w-6 md:h-6 text-black" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-xs md:text-sm">Tim Saya</p>
                      <p className="text-[9px] md:text-[10px] text-white/40 font-bold uppercase tracking-wider">
                        Kelola data staf
                      </p>
                    </div>
                    <Plus
                      className="w-4 h-4 md:w-5 md:h-5 text-white/30 group-hover:text-[#D0F500] transition-colors"
                      strokeWidth={3}
                    />
                  </Link>
                  <Link
                    href="/schedule"
                    className="flex items-center gap-4 p-4 md:p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-400/30 transition-all group"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#D0F500] flex items-center justify-center shadow-inner">
                      <CalendarDays className="w-5 h-5 md:w-6 md:h-6 text-black" />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-xs md:text-sm">
                        Susun Jadwal
                      </p>
                      <p className="text-[9px] md:text-[10px] text-white/40 font-bold uppercase tracking-wider">
                        Bulan {formatDateId(now, "MMM")}
                      </p>
                    </div>
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white/30 group-hover:text-amber-400 transition-colors" />
                  </Link>
                </div>
              </div>

              {/* Decorative Glow */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#D0F500]/20 blur-[100px] pointer-events-none" />

              <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-white/10 relative z-10 text-center">
                <p className="text-[9px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                  ShiftPlanner Pro 1.0
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        open={showSeedConfirm}
        onOpenChange={setShowSeedConfirm}
        title="Reset Data ke Demo?"
        description="Tindakan ini akan MENGHAPUS SEMUA data karyawan, shift, dan jadwal Anda saat ini secara permanen dan menggantinya dengan data dummy. Lanjutkan?"
        onConfirm={() => handleSeed(true)}
        confirmText="Ya, Reset Sekarang"
        variant="danger"
      />
    </div>
  );
}
