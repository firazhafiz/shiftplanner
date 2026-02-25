"use client";

import { useEffect, useState, useCallback } from "react";
import { getDB } from "@/lib/db/db";
import { randomColor } from "@/lib/utils";
import type { Employee } from "@/types";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Search,
  X,
  ArrowDownAZ,
  ArrowDownWideNarrow,
  CalendarDays,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ConfirmModal from "@/components/shared/ConfirmModal";
import { AuthConfig } from "@/types";

// ── Employee Form Modal ──────────────────────────────────────
const COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#06B6D4",
  "#F97316",
  "#84CC16",
  "#6366F1",
  "#14B8A6",
  "#F43F5E",
];

function EmployeeModal({
  employee,
  onSave,
  onClose,
}: {
  employee?: Employee;
  onSave: (data: Omit<Employee, "id" | "createdAt">) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(employee?.name ?? "");
  const [position, setPosition] = useState(employee?.position ?? "");
  const [phone, setPhone] = useState(employee?.phone ?? "");
  const [color, setColor] = useState(employee?.color ?? randomColor());
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !position.trim()) return;
    setSaving(true);
    await onSave({
      name: name.trim(),
      position: position.trim(),
      phone: phone.trim(),
      color,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-up">
        <div className="flex items-center justify-between p-6 border-b border-(--color-border)">
          <h2 className="font-bold text-lg">
            {employee ? "Edit Karyawan" : "Tambah Karyawan"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-(--color-surface)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Nama Lengkap *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Budi Santoso"
              className="input-field"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Jabatan / Posisi *
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Kasir, SPG, Security"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              No. Telepon
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Warna Identitas
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    "w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110",
                    color === c
                      ? "border-(--color-fg) scale-110"
                      : "border-transparent",
                  )}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
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

// ── Availability Modal ───────────────────────────────────────
function AvailabilityModal({
  employee,
  onClose,
}: {
  employee: Employee;
  onClose: () => void;
}) {
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [reason, setReason] = useState("");

  const loadData = useCallback(async () => {
    const db = getDB();
    const all = await db.getAllAvailability();
    setAvailabilities(all.filter((a) => a.employeeId === employee.id));
    setLoading(false);
  }, [employee.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = async () => {
    if (!selectedDate) return;
    const db = getDB();
    await db.saveAvailability({
      employeeId: employee.id!,
      date: selectedDate,
      status: "unavailable",
      reason: reason.trim(),
    });
    setReason("");
    await loadData();
    toast.success("Ketersediaan diperbarui");
  };

  const handleDelete = async (id: number) => {
    const db = getDB();
    await db.deleteAvailability(id);
    await loadData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-up overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-black/5 bg-[#F8F8FA]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black text-white"
              style={{ background: employee.color }}
            >
              {employee.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-black text-black">Ketersediaan Staf</h2>
              <p className="text-[10px] font-bold text-(--color-muted) uppercase tracking-widest">
                {employee.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-[#F8F8FA] p-4 rounded-xl border border-black/5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-(--color-muted) mb-1.5 block">
                  Tanggal Tidak Tersedia
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field h-10 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-(--color-muted) mb-1.5 block">
                  Alasan (Cuti/Sakit)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Opsional"
                  className="input-field h-10 text-xs"
                />
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="w-full py-2 bg-black text-white rounded-lg text-xs font-black hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Tambah Ketidaksediaan
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-(--color-muted)">
              Daftar Tanggal Libur/Off
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {availabilities.length === 0 ? (
                <p className="text-xs text-(--color-muted)/50 italic py-4 text-center">
                  Belum ada tanggal ketidaksediaan yang dicatat.
                </p>
              ) : (
                availabilities
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-3 bg-white border border-black/5 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span className="font-mono font-bold">
                          {format(new Date(a.date), "dd MMM yyyy", {
                            locale: localeId,
                          })}
                        </span>
                        {a.reason && (
                          <span className="text-(--color-muted) truncate max-w-[120px]">
                            ({a.reason})
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(a.id!)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full py-3 border border-black/10 rounded-xl text-xs font-black hover:bg-[#F8F8FA] transition-all"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | undefined>();
  const [availabilityTarget, setAvailabilityTarget] = useState<
    Employee | undefined
  >();
  const [sortConfig, setSortConfig] = useState<{
    direction: "asc" | "desc";
  }>({ direction: "asc" });
  const [deleteTarget, setDeleteTarget] = useState<Employee | undefined>();
  const [authConfig, setAuthConfig] = useState<AuthConfig | undefined>();

  const loadData = useCallback(async () => {
    const db = getDB();
    const [data, auth] = await Promise.all([
      db.getAllEmployees(),
      db.getAuthConfig(),
    ]);
    setEmployees(data);
    setAuthConfig(auth);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (data: Omit<Employee, "id" | "createdAt">) => {
    const db = getDB();

    // Enforce Starter tier limit (5 employees)
    if (!editTarget?.id) {
      const auth = await db.getAuthConfig();
      if (auth?.tier === "starter" && employees.length >= 5) {
        toast.error(
          "Batas Paket Starter tercapai (Maksimal 5 Karyawan). Silakan upgrade ke paket UMKM atau Professional!",
          {
            duration: 5000,
          },
        );
        return;
      }
    }

    if (editTarget?.id) {
      await db.updateEmployee(editTarget.id, data);
      toast.success("Data karyawan diperbarui!");
    } else {
      await db.addEmployee({ ...data, createdAt: new Date() });
      toast.success("Karyawan baru ditambahkan!");
    }
    setModalOpen(false);
    setEditTarget(undefined);
    await loadData();
  };

  const handleDelete = async (emp: Employee) => {
    setDeleteTarget(emp);
  };

  const confirmedDelete = async () => {
    if (!deleteTarget) return;
    const db = getDB();
    await db.deleteEmployee(deleteTarget.id!);
    toast.success(`Karyawan ${deleteTarget.name} telah dihapus.`);
    setDeleteTarget(undefined);
    await loadData();
  };

  const filteredAndSorted = employees
    .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      return sortConfig.direction === "asc"
        ? a.position.localeCompare(b.position)
        : b.position.localeCompare(a.position);
    });

  return (
    <div className="min-h-screen p-8 pt-10 max-w-8xl mx-auto space-y-12 bg-[#F8F8FA]">
      {/* Header & Stats Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 text-black">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter leading-none">
            Manajemen Tim
          </h1>
          <p className="text-(--color-muted) font-medium text-base mt-2">
            Kelola profil, jabatan, dan informasi kontak tim operasional Anda.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-3 md:px-8 md:py-4 rounded-md border border-black/20 flex items-center gap-4 ">
            <div className="w-6 h-6 rounded-xl bg-black flex items-center justify-center">
              <Users className="w-4 h-4 text-(--color-primary)" />
            </div>
            <div className="flex gap-4">
              <p className="text-xl font-black leading-none tabular-nums">
                {employees.length.toString().padStart(2, "0")}
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
            Tambah Karyawan
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-md border border-black/15 shadow-sm shadow-black/2 relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-(--color-muted)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama karyawan..."
            className="w-full h-14 bg-transparent pl-14 pr-4 text-sm font-black outline-none placeholder:text-(--color-muted)/40"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl mr-1">
          <button
            onClick={() =>
              setSortConfig({
                direction: sortConfig.direction === "asc" ? "desc" : "asc",
              })
            }
            className={cn(
              "h-10 px-4 rounded-md flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest bg-black text-white shadow-md",
            )}
          >
            <ArrowDownWideNarrow
              className={cn(
                "w-3.5 h-3.5",
                sortConfig.direction === "desc" && "rotate-180",
              )}
            />
            Jabatan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-white border border-black/15 animate-pulse"
            />
          ))}
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-black/15 shadow-xl shadow-black/2 relative overflow-hidden transition-all animate-fade-up">
          <div className="absolute top-0 left-0 w-full h-1 bg-(--color-primary)" />
          <div className="w-24 h-24 rounded-2xl bg-[#F8F8FA] flex items-center justify-center mb-8 shadow-inner">
            <Users className="w-12 h-12 text-(--color-muted)" />
          </div>
          <p className="text-3xl font-black text-(--color-fg) mb-3 tracking-tighter">
            {search ? "Hasil Tidak Ditemukan" : "Belum Ada Karyawan."}
          </p>
          <p className="text-lg text-(--color-muted) mb-12 max-w-sm mx-auto font-light leading-relaxed">
            {search
              ? "Coba gunakan kata kunci lain untuk menemukan karyawan yang Anda cari."
              : "Mulai bangun tim Anda dengan menambahkan data karyawan ke sistem."}
          </p>
          {!search && (
            <button
              onClick={() => setModalOpen(true)}
              className="py-4 px-12 bg-black text-white rounded-md font-black text-lg flex items-center gap-3 hover:scale-105 active:scale-95 transition-all "
            >
              <Plus className="w-6 h-6" strokeWidth={3} /> Tambah Karyawan
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 animate-fade-up">
          {/* Mobile High-Density List */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filteredAndSorted.map((emp: Employee) => (
              <div
                key={emp.id}
                className="bg-white rounded-xl p-4 border border-black/10 flex items-center gap-4 transition-all active:scale-[0.98]"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-sm shrink-0"
                  style={{ background: emp.color }}
                >
                  {emp.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-(--color-fg) truncate leading-tight">
                    {emp.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                      {emp.position}
                    </p>
                    <button
                      onClick={() => {
                        if (authConfig?.tier === "starter") {
                          toast.error(
                            "Fitur Ketersediaan eksklusif untuk paket UMKM & Professional.",
                          );
                          return;
                        }
                        setAvailabilityTarget(emp);
                      }}
                      className="text-[10px] font-black text-amber-600 uppercase flex items-center gap-1"
                    >
                      <CalendarDays className="w-2.5 h-2.5" />
                      Status
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditTarget(emp);
                      setModalOpen(true);
                    }}
                    className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#F8F8FA] text-(--color-muted) border border-black/5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(emp)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-50 text-red-500 border border-red-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop/Tablet Card Grid */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSorted.map((emp: Employee) => (
              <div
                key={emp.id}
                className="group bg-white rounded-2xl p-8 border border-black/15 transition-all duration-300 relative overflow-hidden"
              >
                {/* Card Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-(--color-primary)/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:bg-(--color-primary)/8 transition-colors" />

                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-black text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                    style={{ background: emp.color }}
                  >
                    {emp.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="flex gap-2 transition-all duration-300">
                    <button
                      onClick={() => {
                        setEditTarget(emp);
                        setModalOpen(true);
                      }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F8F8FA] hover:bg-black hover:text-white text-(--color-muted) transition-all shadow-sm"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(emp)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 hover:bg-red-600 hover:text-white text-red-500 transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => {
                      if (authConfig?.tier === "starter") {
                        toast.error(
                          "Fitur Ketersediaan eksklusif untuk paket UMKM & Professional.",
                        );
                        return;
                      }
                      setAvailabilityTarget(emp);
                    }}
                    className="flex-1 py-2.5 bg-[#F8F8FA] border border-black/5 rounded-xl flex items-center justify-center gap-2 hover:bg-(--color-primary)/10 transition-all text-[10px] font-black uppercase tracking-widest text-(--color-muted) hover:text-black"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    Ketersediaan
                  </button>
                </div>

                <div className="space-y-1 relative z-10">
                  <p className="font-black text-xl text-(--color-fg) tracking-tight truncate leading-none">
                    {emp.name}
                  </p>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2">
                    {emp.position}
                  </p>
                </div>

                {emp.phone ? (
                  <div className="mt-8 flex items-center gap-3 px-4 py-3 bg-[#F8F8FA] rounded-xl relative z-10 border border-black/5 transition-all">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D0F500] animate-pulse" />
                    <p className="text-xs font-black text-(--color-muted) truncate">
                      {emp.phone}
                    </p>
                  </div>
                ) : (
                  <div className="mt-8 h-[42px] bg-[#F8F8FA]/50 rounded-xl border border-dashed border-black/5" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {modalOpen && (
        <EmployeeModal
          employee={editTarget}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setEditTarget(undefined);
          }}
        />
      )}

      {availabilityTarget && (
        <AvailabilityModal
          employee={availabilityTarget}
          onClose={() => setAvailabilityTarget(undefined)}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        title="Hapus Karyawan?"
        description={`Apakah Anda yakin ingin menghapus ${deleteTarget?.name}? Semua data jadwal terkait karyawan ini akan ikut terhapus secara permanen.`}
        onConfirm={confirmedDelete}
        confirmText="Ya, Hapus"
        variant="danger"
      />
    </div>
  );
}
