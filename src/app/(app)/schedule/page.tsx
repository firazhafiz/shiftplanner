"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { detectConflicts, getConflictForCell } from "@/lib/schedule/conflicts";
import { generateRollingSchedule } from "@/lib/schedule/rolling";
import { exportToExcel } from "@/lib/export/excelExport";
import { exportScheduleAsImage } from "@/lib/export/imageExport";
import type {
  Employee,
  ShiftType,
  ScheduleEntry,
  ScheduleConflict,
  AppSettings,
  ConflictType,
  Availability,
  RollingPattern,
  BusinessProfile,
  AuthConfig,
} from "@/types";
import {
  getDaysOfMonth,
  formatDateId,
  toDateString,
  cn,
  calcRestHours,
} from "@/lib/utils";
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
  Repeat,
  Wallet,
  MessageCircle,
  Send,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { format, getDaysInMonth } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { getDB } from "@/lib/db/schema";
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
  tier = "starter",
}: {
  employees: Employee[];
  shiftTypes: ShiftType[];
  onApply: (
    employeeId: number,
    pattern: RollingPattern[],
    offset: number,
  ) => Promise<void>;
  onClose: () => void;
  tier?: "starter" | "personal" | "pro";
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

  const totalCycle = pattern.reduce((s, p) => s + p.duration, 0);
  const maxDays = tier === "starter" ? 7 : tier === "personal" ? 31 : 999;
  const isOverLimit = totalCycle > maxDays;

  const handleApply = async () => {
    if (isOverLimit) {
      toast.error(
        `Batas otomasi paket ${tier?.toUpperCase()} adalah ${maxDays} hari. Silakan kurangi durasi shift atau upgrade paket!`,
      );
      return;
    }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-(--color-border)">
          <div>
            <p className="font-bold">Rolling Shift Otomatis</p>
            <p className="text-xs text-(--color-muted)">
              Total siklus: {totalCycle} hari{" "}
              {tier !== "pro" && (
                <span
                  className={cn(
                    "ml-1",
                    isOverLimit ? "text-red-500 font-bold" : "text-blue-500",
                  )}
                >
                  (Maks {maxDays} hari)
                </span>
              )}
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
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [swapMode, setSwapMode] = useState<{
    active: boolean;
    firstCell?: { empId: number; date: string };
  }>({ active: false });
  const [businessProfile, setBusinessProfile] = useState<
    BusinessProfile | undefined
  >();
  const [authConfig, setAuthConfig] = useState<AuthConfig | undefined>();

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
  const gridRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to grid when swap mode is activated (especially for mobile)
  useEffect(() => {
    if (swapMode.active && gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [swapMode.active]);

  // Drag and Drop state
  const [draggedCell, setDraggedCell] = useState<{
    empId: number;
    date: string;
  } | null>(null);

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

    // Get previous month to catch cross-month conflicts
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonth = month === 1 ? 12 : month - 1;

    const [emps, shifts, sched, settings, avail, prevSched, profile, auth] =
      await Promise.all([
        db.getAllEmployees(),
        db.getAllShiftTypes(),
        db.getScheduleForMonth(year, month),
        db.getAppSettings(),
        db.getAllAvailability(),
        db.getScheduleForMonth(prevYear, prevMonth),
        db.getBusinessProfile(),
        db.getAuthConfig(),
      ]);

    setEmployees(emps);
    setShiftTypes(shifts);
    setSchedules(sched);
    setAppSettings(settings);
    setAvailabilities(avail);
    setBusinessProfile(profile);
    setAuthConfig(auth);

    // Combine current and previous month (last 2 days) for conflict detection
    const last2Days = getDaysOfMonth(prevYear, prevMonth).slice(-2);
    const bufferSched = prevSched.filter((s) => last2Days.includes(s.date));
    const combinedForConflicts = [...bufferSched, ...sched];

    setConflicts(
      detectConflicts(combinedForConflicts, shifts, settings, avail),
    );
    setLoading(false);
  }, [year, month]);

  const totalLaborCost = schedules.reduce((total, s) => {
    const shift = shiftMap.get(s.shiftTypeId);
    return total + (shift?.baseRate || 0);
  }, 0);

  useEffect(() => {
    loadData();
  }, [loadData, year, month]);

  const handleCellClick = async (emp: Employee, date: string) => {
    if (swapMode.active) {
      if (!swapMode.firstCell) {
        setSwapMode({ ...swapMode, firstCell: { empId: emp.id!, date } });
        toast.info("Pilih cell tujuan untuk menukar shift.");
      } else {
        const first = swapMode.firstCell;
        const second = { empId: emp.id!, date };

        // Skip if same cell
        if (first.empId === second.empId && first.date === second.date) {
          setSwapMode({ active: false });
          return;
        }

        const db = getDB();
        const entry1 = scheduleLookup.get(`${first.empId}-${first.date}`);
        const entry2 = scheduleLookup.get(`${second.empId}-${second.date}`);

        // Perform Swap in DB
        // Using Promise.all for speed
        const actions = [];
        if (entry1 && entry2) {
          // Both have shifts, swap them
          actions.push(
            db.upsertSchedule({
              ...entry1,
              employeeId: second.empId,
              date: second.date,
            }),
          );
          actions.push(
            db.upsertSchedule({
              ...entry2,
              employeeId: first.empId,
              date: first.date,
            }),
          );
        } else if (entry1) {
          // Only first has shift, move to second
          actions.push(db.deleteSchedule(first.empId, first.date));
          actions.push(
            db.upsertSchedule({
              ...entry1,
              employeeId: second.empId,
              date: second.date,
            }),
          );
        } else if (entry2) {
          // Only second has shift, move to first
          actions.push(db.deleteSchedule(second.empId, second.date));
          actions.push(
            db.upsertSchedule({
              ...entry2,
              employeeId: first.empId,
              date: first.date,
            }),
          );
        }

        await Promise.all(actions);
        setSwapMode({ active: false });
        await loadData();
        toast.success("Shift berhasil ditukar!");
      }
      return;
    }

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

  const handleWhatsAppShare = (emp: Employee) => {
    if (authConfig?.tier !== "pro") {
      toast.error("Fitur WhatsApp Share eksklusif untuk paket Professional.");
      return;
    }
    const empSchedules = schedules.filter((s) => s.employeeId === emp.id);
    if (empSchedules.length === 0) {
      toast.error(`Belum ada jadwal untuk ${emp.name}`);
      return;
    }

    const monthName = format(new Date(year, month - 1), "MMMM yyyy", {
      locale: idLocale,
    });
    let message = `*Jadwal Shift - ${emp.name}*\n- Periode: ${monthName}\n\n`;

    // Sort schedules by date
    const sorted = [...empSchedules].sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    sorted.forEach((s) => {
      const shift = shiftMap.get(s.shiftTypeId);
      if (shift) {
        const dateLabel = format(new Date(s.date), "dd/MM");
        message += `• ${dateLabel}: *${shift.name}* (${shift.startTime}-${shift.endTime})\n`;
      }
    });

    message += `\\n_Dibuat via ShiftPlanner_`;
    const encoded = encodeURIComponent(message);

    // Normalisasi nomor: ganti 0 di depan dengan 62
    let formattedPhone = emp.phone?.replace(/[^0-9]/g, "") || "";
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    }

    const waUrl = `https://wa.me/${formattedPhone}?text=${encoded}`;
    window.open(waUrl, "_blank");
  };

  const handlePublish = async () => {
    if (authConfig?.tier !== "pro") {
      toast.error("Fitur Portal Publik eksklusif untuk paket Professional.");
      return;
    }
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

  const handleExportExcel = () => {
    if (authConfig?.tier === "starter") {
      toast.error("Penyimpanan Excel eksklusif untuk paket Personal & Pro.");
      return;
    }
    exportToExcel(
      employees,
      shiftTypes,
      schedules,
      year,
      month,
      businessProfile?.name,
      authConfig?.tier || "personal",
    );
  };

  const handleExportImage = async () => {
    setExportingImg(true);
    try {
      await exportScheduleAsImage(
        "export-container",
        `jadwal-${businessProfile?.name || "shift"}-${year}-${String(month).padStart(2, "0")}.png`,
        authConfig?.tier || "personal",
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
    <div className="min-h-screen px-6 pt-10 md:p-8 md:pt-10 max-w-8xl mx-auto space-y-6 md:space-y-8 bg-[#F8F8FA] relative overflow-x-hidden">
      {/* ── Export Container (Branding + Table) ─────────────────── */}
      <div id="export-container" className="space-y-8 bg-[#F8F8FA]">
        {/* Freeze UX Backdrop */}
        {swapMode.active && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-[6px] animate-fade-in transition-all duration-500" />
        )}
        {/* ── Branding & Status Header ──────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="flex items-center gap-5">
            {businessProfile?.logo ? (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white border border-black/30 overflow-hidden flex items-center justify-center shrink-0 p-1">
                <img
                  src={businessProfile.logo}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-black flex items-center justify-center shrink-0 shadow-2xl">
                <span className="text-2xl md:text-3xl">⚡</span>
              </div>
            )}
            <div className="space-y-1">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none text-black">
                {businessProfile?.name || "ShiftPlanner"}
              </h1>
              <p className="text-[10px] md:text-xs font-black text-(--color-muted) uppercase tracking-[0.2em] mt-1 md:mt-2">
                Workspace Operasional Tim
              </p>
            </div>
          </div>

          {conflicts.length > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 text-[10px] font-black px-6 py-4 rounded-xl shadow-lg shadow-red-500/5 animate-pulse-subtle w-fit">
              <AlertTriangle className="w-4 h-4" />
              {conflicts.length.toString().padStart(2, "0")} KONFLIK TERDETEKSI
            </div>
          )}
        </div>

        {/* ── Subtitle ────────────────────────────────────────── */}
        <div className="pt-2">
          <p className="text-(--color-muted) font-medium text-sm md:text-base max-w-2xl">
            Kelola rincian shift, pantau ketersediaan, dan optimalkan
            produktivitas tim Anda dalam satu tampilan terpusat.
          </p>
        </div>

        {/* ── Toolbar Grouping (Excluded from Export) ─────────────── */}
        <div className="flex flex-col gap-6 bg-white p-6 md:p-8 rounded-xl border border-black/15 no-export">
          {/* Row 1: Context & Search */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 md:gap-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 flex-1">
              {/* Date Navigator */}
              <div className="flex items-center gap-1 p-1 bg-[#F8F8FA] w-fit rounded-md border  border-black/5 shadow-inner">
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

              {/* Pro Only: Labor Cost Estimation */}
              {authConfig?.tier === "pro" && totalLaborCost > 0 && (
                <div className="flex items-center gap-3 px-6 py-3 bg-black border border-black/5 rounded-md shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-(--color-primary)/10 flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4 text-(--color-primary)" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-(--color-primary) uppercase tracking-widest leading-none">
                      Estimasi Biaya
                    </p>
                    <p className="text-sm font-black text-white font-mono mt-1 leading-none tabular-nums">
                      Rp {totalLaborCost.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Employee Search */}
            <div className="relative group max-w-md flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-muted) group-focus-within:text-black transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari karyawan di jadwal..."
                className="w-full h-13 bg-[#F8F8FA] border border-black/5 rounded-md pl-12 pr-4 text-xs font-light outline-none focus:ring-2 focus:ring-(--color-primary) focus:bg-white transition-all text-black"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
            {/* Action Group Primary */}
            <div className="flex items-center gap-2 p-1 bg-black rounded-md flex-1 md:flex-none">
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="h-10 flex-1 md:flex-none px-4 bg-(--color-primary) text-(--color-primary-fg) rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
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
                className="h-10 flex-1 md:flex-none px-4 bg-white text-black rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/95 transition-all"
              >
                <Repeat className="w-3.5 h-3.5" />
                Otomatis
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-black rounded-md w-full md:w-auto">
              <button
                onClick={() => {
                  setSwapMode({ active: !swapMode.active });
                  if (!swapMode.active) {
                    toast.info(
                      "Mode Swap Aktif: Drag & Drop jadwal untuk menukar.",
                      {
                        duration: 4000,
                      },
                    );
                  }
                }}
                className={cn(
                  "h-10 px-4 rounded-md flex items-center justify-center gap-2 transition-all text-[9px] md:text-[10px] font-black uppercase tracking-widest",
                  swapMode.active
                    ? "bg-(--color-primary) text-(--color-primary-fg) shadow-lg shadow-(--color-primary)/20 scale-105"
                    : "bg-white text-black hover:bg-white/95",
                )}
                title="Tukar Jadwal (Drag & Drop)"
              >
                <Repeat
                  className={cn(
                    "w-4 h-4",
                    swapMode.active && "animate-spin-slow",
                  )}
                />
                {swapMode.active ? "Mode Swap" : "Tukar"}
              </button>
              <button
                onClick={() => setSettingsModal(true)}
                className="h-10 bg-white text-black rounded-md flex items-center justify-center hover:bg-white/95 transition-all shadow-sm"
                title="Konfigurasi Bisnis"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Action Group Secondary (Export) */}
            <div className="flex items-center gap-2 p-1 bg-(--color-primary) rounded-md border border-black/15 ">
              <button
                onClick={handleExportExcel}
                className="w-10 h-10 bg-black border border-black/5 text-emerald-600 rounded-md flex items-center justify-center transition-all shadow-sm"
                title="Unduh Excel"
              >
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleExportImage}
                disabled={exportingImg}
                className="w-10 h-10 bg-black border border-black/5 text-blue-600 rounded-md flex items-center justify-center transition-all shadow-sm disabled:opacity-50"
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
                {
                  id: "position",
                  label: "Jabatan",
                  icon: ArrowDownWideNarrow,
                },
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

        {/* ── Main Schedule Grid ─────────────────────────────────── */}
        <div
          ref={gridRef}
          className={cn(
            "flex-1 flex flex-col relative scroll-mt-32",
            swapMode.active && "z-70",
          )}
        >
          {/* Swap Mode Instructions Overlay */}
          {swapMode.active && (
            <div className="fixed bottom-22 md:bottom-10 left-1/2 -translate-x-1/2 z-100 w-full max-w-sm px-4 md:px-0 pointer-events-none no-export">
              <div className="bg-black text-(--color-primary) px-6 py-5 rounded-2xl shadow-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-between gap-4 animate-fade-up pointer-events-auto border border-(--color-primary)/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-(--color-primary)/10 flex items-center justify-center">
                    <Repeat className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <div>
                    <p>Mode Swap Aktif</p>
                    <p className="text-white/60 text-[8px]">
                      Drag & drop jadwal untuk menukar
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSwapMode({ active: false })}
                  className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-all"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          )}
          {loading ? (
            <div className="flex-1 bg-white rounded-[48px] animate-pulse border border-black/5 shadow-xl shadow-black/2" />
          ) : employees.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 bg-white rounded-xl border border-black/15 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-(--color-primary)" />
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
                    <th className="sticky left-0 z-40 bg-white text-left px-3 md:px-5 py-6 md:py-8 border-b border-r border-black/15 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] w-[120px] md:w-40 min-w-[120px] md:min-w-[160px]">
                      <div className="flex items-center gap-1.5 md:gap-3">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-black flex items-center justify-center shrink-0">
                          <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-(--color-primary)" />
                        </div>
                        <span className="font-black text-[9px] md:text-[10px] text-black uppercase tracking-widest truncate block">
                          Karyawan
                        </span>
                      </div>
                    </th>
                    {days.map((date) => {
                      const d = new Date(date);
                      const dow = d.getDay();
                      const isWeekend = dow === 0 || dow === 6;
                      const isClosed =
                        appSettings?.shopClosedDays.includes(dow);
                      const isToday = date === toDateString(new Date());
                      const workingOnDay = schedules.filter(
                        (s) =>
                          s.date === date &&
                          !shiftMap.get(s.shiftTypeId)?.isOff,
                      ).length;
                      const isUnderstaffed = workingOnDay < 2;

                      return (
                        <th
                          key={date}
                          className={cn(
                            "px-2 py-8 text-center border-b border-black/15 transition-all duration-300 relative",
                            isToday && "bg-[#D0F500]/5",
                          )}
                        >
                          <div className="mb-2">
                            <span
                              className={cn(
                                "text-[9px] font-black uppercase tracking-[0.2em] transition-colors",
                                isWeekend
                                  ? "text-red-400"
                                  : "text-(--color-muted)/40",
                                isUnderstaffed && !isClosed && "text-amber-500",
                              )}
                            >
                              {formatDateId(date, "EEE")}
                            </span>
                            {isUnderstaffed && !isClosed && (
                              <div className="text-[8px] font-black text-amber-600/60 mt-0.5">
                                LACKING
                              </div>
                            )}
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
                    <th className="px-2 md:px-6 py-6 md:py-8 text-center bg-[#F8F8FA] border-b border-black/15">
                      <span className="font-black text-[10px] md:text-[11px] uppercase tracking-widest text-(--color-fg)/60">
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
                            "sticky left-0 z-20 border-r border-b border-black/15 px-3 md:px-5 py-4 md:py-6 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] w-[120px] md:w-40 min-w-[120px] md:min-w-[160px]",
                            ri % 2 === 0 ? "bg-white" : "bg-[#F8F8FA]",
                            "group-hover/row:bg-(--color-primary)/5",
                          )}
                        >
                          <div className="flex items-center gap-2 md:gap-3 w-full">
                            <div className="overflow-hidden min-w-0">
                              <p className="font-black text-[11px] md:text-[13px] text-black tracking-tight truncate leading-none">
                                {emp.name}
                              </p>
                              <p className="hidden md:block text-[9px] font-bold text-(--color-muted)/60 uppercase tracking-widest mt-1 truncate">
                                {emp.position}
                              </p>
                            </div>
                            <button
                              onClick={() => handleWhatsAppShare(emp)}
                              className="ml-auto p-1 text-(--color-muted)/30 hover:text-green-500 transition-colors shrink-0"
                              title="Kirim ke WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
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
                          const isFirstSwap =
                            swapMode.firstCell?.empId === emp.id &&
                            swapMode.firstCell?.date === date;

                          if (shift && !shift.isOff) workCount++;
                          return (
                            <td
                              key={date}
                              className={cn(
                                "border-r border-b border-black/15 p-2 text-center relative group/cell transition-all duration-300",
                                swapMode.active
                                  ? "cursor-move"
                                  : "cursor-default",
                                conflict && "bg-red-50/20",
                                isFirstSwap &&
                                  "bg-(--color-primary)/20 ring-2 ring-(--color-primary) ring-inset",
                                draggedCell?.empId === emp.id &&
                                  draggedCell?.date === date &&
                                  "opacity-30",
                                "hover:bg-(--color-primary)/10",
                              )}
                              draggable={swapMode.active}
                              onDragStart={(e) => {
                                if (!swapMode.active) {
                                  e.preventDefault();
                                  return;
                                }
                                setDraggedCell({ empId: emp.id!, date });
                                // Optional: visual feedback or dataTransfer
                                e.dataTransfer.setData(
                                  "text/plain",
                                  JSON.stringify({ empId: emp.id, date }),
                                );
                              }}
                              onDragOver={(e) => {
                                if (!swapMode.active) return;
                                e.preventDefault();
                                e.currentTarget.classList.add(
                                  "bg-[#D0F500]/10",
                                );
                              }}
                              onDragLeave={(e) => {
                                if (!swapMode.active) return;
                                e.currentTarget.classList.remove(
                                  "bg-[#D0F500]/10",
                                );
                              }}
                              onDrop={async (e) => {
                                if (!swapMode.active) return;
                                e.preventDefault();
                                e.currentTarget.classList.remove(
                                  "bg-[#D0F500]/10",
                                );
                                const targetEmp = emp;
                                const targetDate = date;

                                if (
                                  draggedCell &&
                                  (draggedCell.empId !== targetEmp.id ||
                                    draggedCell.date !== targetDate)
                                ) {
                                  const sourceEmpId = draggedCell.empId;
                                  const sourceDate = draggedCell.date;

                                  // Swap Logic (Reusing handleCellClick logic)
                                  const sourceEntry = schedules.find(
                                    (s) =>
                                      s.employeeId === sourceEmpId &&
                                      s.date === sourceDate,
                                  );
                                  const targetEntry = schedules.find(
                                    (s) =>
                                      s.employeeId === targetEmp.id &&
                                      s.date === targetDate,
                                  );

                                  const actions = [];
                                  const dbInstance = getDB();

                                  // Source -> Target
                                  if (sourceEntry) {
                                    actions.push(
                                      dbInstance.upsertSchedule({
                                        ...sourceEntry,
                                        employeeId: targetEmp.id!,
                                        date: targetDate,
                                      }),
                                    );
                                  } else {
                                    actions.push(
                                      dbInstance.deleteSchedule(
                                        targetEmp.id!,
                                        targetDate,
                                      ),
                                    );
                                  }

                                  // Target -> Source
                                  if (targetEntry) {
                                    actions.push(
                                      dbInstance.upsertSchedule({
                                        ...targetEntry,
                                        employeeId: sourceEmpId,
                                        date: sourceDate,
                                      }),
                                    );
                                  } else {
                                    actions.push(
                                      dbInstance.deleteSchedule(
                                        sourceEmpId,
                                        sourceDate,
                                      ),
                                    );
                                  }

                                  try {
                                    await Promise.all(actions);
                                    toast.success("Shift berhasil ditukar!");
                                    await loadData();
                                  } catch (err) {
                                    console.error("Swap error:", err);
                                    toast.error("Gagal menukar shift.");
                                  }
                                }
                                setDraggedCell(null);
                              }}
                              onClick={() => handleCellClick(emp, date)}
                            >
                              {shift ? (
                                <div
                                  className={cn(
                                    "w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl mx-auto flex flex-col items-center justify-center text-[10px] md:text-[11px] font-black transition-all duration-300 shadow-sm relative overflow-hidden",
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
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl mx-auto flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-all duration-300 bg-[#F8F8FA] border border-dashed border-black/20 hover:bg-white hover:border-black/40">
                                  <Plus
                                    className="w-4 h-4 text-black/20"
                                    strokeWidth={3}
                                  />
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td className="border-b border-black/15 px-2 md:px-6 py-4 md:py-6 text-center bg-[#F8F8FA]/50">
                          <span className="text-sm md:text-base font-black text-black font-mono tabular-nums">
                            {workCount.toString().padStart(2, "0")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {authConfig?.tier === "pro" && (
                  <tfoot>
                    <tr className="bg-black text-(--color-primary) border-t-2 border-(--color-primary)/20">
                      <td className="sticky left-0 z-30 bg-black px-3 md:px-5 py-4 border-r border-white/10 w-[120px] md:w-40 min-w-[120px] md:min-w-[160px]">
                        <div className="flex items-center gap-1.5 md:gap-3">
                          <Wallet className="w-3.5 h-3.5 md:w-4 md:h-4 text-(--color-primary)" />
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-tight">
                            Labor Cost
                          </span>
                        </div>
                      </td>
                      {days.map((date) => {
                        const totalCost = schedules
                          .filter((s) => s.date === date)
                          .reduce(
                            (sum, s) =>
                              sum +
                              (shiftMap.get(s.shiftTypeId)?.baseRate || 0),
                            0,
                          );

                        return (
                          <td
                            key={date}
                            className="px-2 py-4 text-center font-mono text-[10px] font-black border-r border-white/10"
                          >
                            {totalCost > 0
                              ? `Rp ${totalCost.toLocaleString("id-ID")}`
                              : "-"}
                          </td>
                        );
                      })}
                      <td className="bg-black/80 px-4 py-4 text-center font-mono text-xs font-black">
                        {(() => {
                          const grandTotal = schedules.reduce(
                            (sum, s) =>
                              sum +
                              (shiftMap.get(s.shiftTypeId)?.baseRate || 0),
                            0,
                          );
                          return `Rp ${grandTotal.toLocaleString("id-ID")}`;
                        })()}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      </div>
      {/* End export-container */}
      {/* Modals */}
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
          tier={authConfig?.tier}
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
