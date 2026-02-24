"use client";

import Sidebar from "@/components/shared/Sidebar";
import BottomNav from "@/components/shared/BottomNav";
import ActivationGate from "@/components/shared/ActivationGate";
import ThemeHandler from "@/components/shared/ThemeHandler";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ActivationGate>
      <div className="min-h-screen bg-[#F8F8FA]">
        <ThemeHandler />
        <Sidebar />
        <main className="transition-all duration-300 ml-0 md:ml-[72px] pb-24 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </ActivationGate>
  );
}
