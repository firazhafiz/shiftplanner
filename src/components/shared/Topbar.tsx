"use client";

import { useState, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Image,
} from "lucide-react";
import { formatDateId } from "@/lib/utils";
import { getDB } from "@/lib/db/db";
import { downloadBackup, parseBackupFile } from "@/lib/export/dbBackup";
import { exportScheduleAsImage } from "@/lib/export/imageExport";
import type { BackupData } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ConfirmModal from "./ConfirmModal";

interface TopbarProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  showScheduleExport?: boolean;
  sidebarCollapsed?: boolean;
}

export default function Topbar({
  year,
  month,
  onMonthChange,
  showScheduleExport = false,
  sidebarCollapsed = false,
}: TopbarProps) {
  const [exporting, setExporting] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingRestoreFile, setPendingRestoreFile] = useState<File | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePrevMonth = () => {
    if (month === 1) onMonthChange(year - 1, 12);
    else onMonthChange(year, month - 1);
  };

  const handleNextMonth = () => {
    if (month === 12) onMonthChange(year + 1, 1);
    else onMonthChange(year, month + 1);
  };

  const handleBackup = useCallback(async () => {
    try {
      const db = getDB();
      const raw = await db.exportAll();
      const backup: BackupData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        ...raw,
      };
      downloadBackup(backup);
      toast.success("Backup berhasil diunduh.");
    } catch (e) {
      toast.error("Gagal membuat backup: " + (e as Error).message);
    }
  }, []);

  const handleRestore = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setPendingRestoreFile(file);
      setShowRestoreConfirm(true);
    },
    [],
  );

  const confirmedRestore = async () => {
    if (!pendingRestoreFile) return;
    try {
      const data = await parseBackupFile(pendingRestoreFile);
      const db = getDB();
      await db.importAll(data);
      toast.success("Restore berhasil! Memuat ulang...");
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      toast.error("Gagal restore: " + (e as Error).message);
    } finally {
      setPendingRestoreFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleExportImage = useCallback(async () => {
    setExporting(true);
    try {
      await exportScheduleAsImage(
        "schedule-grid",
        `jadwal-${year}-${month}.png`,
      );
      toast.success("Gambar berhasil diekspor.");
    } catch (e) {
      toast.error("Gagal ekspor gambar: " + (e as Error).message);
    } finally {
      setExporting(false);
    }
  }, [year, month]);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 z-30 flex items-center justify-between px-6",
        "bg-white/90 backdrop-blur-sm border-b border-(--color-border)",
        "transition-all duration-300",
        sidebarCollapsed ? "left-[68px]" : "left-[240px]",
      )}
    >
      {/* Month Navigator */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePrevMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-(--color-surface) transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold text-[15px] min-w-[160px] text-center">
          {formatDateId(new Date(year, month - 1, 1), "MMMM yyyy")}
        </span>
        <button
          onClick={handleNextMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-(--color-surface) transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {showScheduleExport && (
          <button
            onClick={handleExportImage}
            disabled={exporting}
            className="btn-outline text-sm py-1.5 px-3"
          >
            <Image className="w-4 h-4" />
            {exporting ? "Mengekspor..." : "Simpan Gambar"}
          </button>
        )}
        <button
          onClick={handleBackup}
          className="btn-outline text-sm py-1.5 px-3"
        >
          <Download className="w-4 h-4" />
          Backup
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-outline text-sm py-1.5 px-3"
        >
          <Upload className="w-4 h-4" />
          Restore
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleRestore}
        />
      </div>

      <ConfirmModal
        open={showRestoreConfirm}
        onOpenChange={setShowRestoreConfirm}
        title="Restore Data?"
        description="Tindakan ini akan MENGGANTI SEMUA data karyawan, shift, dan jadwal saat ini dengan data dari file backup. Lanjutkan?"
        onConfirm={confirmedRestore}
        confirmText="Ya, Restore Data"
        variant="primary"
      />
    </header>
  );
}
