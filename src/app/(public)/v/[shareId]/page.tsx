"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Info,
  ArrowRight,
  User,
  AlertCircle,
} from "lucide-react";
import { cn, formatDateId, toDateString } from "@/lib/utils";
import type { Employee, ShiftType, ScheduleEntry } from "@/types";

interface SharedData {
  employees: Employee[];
  shiftTypes: ShiftType[];
  schedules: ScheduleEntry[];
  days: string[];
  monthName: string;
}

export default function PublicSchedulePage() {
  const { shareId } = useParams();
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayDate] = useState(toDateString(new Date()));

  useEffect(() => {
    async function fetchShare() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data: share, error: fetchError } = await supabase
          .from("public_shares")
          .select("data")
          .eq("id", shareId)
          .single();

        if (fetchError)
          throw new Error(
            "Jadwal tidak ditemukan atau link sudah kedaluwarsa.",
          );
        setData(share.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (shareId) fetchShare();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8FA] flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 border-4 border-black border-t-[#D0F500] rounded-full animate-spin mb-4" />
        <p className="font-black text-sm uppercase tracking-widest text-(--color-muted)">
          Memuat Jadwal...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F8F8FA] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 border border-red-100">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-black mb-4">Akses Gagal</h1>
        <p className="text-(--color-muted) font-medium max-w-xs mb-8">
          {error || "Jadwal tidak tersedia saat ini."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="h-14 px-8 bg-black text-white rounded-2xl font-black text-sm"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const shiftMap = new Map(data.shiftTypes.map((s) => [s.id!, s]));
  const scheduleLookup = new Map(
    data.schedules.map((s) => [`${s.employeeId}-${s.date}`, s]),
  );

  const todayOnDuty = data.employees
    .map((emp) => {
      const entry = scheduleLookup.get(`${emp.id}-${todayDate}`);
      const shift = entry ? shiftMap.get(entry.shiftTypeId) : null;
      return { emp, shift };
    })
    .filter((item) => item.shift && !item.shift.isOff);

  return (
    <div className="min-h-screen bg-[#F8F8FA] pb-10">
      {/* Top Banner */}
      <div className="bg-black text-white px-6 pt-12 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D0F500]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="w-10 h-10 bg-[#D0F500] rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-black" />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#D0F500] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {data.monthName}
            </span>
          </div>
        </div>
        <h1 className="text-4xl font-black tracking-tighter relative z-10">
          Status <br />
          <span className="text-[#D0F500]">Jadwal Kerja.</span>
        </h1>
      </div>

      <div className="px-6 -mt-12 relative z-20 space-y-8">
        {/* Today's Duty Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-black text-sm uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D0F500]" />
              Staf Bertugas Hari Ini
            </h2>
          </div>

          {todayOnDuty.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {todayOnDuty.map(({ emp, shift }) => (
                <div
                  key={emp.id}
                  className="min-w-[180px] bg-white rounded-3xl p-5 border border-black/15 shadow-sm shadow-black/2 shrink-0"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-sm"
                      style={{ background: emp.color }}
                    >
                      {emp.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-black text-xs text-black truncate leading-none">
                        {emp.name}
                      </p>
                      <p className="text-[8px] font-black text-(--color-muted) uppercase tracking-widest mt-1">
                        {emp.position}
                      </p>
                    </div>
                  </div>
                  <div className="py-2.5 px-4 rounded-xl border border-black/5 bg-[#F8F8FA] flex items-center justify-between">
                    <span className="text-[10px] font-black">
                      {shift?.code}
                    </span>
                    <span className="text-[10px] font-bold text-(--color-muted)">
                      {shift?.startTime} — {shift?.endTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-black/15 text-center">
              <p className="text-sm font-medium text-(--color-muted)">
                Tidak ada jadwal tugas untuk hari ini.
              </p>
            </div>
          )}
        </section>

        {/* Calendar Overview */}
        <section className="bg-white rounded-[32px] border border-black/15 shadow-xl shadow-black/2 overflow-hidden">
          <div className="p-6 border-b border-black/5 bg-gray-50/50 flex items-center justify-between">
            <h2 className="font-black text-black text-sm uppercase tracking-widest">
              Kalender Lengkap
            </h2>
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shadow-lg">
              <Clock className="w-4 h-4 text-[#D0F500]" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#F8F8FA]">
                  <th className="sticky left-0 bg-[#F8F8FA] z-10 px-6 py-5 text-left border-b border-r border-black/15">
                    <span className="text-[10px] font-black uppercase tracking-widest text-(--color-muted)">
                      Staf
                    </span>
                  </th>
                  {data.days.map((date) => {
                    const dayNum = date.split("-")[2];
                    return (
                      <th
                        key={date}
                        className="px-3 py-5 text-center border-b border-r border-black/15 min-w-[50px]"
                      >
                        <span className="text-[11px] font-black">
                          {parseInt(dayNum)}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {data.employees.map((emp, ri) => (
                  <tr
                    key={emp.id}
                    className={ri % 2 === 0 ? "bg-white" : "bg-gray-50/30"}
                  >
                    <td
                      className={cn(
                        "sticky left-0 z-10 px-6 py-4 border-b border-r border-black/15 transition-colors",
                        ri % 2 === 0 ? "bg-white" : "bg-[#F8F8FA]",
                      )}
                    >
                      <p className="text-xs font-black text-black whitespace-nowrap">
                        {emp.name}
                      </p>
                    </td>
                    {data.days.map((date) => {
                      const entry = scheduleLookup.get(`${emp.id}-${date}`);
                      const shift = entry
                        ? shiftMap.get(entry.shiftTypeId)
                        : null;

                      return (
                        <td
                          key={date}
                          className="border-b border-r border-black/15 p-1 text-center"
                        >
                          {shift && !shift.isOff && (
                            <div
                              className="w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-[9px] font-black text-white shadow-sm"
                              style={{ background: shift.color }}
                            >
                              {shift.code}
                            </div>
                          )}
                          {shift?.isOff && (
                            <div className="w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-[9px] font-black text-(--color-muted) bg-gray-100/50">
                              OFF
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Shift Legend */}
        <section className="bg-black text-white rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D0F500]/5 rounded-full blur-3xl" />
          <h3 className="font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#D0F500]" />
            Keterangan Shift
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {data.shiftTypes.map((shift) => (
              <div
                key={shift.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-lg"
                    style={{ background: shift.color }}
                  >
                    {shift.code}
                  </div>
                  <div>
                    <p className="font-black text-xs">{shift.name}</p>
                    <p className="text-[10px] font-bold text-white/40">
                      {shift.startTime} — {shift.endTime}
                    </p>
                  </div>
                </div>
                {shift.isOff && (
                  <span className="text-[9px] font-black bg-white/10 px-3 py-1.5 rounded-full text-white/60">
                    LIBUR
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-[10px] font-black text-(--color-muted) uppercase tracking-widest">
          Powered by ShiftPlanner. Premium Local Workspace.
        </p>
      </div>
    </div>
  );
}
