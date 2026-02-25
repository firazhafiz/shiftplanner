"use client";

import { useEffect, useState, useCallback } from "react";
import { getDB } from "@/lib/db/db";
import type { ShiftType, AuthConfig } from "@/types";
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  X,
  Moon,
  Sun,
  Sunset,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ConfirmModal from "@/components/shared/ConfirmModal";

const SHIFT_COLORS = [
  { color: "#3B82F6", bg: "#EFF6FF", label: "Biru" },
  { color: "#F59E0B", bg: "#FFFBEB", label: "Kuning" },
  { color: "#8B5CF6", bg: "#F5F3FF", label: "Ungu" },
  { color: "#10B981", bg: "#ECFDF5", label: "Hijau" },
  { color: "#EF4444", bg: "#FEF2F2", label: "Merah" },
  { color: "#EC4899", bg: "#FDF2F8", label: "Pink" },
  { color: "#06B6D4", bg: "#ECFEFF", label: "Cyan" },
  { color: "#D1D5DB", bg: "#F9FAFB", label: "Abu" },
];

function ShiftModal({
  shift,
  onSave,
  onClose,
  tier = "starter",
}: {
  shift?: ShiftType;
  onSave: (data: Omit<ShiftType, "id">) => Promise<void>;
  onClose: () => void;
  tier?: "starter" | "personal" | "pro";
}) {
  const [name, setName] = useState(shift?.name ?? "");
  const [code, setCode] = useState(shift?.code ?? "");
  const [startTime, setStartTime] = useState(shift?.startTime ?? "07:00");
  const [endTime, setEndTime] = useState(shift?.endTime ?? "15:00");
  const [color, setColor] = useState(shift?.color ?? "#3B82F6");
  const [bgColor, setBgColor] = useState(shift?.bgColor ?? "#EFF6FF");
  const [isOff, setIsOff] = useState(shift?.isOff ?? false);
  const [baseRate, setBaseRate] = useState(shift?.baseRate?.toString() ?? "");
  const [saving, setSaving] = useState(false);

  const handleColorPick = (c: (typeof SHIFT_COLORS)[0]) => {
    setColor(c.color);
    setBgColor(c.bg);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    setSaving(true);
    await onSave({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      startTime,
      endTime,
      color,
      bgColor,
      isOff,
      baseRate: baseRate ? parseFloat(baseRate) : undefined,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-up">
        <div className="flex items-center justify-between p-6 border-b border-(--color-border)">
          <h2 className="font-bold text-lg">
            {shift ? "Edit Tipe Shift" : "Tambah Tipe Shift"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--color-surface)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Nama Shift *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pagi"
                className="input-field"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Kode *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.slice(0, 3))}
                placeholder="P / S / M"
                className="input-field font-mono font-bold text-center uppercase"
                required
                maxLength={3}
              />
            </div>
          </div>

          {/* Is Off toggle */}
          <div className="flex items-center justify-between p-3 bg-(--color-surface) rounded-xl">
            <span className="text-sm font-medium">
              Ini adalah Hari Libur/OFF?
            </span>
            <button
              type="button"
              onClick={() => setIsOff(!isOff)}
              className={cn(
                "w-11 h-6 rounded-full transition-colors relative",
                isOff ? "bg-(--color-primary)" : "bg-(--color-border)",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                  isOff && "translate-x-5",
                )}
              />
            </button>
          </div>

          {!isOff && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Jam Mulai
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Jam Selesai
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium">
                Tarif Dasar per Shift (Labor Cost)
              </label>
              {tier !== "pro" && (
                <span className="text-[10px] bg-black text-[#D0F500] px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
                  Pro
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-(--color-muted)">
                <span className="text-xs font-bold">Rp</span>
              </div>
              <input
                type="number"
                value={baseRate}
                onChange={(e) => {
                  if (tier !== "pro") {
                    toast.error(
                      "Fitur Labor Cost eksklusif untuk paket Professional.",
                    );
                    return;
                  }
                  setBaseRate(e.target.value);
                }}
                disabled={tier !== "pro"}
                placeholder={tier === "pro" ? "0" : "Hanya untuk Pro"}
                className={cn(
                  "input-field pl-10 font-mono tracking-tight",
                  tier !== "pro" && "opacity-50 cursor-not-allowed",
                )}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-(--color-muted)/30">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[10px] text-(--color-muted) mt-1">
              Digunakan untuk menghitung estimasi pengeluaran gaji di grid
              jadwal.
            </p>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium mb-2">Warna</label>
            <div className="flex gap-2 flex-wrap">
              {SHIFT_COLORS.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  className={cn(
                    "w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110",
                    color === c.color
                      ? "border-(--color-fg) scale-110"
                      : "border-transparent",
                  )}
                  style={{ background: c.color }}
                  onClick={() => handleColorPick(c)}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Preview badge */}
          <div className="flex items-center gap-3 p-3 bg-(--color-surface) rounded-xl">
            <span className="text-sm text-(--color-muted)">Preview:</span>
            <div
              className="shift-badge"
              style={{
                background: color,
                color: "white",
                width: 36,
                height: 36,
                fontSize: "0.75rem",
              }}
            >
              {code || "?"}
            </div>
            <span className="text-sm font-medium">{name || "Nama Shift"}</span>
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
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 justify-center"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ShiftsPage() {
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ShiftType | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<ShiftType | undefined>();
  const [authConfig, setAuthConfig] = useState<AuthConfig | undefined>();

  const loadData = useCallback(async () => {
    const db = getDB();
    const [shifts, auth] = await Promise.all([
      db.getAllShiftTypes(),
      db.getAuthConfig(),
    ]);
    setShiftTypes(shifts);
    setAuthConfig(auth);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (data: Omit<ShiftType, "id">) => {
    const db = getDB();
    if (editTarget?.id) {
      await db.updateShiftType(editTarget.id, data);
      toast.success("Tipe shift diperbarui!");
    } else {
      await db.addShiftType(data);
      toast.success("Tipe shift baru ditambahkan!");
    }
    setModalOpen(false);
    setEditTarget(undefined);
    await loadData();
  };

  const handleDelete = async (shift: ShiftType) => {
    setDeleteTarget(shift);
  };

  const confirmedDelete = async () => {
    if (!deleteTarget) return;
    const db = getDB();
    await db.deleteShiftType(deleteTarget.id!);
    toast.success(`Shift "${deleteTarget.name}" telah dihapus.`);
    setDeleteTarget(undefined);
    await loadData();
  };

  const getShiftIcon = (shift: ShiftType) => {
    if (shift.isOff) return null;
    const h = parseInt(shift.startTime.split(":")[0]);
    if (h >= 5 && h < 12)
      return <Sun className="w-5 h-5" style={{ color: shift.color }} />;
    if (h >= 12 && h < 17)
      return <Sunset className="w-5 h-5" style={{ color: shift.color }} />;
    return <Moon className="w-5 h-5" style={{ color: shift.color }} />;
  };

  return (
    <div className="min-h-screen p-8 pt-10 max-w-8xl mx-auto space-y-12 bg-[#F8F8FA]">
      {/* Header & Stats Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-black">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter leading-none">
            Master Shift
          </h1>
          <p className="text-(--color-muted) font-medium text-base mt-2">
            Atur berbagai jenis jam kerja dan hari libur untuk tim Anda.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-3 md:px-8 md:py-4 rounded-md border border-black/15 flex items-center gap-4 ">
            <div className="w-5 h-5 rounded-xl bg-black flex items-center justify-center">
              <Clock className="w-6 h-6 text-(--color-primary)" />
            </div>
            <div>
              <p className="text-xl font-black leading-none tabular-nums">
                {shiftTypes.length.toString().padStart(2, "0")}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditTarget(undefined);
              setModalOpen(true);
            }}
            className="px-4 py-3 md:px-8 md:py-4 bg-black text-white rounded-md flex items-center gap-3 group transition-all hover:scale-105 active:scale-95 font-black text-sm"
          >
            <Plus
              className="w-5 h-5 text-(--color-primary) group-hover:rotate-90 transition-transform"
              strokeWidth={3}
            />
            Tambah Shift
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-white border border-black/15 animate-pulse"
            />
          ))}
        </div>
      ) : shiftTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-black/15 shadow-xl shadow-black/2 relative overflow-hidden transition-all animate-fade-up">
          <div className="absolute top-0 left-0 w-full h-1 bg-(--color-primary)" />
          <div className="w-24 h-24 rounded-2xl bg-[#F8F8FA] flex items-center justify-center mb-8 shadow-inner">
            <Clock className="w-12 h-12 text-(--color-muted)" />
          </div>
          <p className="text-3xl font-black text-(--color-fg) mb-3 tracking-tighter">
            Belum Ada Tipe Shift.
          </p>
          <p className="text-lg text-(--color-muted) mb-12 max-w-sm mx-auto font-light leading-relaxed">
            Tambahkan shift Pagi, Siang, Malam, dan Libur untuk mulai menyusun
            jadwal operasional workspace.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-8 py-4 bg-black text-white rounded-md font-black text-lg flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6" strokeWidth={3} /> Tambah Shift Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-up">
          {/* Mobile High-Density List */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {shiftTypes.map((shift: ShiftType) => (
              <div
                key={shift.id}
                className="bg-white rounded-xl p-4 border border-black/10 flex items-center gap-4 transition-all active:scale-[0.98]"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-sm shrink-0"
                  style={{ background: shift.color }}
                >
                  {shift.code}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-(--color-fg) truncate leading-tight">
                    {shift.name}
                  </p>
                  <p className="text-[10px] font-bold text-(--color-muted) uppercase tracking-widest mt-0.5">
                    {shift.isOff
                      ? "Libur"
                      : `${shift.startTime} — ${shift.endTime}`}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditTarget(shift);
                      setModalOpen(true);
                    }}
                    className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#F8F8FA] text-(--color-muted) border border-black/5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(shift)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-50 text-red-500 border border-red-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop/Tablet Card Grid */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-6">
            {shiftTypes.map((shift) => (
              <div
                key={shift.id}
                className="group bg-white rounded-2xl p-8 border border-black/15 transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-5">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-black text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: shift.color }}
                    >
                      {shift.code}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-(--color-fg) tracking-tight leading-none">
                        {shift.name}
                      </h3>
                      <p className="text-[10px] font-black text-(--color-muted) uppercase tracking-widest mt-2">
                        {shift.isOff ? "Status: Libur" : "Status: Aktif"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 transition-all duration-300">
                    <button
                      onClick={() => {
                        setEditTarget(shift);
                        setModalOpen(true);
                      }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F8F8FA] hover:bg-black hover:text-white text-(--color-muted) transition-all shadow-sm"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(shift)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 hover:bg-red-600 hover:text-white text-red-500 transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {!shift.isOff ? (
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#F8F8FA] flex items-center justify-center border border-black/5">
                          {getShiftIcon(shift)}
                        </div>
                        <span className="text-2xl font-black font-mono tracking-tighter tabular-nums text-black">
                          {shift.startTime}{" "}
                          <span className="text-(--color-muted)/20 px-1">
                            —
                          </span>{" "}
                          {shift.endTime}
                        </span>
                      </div>
                    </div>

                    <div className="h-2 w-full bg-[#F8F8FA] rounded-full overflow-hidden border border-black/3">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ background: shift.color, width: "100%" }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-5 bg-[#F8F8FA] rounded-xl relative z-10 border border-black/5">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-black/5">
                      <Moon className="w-5 h-5 text-(--color-muted)" />
                    </div>
                    <p className="text-sm font-black text-(--color-muted)">
                      Tidak ada operasional (LIBUR)
                    </p>
                  </div>
                )}

                {shift.baseRate && authConfig?.tier === "pro" && (
                  <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
                    <span className="text-[10px] font-black text-(--color-muted) uppercase tracking-widest">
                      Labor Cost
                    </span>
                    <span className="text-sm font-black text-black font-mono">
                      Rp {shift.baseRate.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}

                {/* Aesthetic Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-(--color-primary)/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:bg-(--color-primary)/8 transition-colors pointer-events-none" />

                <div className="absolute -right-6 -bottom-6 opacity-0 group-hover:opacity-5 transition-all duration-700 transform group-hover:-translate-x-6 group-hover:-translate-y-6 pointer-events-none">
                  <Clock className="w-48 h-48 text-black" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalOpen && (
        <ShiftModal
          shift={editTarget}
          onSave={handleSave}
          tier={authConfig?.tier}
          onClose={() => {
            setModalOpen(false);
            setEditTarget(undefined);
          }}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        title="Hapus Tipe Shift?"
        description={`Apakah Anda yakin ingin menghapus shift "${deleteTarget?.name}"? Semua jadwal yang menggunakan shift ini akan ikut terhapus secara permanen.`}
        onConfirm={confirmedDelete}
        confirmText="Ya, Hapus"
        variant="danger"
      />
    </div>
  );
}
