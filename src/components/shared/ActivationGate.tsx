"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getDB } from "@/lib/db/db";

interface ActivationGateProps {
  children: React.ReactNode;
}

export default function ActivationGate({ children }: ActivationGateProps) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function check() {
      try {
        const db = getDB();
        const activated = await db.isActivated();
        if (!activated && pathname !== "/activate") {
          router.replace("/activate");
        }
      } catch {
        // IndexedDB not available — redirect to activate
        router.replace("/activate");
      } finally {
        setChecking(false);
      }
    }
    check();
  }, [router, pathname]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-(--color-primary) flex items-center justify-center animate-pulse">
            <span className="text-xl">⚡</span>
          </div>
          <p className="text-sm text-(--color-muted)">Memeriksa lisensi...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
