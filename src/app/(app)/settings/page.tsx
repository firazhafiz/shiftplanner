"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getDB } from "@/lib/db/db";
import { downloadBackup, parseBackupFile } from "@/lib/export/dbBackup";
import type {
  BackupData,
  AuthConfig,
  AppSettings,
  BusinessProfile,
} from "@/types";
import {
  Coffee,
  Calendar,
  Settings as SettingsIcon,
  Palette,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Shield,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import { formatDateId } from "@/lib/utils";
import { toast } from "sonner";
import ConfirmModal from "@/components/shared/ConfirmModal";

export default function SettingsPage() {
  const [authConfig, setAuthConfig] = useState<AuthConfig | undefined>();
  const [dbStats, setDbStats] = useState({
    employees: 0,
    shifts: 0,
    schedules: 0,
  });
  const [appSettings, setAppSettings] = useState<AppSettings>({
    shopClosedDays: [],
    minRestHours: 11,
    primaryColor: "var(--color-primary)",
  });
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    name: "My Workspace",
    updatedAt: new Date(),
  });
  const [tempProfileName, setTempProfileName] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restoreStatus, setRestoreStatus] = useState<string>("");
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [pendingRestoreFile, setPendingRestoreFile] = useState<File | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const db = getDB();
    const [auth, emps, shifts, scheds, settings, profile] = await Promise.all([
      db.getAuthConfig(),
      db.getAllEmployees(),
      db.getAllShiftTypes(),
      db.schedules.count(),
      db.getAppSettings(),
      db.getBusinessProfile(),
    ]);
    setAuthConfig(auth);
    setAppSettings(settings);
    setBusinessProfile(profile);
    setTempProfileName(profile.name);
    setDbStats({
      employees: emps.length,
      shifts: shifts.length,
      schedules: scheds,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleBackup = async () => {
    const db = getDB();
    const raw = await db.exportAll();
    downloadBackup({
      version: "1.2",
      exportedAt: new Date().toISOString(),
      ...raw,
    });
    toast.success("Backup berhasil dicadangkan ke file JSON.");
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingRestoreFile(file);
    setShowRestoreConfirm(true);
  };

  const confirmedRestore = async () => {
    if (!pendingRestoreFile) return;
    try {
      setRestoreStatus("Memproses...");
      const data = await parseBackupFile(pendingRestoreFile);
      const db = getDB();
      await db.importAll(data);
      toast.success("Restore berhasil! Memuat ulang...");
      setRestoreStatus("Restore berhasil! Memuat ulang...");
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      toast.error("Gagal restore: " + (e as Error).message);
      setRestoreStatus("Gagal: " + (e as Error).message);
    } finally {
      setPendingRestoreFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClearAllData = async () => {
    setShowClearConfirm(true);
  };

  const confirmedClearAll = async () => {
    const db = getDB();
    await db.clearAllData();
    toast.success("Workspace telah di-reset total ke pengaturan pabrik.");
    // Clear demo/local UI state
    await load();
    setShowClearConfirm(false);
    // Trigger theme reset check
    window.dispatchEvent(new CustomEvent("theme-changed"));
  };

  const confirmedDeactivate = async () => {
    const db = getDB();
    await db.authConfig.clear();
    localStorage.removeItem("sp_logged_out"); // Clear session if any
    toast.success("Aktivasi berhasil dihapus dari perangkat ini.");
    window.location.href = "/";
  };

  const saveSettings = async (newSettings: AppSettings) => {
    setIsSavingSettings(true);
    try {
      const db = getDB();
      await db.saveAppSettings(newSettings);
      setAppSettings(newSettings);

      // Dispatch theme change event for real-time reactivity
      window.dispatchEvent(new CustomEvent("theme-changed"));

      toast.success("Konfigurasi bisnis berhasil disimpan.");
    } catch (e) {
      toast.error("Gagal menyimpan: " + (e as Error).message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const toggleClosedDay = (day: number) => {
    const next = appSettings.shopClosedDays.includes(day)
      ? appSettings.shopClosedDays.filter((d) => d !== day)
      : [...appSettings.shopClosedDays, day];
    saveSettings({ ...appSettings, shopClosedDays: next });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error("Ukuran logo terlalu besar (Max 1MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const db = getDB();
      await db.saveBusinessProfile({ ...businessProfile, logo: base64 });
      setBusinessProfile((prev) => ({ ...prev, logo: base64 }));
      toast.success("Logo berhasil diperbarui!");
    };
    reader.readAsDataURL(file);
  };

  const saveProfileName = async () => {
    const db = getDB();
    await db.saveBusinessProfile({ ...businessProfile, name: tempProfileName });
    setBusinessProfile((prev) => ({ ...prev, name: tempProfileName }));
    toast.success("Nama bisnis diperbarui!");
  };

  const presetColors = [
    "#D0F500", // Original Neon
    "#3B82F6", // Blue
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#8B5CF6", // Violet
    "#EC4899", // Pink
    "#000000", // Black
  ];

  return (
    <div className="min-h-screen p-8 pt-10 max-w-8xl mx-auto space-y-12 bg-[#F8F8FA]">
      {/* Header Section */}
      <div className="space-y-1 text-black">
        <h1 className="text-5xl font-black tracking-tighter leading-none">
          Pengaturan
        </h1>
        <p className="text-(--color-muted) font-medium text-base mt-2">
          Kelola lisensi, cadangan data, dan preferensi operasional workspace
          Anda.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-white border border-black/15 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up">
          {/* License Info */}
          <div className="bg-white rounded-2xl p-10 border border-black/15 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-(--color-primary)/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:bg-(--color-primary)/15 transition-colors" />

            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center shadow-lg">
                  <Shield className="w-7 h-7 text-(--color-primary)" />
                </div>
                <div>
                  <h2 className="font-black text-xl text-black tracking-tight leading-none">
                    Status Lisensi
                  </h2>
                  <p className="text-[10px] text-(--color-muted) font-black uppercase mt-2 tracking-widest leading-none">
                    Informasi Aktivasi
                  </p>
                </div>
              </div>
              {authConfig?.isActive && (
                <div className="flex items-center gap-2 bg-(--color-primary) text-black text-[10px] font-black px-4 py-2 rounded-md  uppercase tracking-tighter">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Aktif
                </div>
              )}
            </div>

            {authConfig ? (
              <div className="space-y-4 relative z-10">
                <div className="p-5 rounded-2xl bg-[#F8F8FA] border border-black/5 hover:border-black/10 transition-all group/item">
                  <p className="text-[10px] font-black text-(--color-muted)/40 uppercase mb-2 tracking-widest">
                    Kunci Lisensi
                  </p>
                  <p className="font-mono font-black text-sm tracking-[0.2em] text-black">
                    {authConfig.licenseKey}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-[#F8F8FA] border border-black/5">
                    <p className="text-[10px] font-black text-(--color-muted)/40 uppercase mb-2 tracking-widest">
                      Aktif Sejak
                    </p>
                    <p className="font-black text-xs text-black">
                      {formatDateId(new Date(authConfig.activatedAt))}
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#F8F8FA] border border-black/5">
                    <p className="text-[10px] font-black text-(--color-muted)/40 uppercase mb-2 tracking-widest">
                      Hardware ID
                    </p>
                    <p className="font-mono text-[9px] truncate font-black text-black/40 italic">
                      #{authConfig.hardwareId.slice(0, 12)}...
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center relative z-10">
                <div className="w-16 h-16 rounded-xl bg-red-50 flex items-center justify-center mb-4 border border-red-100">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-sm font-black text-red-500 uppercase tracking-widest">
                  Belum Diaktifkan
                </p>
              </div>
            )}
          </div>

          {/* Business Profile */}
          <div className="bg-white rounded-2xl p-10 border border-black/15 relative overflow-hidden group">
            {/* Card Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:bg-amber-500/10 transition-colors" />

            <div className="flex items-center gap-5 mb-10 relative z-10">
              <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <h2 className="font-black text-xl text-black tracking-tight leading-none">
                  Profil Bisnis
                </h2>
                <p className="text-[10px] text-(--color-muted) font-black uppercase mt-2 tracking-widest leading-none">
                  Identitas Workspace
                </p>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-[#F8F8FA] border border-black/5">
                <div
                  className="w-24 h-24 rounded-2xl bg-white border border-black/10 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-(--color-primary) transition-all group/logo"
                  onClick={() =>
                    document.getElementById("logo-upload")?.click()
                  }
                >
                  {businessProfile.logo ? (
                    <img
                      src={businessProfile.logo}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-(--color-muted)/40">
                      <Upload className="w-6 h-6" />
                      <span className="text-[8px] font-black uppercase">
                        Upload
                      </span>
                    </div>
                  )}
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <p className="text-[10px] font-black text-(--color-muted)/40 uppercase mb-2 tracking-widest">
                      Nama Bisnis / Toko
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempProfileName}
                        onChange={(e) => setTempProfileName(e.target.value)}
                        className="flex-1 bg-white border border-black/10 rounded-xl px-4 py-3 text-sm font-black focus:ring-2 focus:ring-(--color-primary) outline-none"
                        placeholder="Nama Toko Anda"
                      />
                      <button
                        onClick={saveProfileName}
                        className="bg-black text-white px-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-(--color-primary) hover:text-black transition-all"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deactivate Option */}
              <div className="pt-6 border-t border-black/5">
                <button
                  onClick={() => setShowDeactivateConfirm(true)}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700 text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Aktivasi dari Perangkat Ini
                </button>
                <p className="mt-2 text-[9px] text-(--color-muted) leading-relaxed">
                  Gunakan ini jika Anda ingin menggunakan kunci lisensi ini di
                  perangkat lain. Data internal Anda tidak akan dihapus.
                </p>
              </div>
            </div>
          </div>

          {/* Theme Personalization */}
          <div className="bg-white rounded-2xl p-10 border border-black/15 relative overflow-hidden group">
            {/* Card Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:bg-purple-500/10 transition-colors" />

            <div className="flex items-center gap-5 mb-10 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shrink-0">
                <Palette className="w-6 h-6 text-(--color-primary)" />
              </div>
              <div>
                <h2 className="font-black text-xl text-black tracking-tight leading-none">
                  Personalisasi Tema
                </h2>
                <p className="text-[10px] text-(--color-muted) font-black uppercase mt-2 tracking-widest leading-none">
                  Aura Kontrol Panel
                </p>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="p-6 rounded-2xl bg-[#F8F8FA] border border-black/5">
                <p className="text-[10px] font-black text-(--color-muted)/40 uppercase mb-4 tracking-widest">
                  Warna Utama (Primary Color)
                </p>
                <div className="flex flex-wrap gap-3">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        saveSettings({ ...appSettings, primaryColor: color })
                      }
                      className={cn(
                        "w-10 h-10 rounded-full border-2 transition-all hover:scale-110 active:scale-95",
                        appSettings.primaryColor === color
                          ? "border-black scale-110 shadow-lg"
                          : "border-transparent",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center cursor-pointer overflow-hidden relative group/color">
                    <input
                      type="color"
                      value={appSettings.primaryColor}
                      onChange={(e) =>
                        saveSettings({
                          ...appSettings,
                          primaryColor: e.target.value,
                        })
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer w-[200%] h-[200%]"
                    />
                    <Palette className="w-4 h-4 text-black/20" />
                  </div>
                </div>
                <p className="mt-4 text-[10px] font-bold text-(--color-muted)/60 italic">
                  * Reboot aplikasi mungkin diperlukan untuk efek penuh di
                  beberapa komponen.
                </p>
              </div>
            </div>
          </div>

          {/* Database Stats */}
          <div className="bg-white rounded-2xl p-10 border border-black/15 relative overflow-hidden group">
            {/* Card Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-500/10 transition-colors" />

            <div className="flex items-center gap-5 mb-10 relative z-10">
              <div className="w-14 h-14 rounded-xl bg-[#F8F8FA] flex items-center justify-center border border-black/5">
                <Info className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h2 className="font-black text-xl text-black tracking-tight leading-none">
                  Statistik Data
                </h2>
                <p className="text-[10px] text-(--color-muted) font-black uppercase mt-2 tracking-widest leading-none">
                  Penyimpanan Lokal
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 relative z-10">
              {[
                {
                  label: "Karyawan",
                  value: dbStats.employees,
                  color: "text-blue-600",
                },
                {
                  label: "Shift",
                  value: dbStats.shifts,
                  color: "text-blue-500",
                },
                {
                  label: "Jadwal",
                  value: dbStats.schedules,
                  color: "text-emerald-500",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#F8F8FA] rounded-2xl p-5 text-center border border-black/5 hover:border-black/15 transition-all"
                >
                  <p
                    className={cn(
                      "text-3xl font-black mb-1.5 tabular-nums",
                      stat.color,
                    )}
                  >
                    {stat.value.toString().padStart(2, "0")}
                  </p>
                  <p className="text-[10px] font-black text-(--color-muted)/40 uppercase tracking-widest">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-[11px] text-(--color-muted)/40 font-black text-center italic tracking-tight relative z-10">
              * Seluruh data disimpan terenkripsi di browser ini.
            </p>
          </div>

          {/* Backup & Restore */}
          <div className="bg-white rounded-2xl p-10 border border-black/15 md:col-span-2 relative overflow-hidden group">
            {/* Card Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:bg-emerald-500/10 transition-colors" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
              <div className="max-w-lg">
                <h2 className="font-black text-3xl text-black tracking-tighter mb-2">
                  Pusat Kendali Cadangan
                </h2>
                <p className="text-base text-(--color-muted) font-medium leading-relaxed">
                  Gunakan fitur export untuk mengamankan data Anda ke file
                  portabel. Sangat disarankan untuk melakukan backup rutin
                  sebelum melakukan reset data.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleBackup}
                  className="h-16 px-10 bg-black text-white rounded-lg flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 font-black text-base"
                >
                  <Download
                    className="w-5 h-5 text-[#D0F500]"
                    strokeWidth={3}
                  />
                  Backup Data
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-10 h-16 bg-white border border-black/15 rounded-lg font-black text-base flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 hover:bg-black hover:text-white"
                >
                  <Upload className="w-5 h-5" /> Import Data
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleRestore}
                />
              </div>
            </div>
            {restoreStatus && (
              <div className="mt-8 p-5 rounded-2xl bg-blue-50 text-blue-700 text-sm font-black text-center border border-blue-100 animate-pulse relative z-10">
                {restoreStatus}
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 rounded-2xl p-10 border border-red-200 md:col-span-2 relative overflow-hidden group">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center border border-red-200">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="font-black text-3xl text-red-900 tracking-tighter leading-none">
                    Opsi Destruktif
                  </h2>
                </div>
                <p className="text-base text-red-700/60 font-medium max-w-md leading-relaxed">
                  Tindakan ini akan menghapus permanen seluruh data karyawan,
                  jadwal, dan preferensi di workspace ini.
                </p>
              </div>
              <button
                onClick={handleClearAllData}
                className="h-16 px-10 rounded-md bg-red-600 text-white font-semibold text-base flex items-center justify-center gap-3 shadow-xl shadow-red-600/20 transition-all hover:bg-black hover:shadow-black/30 hover:scale-105 active:scale-95 relative z-10"
              >
                <Trash2 className="w-5 h-5" />
                Reset Factory Sistem
              </button>
            </div>

            <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:opacity-10 transition-all duration-700 pointer-events-none">
              <AlertTriangle className="w-64 h-64 text-red-600 rotate-12" />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        open={showRestoreConfirm}
        onOpenChange={setShowRestoreConfirm}
        title="Restore Data?"
        description="Tindakan ini akan MENGGANTI SEMUA data karyawan, shift, dan jadwal saat ini dengan data dari file backup. Pastikan Anda sudah membackup data saat ini jika diperlukan. Lanjutkan?"
        onConfirm={confirmedRestore}
        confirmText="Ya, Restore Data"
        variant="primary"
      />

      <ConfirmModal
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        title="Bersihkan Semua Data?"
        description="PERINGATAN: Seluruh data karyawan, shift, dan jadwal akan dihapus secara permanen dari browser ini. Tindakan ini TIDAK BISA dibatalkan. Anda yakin?"
        onConfirm={confirmedClearAll}
        confirmText="Ya, Hapus Permanen"
        variant="danger"
      />

      <ConfirmModal
        open={showDeactivateConfirm}
        onOpenChange={setShowDeactivateConfirm}
        title="Hapus Aktivasi Lisensi?"
        description="Tindakan ini akan mencabut lisensi dari perangkat ini. Anda akan diarahkan ke halaman aktivasi. Data karyawan dan jadwal Anda TETAP AMAN."
        onConfirm={confirmedDeactivate}
        confirmText="Ya, Cabut Lisensi"
        variant="danger"
      />
    </div>
  );
}
