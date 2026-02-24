"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/employees", label: "Staf", icon: Users },
  { href: "/schedule", label: "Jadwal", icon: CalendarDays },
  { href: "/shifts", label: "Shift", icon: Clock },
  { href: "/settings", label: "Menu", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-100 bg-white/80 backdrop-blur-lg border-t border-black/5 px-6 pb-safe pt-3">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[56px] transition-all duration-300",
                isActive
                  ? "text-black scale-110"
                  : "text-black/40 hover:text-black/60",
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-(--color-primary) shadow-lg shadow-(--color-primary)/20"
                    : "bg-transparent",
                )}
              >
                <Icon
                  className="w-5 h-5 text-(--color-primary-fg)"
                  strokeWidth={2.5}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-all",
                  isActive ? "opacity-100" : "opacity-0 h-0 overflow-hidden",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
