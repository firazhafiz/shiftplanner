"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDB } from "@/lib/db/db";

export default function LandingGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkState() {
      try {
        const db = getDB();
        const activated = await db.isActivated();
        const loggedOut = localStorage.getItem("sp_logged_out") === "true";

        if (activated && !loggedOut) {
          const profile = await db.getBusinessProfile();
          if (profile.isSetupComplete) {
            router.replace("/dashboard");
          } else {
            router.replace("/setup");
          }
        }
      } catch (e) {
        console.error("LandingGate check failed:", e);
      } finally {
        setChecking(false);
      }
    }
    checkState();
  }, [router]);

  // We show a simple loader if we're redirecting,
  // but if we're staying on landing, we show children immediately
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 rounded-2xl bg-[#D0F500] flex items-center justify-center animate-pulse">
          <span className="text-xl">⚡</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
