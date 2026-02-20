"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getDB } from "@/lib/db/db";
import { detectConflicts, getConflictForCell } from "@/lib/schedule/conflicts";
import { generateRollingSchedule } from "@/lib/schedule/rolling";
import { exportToExcel } from "@/lib/export/excelExport";
import { exportScheduleAsImage } from "@/lib/export/imageExport";
import type {
  Employee,
  ShiftType,
  ScheduleEntry,
  ScheduleConflict,
  RollingPattern,
  AppSettings,
} from "@/types";
import { getDaysOfMonth, formatDateId, toDateString, cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Plus,
  X,
  FileSpreadsheet,
  Image as ImageIcon,
  Users,
  RotateCcw,
  Check,
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  SortAsc,
  Globe,
  Share2,
  Copy,
  ExternalLink,
  Search,
  Settings as SettingsIcon,
  Coffee,
} from "lucide-react";
import Link from "next/link";
import { format, getDaysInMonth } from "date-fns";
import { toast } from "sonner";

// ── Assign Cell Modal ────────────────────────────────────────
function AssignModal({
  employee,
  date,
  currentShift,
  shiftTypes,
  onAssign,
  onClear,
  onClose,
  conflict,
}: {
  employee: Employee;
  date: string;
  currentShift?: ShiftType;
  shiftTypes: ShiftType[];
  conflict?: ScheduleConflict;
  onAssign: (shiftTypeId: number) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-up">
        <div className="flex items-center justify-between p-5 border-b border-(--color-border)">
          <div>
            <p className="font-bold text-sm">{employee.name}</p>
            <p className="text-xs text-(--color-muted)">
              {formatDateId(date, "EEEE, d MMM yyyy")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-(--color-surface)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {conflict && (
            <div className="flex items-center gap-2 p-2.5 bg-red-50 rounded-xl mb-3 text-red-700 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {conflict.message}
            </div>
          )}
          {shiftTypes.map((shift) => (
            <button
              key={shift.id}
              onClick={() => onAssign(shift.id!)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all hover:scale-[1.01]",
                currentShift?.id === shift.id
                  ? "border-(--color-primary) bg-[#D0F500]/10"
                  : "border-transparent hover:border-(--color-border) hover:bg-(--color-surface)",
              )}
            >
              <div
                className="shift-badge"
                style={{
                  background: shift.color,
                  color: "white",
                  width: 32,
                  height: 32,
                  fontSize: "0.7rem",
                }}
              >
                {shift.code}
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-sm">{shift.name}</p>
                <p className="text-xs text-(--color-muted)">
                  {shift.isOff
                    ? "Hari Libur"
                    : `${shift.startTime} – ${shift.endTime}`}
                </p>
              </div>
              {currentShift?.id === shift.id && (
                <Check className="w-4 h-4 text-[#758000]" />
              )}
            </button>
          ))}
          {currentShift && (
            <button
              onClick={onClear}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm mt-1"
            >
              <RotateCcw className="w-4 h-4" />
              Hapus Shift
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Rolling Config Modal ─────────────────────────────────────
function RollingModal({
  employees,
  shiftTypes,
  onApply,
  onClose,
}: {
  employees: Employee[];
  shiftTypes: ShiftType[];
  onApply: (
    employeeId: number,
    pattern: RollingPattern[],
    offset: number,
  ) => Promise<void>;
  onClose: () => void;
}) {
  const [selectedEmp, setSelectedEmp] = useState<number | "all">("all");
  const [pattern, setPattern] = useState<RollingPattern[]>(
    shiftTypes.map((s) => ({ shiftTypeId: s.id!, duration: 2 })),
  );
  const [offset, setOffset] = useState(0);
  const [applying, setApplying] = useState(false);

  const updateDuration = (idx: number, val: number) => {
    setPattern((prev) =>
      prev.map((p, i) =>
        i === idx ? { ...p, duration: Math.max(1, val) } : p,
      ),
    );
  };

  const handleApply = async () => {
    setApplying(true);
    if (selectedEmp === "all") {
      for (const emp of employees) {
        await onApply(emp.id!, pattern, offset);
      }
    } else {
      await onApply(selectedEmp, pattern, offset);
    }
    setApplying(false);
    onClose();
  };

  const totalCycle = pattern.reduce((s, p) => s + p.duration, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-(--color-border)">
          <div>
            <p className="font-bold">Rolling Shift Otomatis</p>
            <p className="text-xs text-(--color-muted)">
              Total siklus: {totalCycle} hari
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-(--color-surface)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Employee selector */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Terapkan ke
            </label>
            <select
              value={selectedEmp}
              onChange={(e) =>
                setSelectedEmp(
                  e.target.value === "all" ? "all" : parseInt(e.target.value),
                )
              }
              className="input-field"
            >
              <option value="all">Semua Karyawan</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pattern config */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Pola Siklus
            </label>
            <div className="space-y-2">
              {shiftTypes.map((shift, idx) => (
                <div
                  key={shift.id}
                  className="flex items-center gap-3 p-3 bg-(--color-surface) rounded-xl"
                >
                  <div
                    className="shift-badge shrink-0"
                    style={{
                      background: shift.color,
                      color: "white",
                      width: 32,
                      height: 32,
                      fontSize: "0.7rem",
                    }}
                  >
                    {shift.code}
                  </div>
                  <span className="flex-1 text-sm font-medium">
                    {shift.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateDuration(idx, (pattern[idx]?.duration ?? 2) - 1)
                      }
                      className="w-7 h-7 rounded-lg border border-(--color-border) flex items-center justify-center hover:bg-white"
                    >
                      –
                    </button>
                    <span className="text-sm font-bold w-6 text-center">
                      {pattern[idx]?.duration ?? 2}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateDuration(idx, (pattern[idx]?.duration ?? 2) + 1)
                      }
                      className="w-7 h-7 rounded-lg border border-(--color-border) flex items-center justify-center hover:bg-white"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-(--color-muted) w-8">hari</span>
                </div>
              ))}
            </div>
          </div>

          {/* Offset */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Offset Siklus (hari ke-)
            </label>
            <input
              type="number"
              value={offset}
              onChange={(e) =>
                setOffset(Math.max(0, parseInt(e.target.value) || 0))
              }
              className="input-field"
              min={0}
              max={totalCycle - 1}
            />
            <p className="text-xs text-(--color-muted) mt-1 leading-relaxed">
              0 = mulai dari awal siklus. Sistem otomatis melompati hari libur
              toko tanpa memutus urutan pola (pola akan "berhenti sejenak" saat
              toko tutup).
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline flex-1 justify-center"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={applying}
              className="btn-primary flex-1 justify-center"
            >
              {applying ? "Menerapkan..." : "Terapkan ke Bulan Ini"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Business Settings Modal ─────────────────────────────────
function BusinessSettingsModal({
  settings,
  onSave,
  onClose,
}: {
  settings: AppSettings;
  onSave: (settings: AppSettings) => Promise<void>;
  onClose: () => void;
}) {
  const [tempSettings, setTempSettings] = useState<AppSettings>(settings);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(tempSettings);
    setSaving(false);
    onClose();
  };

  const toggleDay = (day: number) => {
    const next = tempSettings.shopClosedDays.includes(day)
      ? tempSettings.shopClosedDays.filter((d) => d !== day)
      : [...tempSettings.shopClosedDays, day];
    setTempSettings({ ...tempSettings, shopClosedDays: next });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-up">
        <div className="flex items-center justify-between p-5 border-b border-(--color-border)">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
              <Coffee className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-sm">Konfigurasi Bisnis</p>
              <p className="text-[10px] text-(--color-muted) font-black uppercase tracking-widest">
                Aturan Operasional
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-(--color-surface)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <label className="text-[10px] font-black text-(--color-muted)/40 uppercase mb-4 block tracking-widest">
              Hari Libur Rutin (Toko Tutup)
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 1, label: "Sen" },
                { id: 2, label: "Sel" },
                { id: 3, label: "Rab" },
                { id: 4, label: "Kam" },
                { id: 5, label: "Jum" },
                { id: 6, label: "Sab" },
                { id: 0, label: "Min" },
              ].map((day) => {
                const isSelected = tempSettings.shopClosedDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className={cn(
                      "w-10 h-10 rounded-xl text-[10px] font-black transition-all border",
                      isSelected
                        ? "bg-black text-[#D0F500] border-black scale-105"
                        : "bg-[#F8F8FA] text-black border-black/5 hover:border-black/15",
                    )}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-(--color-muted)/40 uppercase mb-4 block tracking-widest">
              Minimum Istirahat ({tempSettings.minRestHours} jam)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="8"
                max="16"
                step="0.5"
                value={tempSettings.minRestHours}
                onChange={(e) =>
                  setTempSettings({
                    ...tempSettings,
                    minRestHours: parseFloat(e.target.value),
                  })
                }
                className="flex-1 accent-black h-2 bg-[#F8F8FA] rounded-full appearance-none border border-black/5"
              />
              <div className="w-12 h-10 rounded-xl bg-black flex items-center justify-center font-black text-xs text-[#D0F500] shadow-lg">
                {tempSettings.minRestHours}h
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2 ">
            <button
              onClick={onClose}
              className=" border rounded-full  cursor-pointer flex-1 justify-center"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-(--color-primary) cursor-pointer py-3 rounded-full flex-1 justify-center"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Schedule Page ───────────────────────────────────────
export default function SchedulePage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [appSettings, setAppSettings] = useState<AppSettings | undefined>();

  const [assignModal, setAssignModal] = useState<{
    employee: Employee;
    date: string;
    currentShift?: ShiftType;
  } | null>(null);
  const [rollingModal, setRollingModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [exportingImg, setExportingImg] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: "name" | "position" | "total";
    direction: "asc" | "desc";
  }>({ key: "name", direction: "asc" });

  const [isPublishing, setIsPublishing] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const days = getDaysOfMonth(year, month);
  const shiftMap = new Map(shiftTypes.map((s) => [s.id!, s]));

  // Schedule lookup: "${empId}-${date}" → ScheduleEntry
  const scheduleLookup = new Map(
    schedules.map((s) => [`${s.employeeId}-${s.date}`, s]),
  );

  // Filtering & Sorting Logic
  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()),
  );

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (sortConfig.key === "name") {
      return sortConfig.direction === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortConfig.key === "position") {
      return sortConfig.direction === "asc"
        ? a.position.localeCompare(b.position)
        : b.position.localeCompare(a.position);
    }
    if (sortConfig.key === "total") {
      const getWorkCount = (empId: number) => {
        return schedules.filter(
          (s) => s.employeeId === empId && !shiftMap.get(s.shiftTypeId)?.isOff,
        ).length;
      };
      const countA = getWorkCount(a.id!);
      const countB = getWorkCount(b.id!);
      return sortConfig.direction === "asc" ? countA - countB : countB - countA;
    }
    return 0;
  });

  const loadData = useCallback(async () => {
    const db = getDB();
    const [emps, shifts, sched, settings] = await Promise.all([
      db.getAllEmployees(),
      db.getAllShiftTypes(),
      db.getScheduleForMonth(year, month),
      db.getAppSettings(),
    ]);
    setEmployees(emps);
    setShiftTypes(shifts);
    setSchedules(sched);
    setAppSettings(settings);
    setConflicts(detectConflicts(sched, shifts, settings));
    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCellClick = (emp: Employee, date: string) => {
    const entry = scheduleLookup.get(`${emp.id}-${date}`);
    const currentShift = entry ? shiftMap.get(entry.shiftTypeId) : undefined;
    setAssignModal({ employee: emp, date, currentShift });
  };

  const handleAssign = async (shiftTypeId: number) => {
    if (!assignModal) return;
    const db = getDB();
    await db.upsertSchedule({
      employeeId: assignModal.employee.id!,
      date: assignModal.date,
      shiftTypeId,
      createdAt: new Date(),
    });
    setAssignModal(null);
    await loadData();
  };

  const handleClear = async () => {
    if (!assignModal) return;
    const db = getDB();
    await db.deleteSchedule(assignModal.employee.id!, assignModal.date);
    setAssignModal(null);
    await loadData();
  };

  const handleRollingApply = async (
    employeeId: number,
    pattern: RollingPattern[],
    offset: number,
  ) => {
    const entries = generateRollingSchedule(
      employeeId,
      year,
      month,
      pattern,
      offset,
      appSettings?.shopClosedDays || [],
    );
    const db = getDB();
    await db.bulkSetSchedules(entries);
    await loadData();
  };

  const handleSettingsSave = async (newSettings: AppSettings) => {
    const db = getDB();
    await db.saveAppSettings(newSettings);
    await loadData();
    toast.success("Konfigurasi bisnis berhasil diperbarui!");
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const db = getDB();
      const auth = await db.getAuthConfig();
      if (!auth) throw new Error("Aktivasi lisensi diperlukan");

      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: auth.hardwareId,
          month,
          year,
          data: {
            employees,
            shiftTypes,
            schedules,
            days,
            monthName: formatDateId(new Date(year, month - 1, 1), "MMMM yyyy"),
          },
        }),
      });

      const result = await res.json();
      if (result.success) {
        setShareId(result.shareId);
        setShowShareModal(true);
        toast.success("Jadwal berhasil dipublikasikan!");
      } else {
        toast.error(result.message || "Gagal mempublikasikan jadwal");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleExportExcel = async () => {
    exportToExcel(employees, shiftTypes, schedules, year, month);
  };

  const handleExportImage = async () => {
    setExportingImg(true);
    try {
      await exportScheduleAsImage(
        "schedule-grid",
        `jadwal-${year}-${String(month).padStart(2, "0")}.png`,
      );
    } finally {
      setExportingImg(false);
    }
  };

  const prevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else setMonth((m) => m + 1);
  };

  return (
    <div className="min-h-screen p-8 pt-10 max-w-[1700px] mx-auto space-y-8 bg-[#F8F8FA]">
      {/* ── Title & Global Status ──────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-(--color-fg)">
            Manajemen <span className="text-[#c1e300]">Jadwal.</span>
          </h1>
          <p className="text-(--color-muted) font-medium text-sm md:text-base">
            Atur rotasi shift dan pantau ketersediaan tim secara real-time.
          </p>
        </div>

        {conflicts.length > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 text-xs font-black px-6 py-4 rounded-md shadow-sm animate-pulse-subtle w-fit">
            <AlertTriangle className="w-4 h-4" />
            {conflicts.length.toString().padStart(2, "0")} KONFLIK TERDETEKSI
          </div>
        )}
      </div>

      {/* ── Toolbar Grouping ────────────────────────────────────── */}
      <div className="flex flex-col gap-6 bg-white p-6 md:p-8 rounded-xl border border-black/15">
        {/* Row 1: Context & Search */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 md:gap-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 flex-1">
            {/* Date Navigator */}
            <div className="flex items-center gap-1 p-1 bg-[#F8F8FA] rounded-md border border-black/5 shadow-inner">
              <button
                onClick={prevMonth}
                className="w-11 h-11 rounded-xl hover:bg-white hover:shadow-sm flex items-center justify-center transition-all text-black"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-6 font-bold text-xs tracking-widest text-center uppercase min-w-[180px] text-black">
                {formatDateId(new Date(year, month - 1, 1), "MMMM yyyy")}
              </div>
              <button
                onClick={nextMonth}
                className="w-11 h-11 rounded-xl hover:bg-white hover:shadow-sm flex items-center justify-center transition-all text-black"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Employee Search */}
            <div className="relative group max-w-md flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted) group-focus-within:text-black transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari karyawan di jadwal..."
                className="w-full h-13 bg-[#F8F8FA] border border-black/5 rounded-md pl-12 pr-4 text-xs font-light outline-none focus:ring-2 focus:ring-[#D0F500] focus:bg-white transition-all text-black"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
            {/* Action Group Primary */}
            <div className="flex items-center gap-2 p-1 bg-black rounded-md">
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="h-11 px-5 bg-[#D0F500] text-black rounded-md text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isPublishing ? (
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Globe className="w-3.5 h-3.5" />
                )}
                Bagikan
              </button>
              <button
                onClick={() => setRollingModal(true)}
                className="h-11 px-5 bg-white text-black rounded-md text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 hover:bg-white/95 transition-all"
              >
                <img
                  src="/assets/logo-dark.svg"
                  alt="Logo"
                  className="w-3.5 h-3.5 object-contain"
                />
                Otomatis
              </button>
              <button
                onClick={() => setSettingsModal(true)}
                className="h-11 w-11 bg-white text-black rounded-md flex items-center justify-center hover:bg-white/95 transition-all shadow-sm"
                title="Konfigurasi Bisnis"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Action Group Secondary (Export) */}
            <div className="flex items-center gap-2 p-1 bg-(--color-primary) rounded-md border border-black/15">
              <button
                onClick={handleExportExcel}
                className="w-11 h-11 bg-black border border-black/5 text-emerald-600 rounded-md flex items-center justify-center  transition-all shadow-sm"
                title="Unduh Excel"
              >
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleExportImage}
                disabled={exportingImg}
                className="w-11 h-11 bg-black border border-black/5 text-blue-600 rounded-md flex items-center justify-center transition-all shadow-sm disabled:opacity-50"
                title="Unduh Gambar"
              >
                <ImageIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Filters & Legend */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-6 border-t border-black/5">
          {/* Sorting */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-(--color-muted) uppercase tracking-[0.2em] ml-1">
              Urutkan Berdasarkan
            </p>
            <div className="flex items-center gap-2 p-1 bg-[#F8F8FA] rounded-md border border-black/5 w-fit">
              {[
                { id: "name", label: "Nama", icon: ArrowDownAZ },
                { id: "position", label: "Jabatan", icon: ArrowDownWideNarrow },
                { id: "total", label: "Total", icon: SortAsc },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() =>
                    setSortConfig({
                      key: s.id as any,
                      direction:
                        sortConfig.key === s.id &&
                        sortConfig.direction === "asc"
                          ? "desc"
                          : "asc",
                    })
                  }
                  className={cn(
                    "h-9 px-4 rounded-md flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-wider",
                    sortConfig.key === s.id
                      ? "bg-black text-white shadow-md"
                      : "hover:bg-white text-(--color-muted)/60",
                  )}
                >
                  <s.icon
                    className={cn(
                      "w-3.5 h-3.5",
                      sortConfig.key === s.id &&
                        sortConfig.direction === "desc" &&
                        "rotate-180",
                    )}
                  />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3 lg:text-right">
            <p className="text-xs font-semibold text-(--color-muted) uppercase tracking-[0.2em] mr-1">
              Indikator Shift
            </p>
            <div className="flex flex-wrap items-center lg:justify-end gap-x-6 gap-y-2">
              {shiftTypes.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: s.color }}
                  />
                  <span className="text-xs font-black uppercase tracking-tight text-(--color-fg)">
                    {s.name} <span className="opacity-40">({s.code})</span>
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <span className="text-xs font-black uppercase text-red-500">
                  Konflik
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 min-h-[500px] flex flex-col">
        {loading ? (
          <div className="flex-1 bg-white rounded-[48px] animate-pulse border border-black/5 shadow-xl shadow-black/2" />
        ) : employees.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 bg-white rounded-xl border border-black/15 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#D0F500]" />
            <div className="w-24 h-24 rounded-[32px] bg-[#F8F8FA] flex items-center justify-center mb-10 shadow-inner">
              <Users className="w-12 h-12 text-(--color-muted)" />
            </div>
            <h2 className="text-3xl font-black text-(--color-fg) mb-3 tracking-tighter">
              Tim Anda Belum Siap.
            </h2>
            <p className="text-lg text-(--color-muted) text-center mb-12 max-w-sm font-light leading-relaxed">
              Tambahkan data karyawan dan tipe shift terlebih dahulu sebelum
              mulai menyusun jadwal operasional.
            </p>
            <Link
              href="/employees"
              className="px-10 py-4 bg-black text-white rounded-md font-black text-lg flex items-center gap-3 hover:scale-105 active:scale-95 transition-all "
            >
              Lengkapi Data Tim
            </Link>
          </div>
        ) : (
          <div
            id="schedule-grid"
            className="flex-1 overflow-auto bg-white rounded-2xl border border-black/15 scrollbar-thin"
          >
            <table className="border-collapse text-xs min-w-full">
              <thead className="sticky top-0 z-30">
                <tr className="bg-white">
                  <th className="sticky left-0 z-40 bg-white text-left px-5 py-8 border-b border-r border-black/15 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-3 w-40">
                      <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-[#D0F500]" />
                      </div>
                      <span className="font-black text-[10px] text-(--color-fg) uppercase tracking-widest truncate">
                        Karyawan
                      </span>
                    </div>
                  </th>
                  {days.map((date) => {
                    const d = new Date(date);
                    const dow = d.getDay();
                    const isWeekend = dow === 0 || dow === 6;
                    const isClosed = appSettings?.shopClosedDays.includes(dow);
                    const isToday = date === toDateString(new Date());
                    return (
                      <th
                        key={date}
                        className={cn(
                          "px-2 py-8 text-center min-w-[64px] border-b border-r border-black/15 transition-all duration-300",
                          isWeekend ? "bg-red-50/10" : "bg-white",
                          isClosed && "bg-(--color-surface)",
                          isToday && "bg-[#D0F500]/3",
                        )}
                      >
                        <div
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest mb-3",
                            isWeekend
                              ? "text-red-400"
                              : isClosed
                                ? "text-amber-500"
                                : "text-(--color-muted)/40",
                          )}
                        >
                          {isClosed
                            ? "CLOSED"
                            : ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"][
                                dow
                              ]}
                        </div>
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center mx-auto text-sm font-black transition-all duration-300",
                            isToday
                              ? "bg-black text-white shadow-xl shadow-black/20"
                              : isWeekend
                                ? "text-red-500 bg-red-50"
                                : isClosed
                                  ? "text-amber-600 bg-amber-50"
                                  : "text-(--color-fg) hover:bg-[#F8F8FA]",
                          )}
                        >
                          {parseInt(date.split("-")[2])}
                        </div>
                      </th>
                    );
                  })}
                  <th className="px-6 py-8 text-center bg-[#F8F8FA] border-b border-black/15">
                    <span className="font-black text-[11px] uppercase tracking-widest text-(--color-fg)/60">
                      Total
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedEmployees.map((emp, ri) => {
                  let workCount = 0;
                  return (
                    <tr
                      key={emp.id}
                      className={cn(
                        "group/row",
                        ri % 2 === 0 ? "bg-white" : "bg-[#F8F8FA]",
                      )}
                    >
                      <td
                        className={cn(
                          "sticky left-0 z-20 border-r border-b border-black/15 px-5 py-6 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]",
                          ri % 2 === 0 ? "bg-white" : "bg-[#F8F8FA]",
                          "group-hover/row:bg-[#f3f9d4]", // Solid light lime for hover
                        )}
                      >
                        <div className="flex items-center gap-3 w-40">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-md transition-all duration-500 group-hover/row:scale-110 group-hover/row:-rotate-3"
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
                            <p className="font-black text-[13px] text-black tracking-tight truncate leading-none">
                              {emp.name}
                            </p>
                            <p className="text-[9px] font-bold text-(--color-muted)/60 uppercase tracking-widest mt-1 truncate">
                              {emp.position}
                            </p>
                          </div>
                        </div>
                      </td>
                      {days.map((date) => {
                        const entry = scheduleLookup.get(`${emp.id}-${date}`);
                        const shift = entry
                          ? shiftMap.get(entry.shiftTypeId)
                          : undefined;
                        const conflict = getConflictForCell(
                          conflicts,
                          emp.id!,
                          date,
                        );
                        if (shift && !shift.isOff) workCount++;
                        return (
                          <td
                            key={date}
                            className={cn(
                              "border-r border-b border-black/15 p-2 text-center cursor-pointer relative group/cell transition-all duration-300",
                              conflict && "bg-red-50/20",
                              "hover:bg-[#D0F500]/5",
                            )}
                            onClick={() => handleCellClick(emp, date)}
                          >
                            {shift ? (
                              <div
                                className={cn(
                                  "w-12 h-12 rounded-xl mx-auto flex flex-col items-center justify-center text-[11px] font-black transition-all duration-300 shadow-sm relative overflow-hidden",
                                  conflict
                                    ? "ring-2 ring-red-500 ring-offset-2 scale-105 shadow-xl"
                                    : "hover:scale-110 hover:shadow-md",
                                )}
                                style={{
                                  background: shift.color,
                                  color: "white",
                                }}
                              >
                                {shift.code}
                                {conflict && (
                                  <div className="absolute top-0 right-0 p-1">
                                    <AlertTriangle className="w-3 h-3 text-white fill-red-500" />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-all duration-300 bg-[#F8F8FA] border border-dashed border-black/20 hover:bg-white hover:border-black/40">
                                <Plus
                                  className="w-4 h-4 text-black/20"
                                  strokeWidth={3}
                                />
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="border-b border-black/15 px-6 py-6 text-center bg-[#F8F8FA]/50">
                        <span className="text-base font-black text-black font-mono tabular-nums">
                          {workCount.toString().padStart(2, "0")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {assignModal && (
        <AssignModal
          employee={assignModal.employee}
          date={assignModal.date}
          currentShift={assignModal.currentShift}
          shiftTypes={shiftTypes}
          conflict={getConflictForCell(
            conflicts,
            assignModal.employee.id!,
            assignModal.date,
          )}
          onAssign={handleAssign}
          onClear={handleClear}
          onClose={() => setAssignModal(null)}
        />
      )}

      {/* Rolling Modal */}
      {rollingModal && (
        <RollingModal
          employees={employees}
          shiftTypes={shiftTypes}
          onApply={handleRollingApply}
          onClose={() => setRollingModal(false)}
        />
      )}
      {settingsModal && appSettings && (
        <BusinessSettingsModal
          settings={appSettings}
          onSave={handleSettingsSave}
          onClose={() => setSettingsModal(false)}
        />
      )}

      {/* Share Modal */}
      {showShareModal && shareId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-up overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#D0F500]/20 flex items-center justify-center">
                  <Share2 className="w-7 h-7 text-[#6b7c00]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-black tracking-tight">
                    Jadwal Dipublikasikan
                  </h3>
                  <p className="text-sm text-(--color-muted) font-medium">
                    Link publik siap dibagikan ke tim Anda.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#F8F8FA] rounded-xl border border-black/5 break-all font-mono text-xs select-all">
                  {`${window.location.origin}/v/${shareId}`}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/v/${shareId}`,
                      );
                      toast.success("Link berhasil disalin ke clipboard!");
                    }}
                    className="flex-1 h-14 bg-black text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/20"
                  >
                    <Copy className="w-4 h-4" />
                    Salin Link
                  </button>
                  <a
                    href={`/v/${shareId}`}
                    target="_blank"
                    className="w-14 h-14 bg-white border border-black/15 rounded-xl flex items-center justify-center hover:bg-[#F8F8FA] transition-all"
                    title="Buka Preview"
                  >
                    <ExternalLink className="w-5 h-5 text-black" />
                  </a>
                </div>
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-4 text-sm font-bold text-(--color-muted) hover:text-black transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
