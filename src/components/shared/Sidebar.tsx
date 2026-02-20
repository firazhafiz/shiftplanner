"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDB } from "@/lib/db/db";
import ConfirmModal from "./ConfirmModal";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Karyawan", icon: Users },
  { href: "/shifts", label: "Master Shift", icon: Clock },
  { href: "/schedule", label: "Jadwal", icon: CalendarDays },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(true);
  };

  const confirmedLogout = async () => {
    const db = getDB();
    await db.authConfig.clear();
    window.location.href = "/";
  };

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed left-0 top-0 h-screen z-50 flex flex-col",
        "bg-white border-r border-(--color-border)",
        "transition-all duration-300 ease-in-out shadow-xl",
        isHovered ? "w-[260px]" : "w-[72px]",
        "group",
      )}
    >
      {/* Logo Section */}
      <div
        className={cn(
          "flex items-center h-20 border-b border-(--color-border) shrink-0 transition-all duration-300",
          isHovered ? "px-6 gap-3" : "justify-center",
        )}
      >
        <div className="w-10 h-10 rounded-lg bg-(--color-primary) flex items-center justify-center shrink-0 shadow-sm border border-black/5">
          <img
            src="/assets/logo-dark.svg"
            alt="Logo"
            className="w-7 h-7 object-contain"
          />
        </div>
        <div
          className={cn(
            "flex flex-col overflow-hidden transition-all duration-300",
            isHovered
              ? "opacity-100 translate-x-0 w-auto"
              : "opacity-0 -translate-x-4 pointer-events-none w-0 hidden",
          )}
        >
          <span className="font-black text-lg text-(--color-fg) tracking-tight leading-tight">
            ShiftPlanner
          </span>
          <span className="text-[10px] text-(--color-muted) font-bold uppercase tracking-widest">
            Business Suite
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-2 overflow-y-auto overflow-x-hidden px-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "nav-item flex items-center rounded-xl transition-all duration-200 group relative h-12 w-full",
                isActive
                  ? "bg-(--color-primary) text-black font-bold shadow-md shadow-(--color-primary)/20"
                  : "text-(--color-muted) hover:bg-(--color-surface) hover:text-(--color-fg)",
                isHovered ? "justify-start px-4 gap-3" : "justify-center",
              )}
              title={item.label}
            >
              <Icon
                className={cn(
                  "w-[20px] h-[20px] shrink-0 transition-colors",
                  isActive
                    ? "text-black"
                    : "text-(--color-muted) group-hover:text-(--color-fg)",
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "transition-all duration-300 text-sm tracking-tight whitespace-nowrap",
                  isHovered
                    ? "opacity-100 translate-x-0 block"
                    : "opacity-0 -translate-x-4 pointer-events-none hidden",
                )}
              >
                {item.label}
              </span>
              {isActive && isHovered && (
                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-black/20 hidden md:block" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="px-3 py-4 border-t border-(--color-border) space-y-2 shrink-0 bg-(--color-bg)">
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center rounded-xl transition-all duration-200 h-12",
            "text-red-500 hover:bg-red-50 font-semibold text-sm",
            isHovered ? "justify-start px-4 gap-3" : "justify-center",
          )}
          title="Keluar"
        >
          <LogOut className="w-5 h-5 shrink-0" strokeWidth={2.5} />
          <span
            className={cn(
              "transition-all duration-300 text-sm font-semibold whitespace-nowrap",
              isHovered
                ? "opacity-100 translate-x-0 block"
                : "opacity-0 -translate-x-4 pointer-events-none hidden",
            )}
          >
            Keluar
          </span>
        </button>
      </div>
      <ConfirmModal
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Keluar Aplikasi?"
        description="Apakah Anda yakin ingin keluar dari aplikasi? Anda harus memasukkan kunci lisensi kembali untuk masuk ke workspace ini."
        onConfirm={confirmedLogout}
        confirmText="Ya, Keluar"
        variant="danger"
      />
    </aside>
  );
}
