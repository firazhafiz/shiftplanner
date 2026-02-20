"use client";

import Sidebar from "@/components/shared/Sidebar";
import ActivationGate from "@/components/shared/ActivationGate";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ActivationGate>
      <div className="min-h-screen bg-[#F8F8FA]">
        <Sidebar />
        <main className="transition-all duration-300 ml-[72px]">
          {children}
        </main>
      </div>
    </ActivationGate>
  );
}
