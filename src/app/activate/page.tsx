"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Key, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { getHardwareId } from "@/lib/fingerprint";
import { getDB } from "@/lib/db/db";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

export default function ActivatePage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkActivation() {
      const db = getDB();
      if (await db.isActivated()) {
        const profile = await db.getBusinessProfile();
        if (profile.isSetupComplete) {
          router.push("/dashboard");
        } else {
          router.push("/setup");
        }
      }
    }
    checkActivation();
  }, [router]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const normalizedKey = key.trim().toUpperCase();
      console.log("Starting activation for:", normalizedKey);

      const hardwareId = await getHardwareId();
      console.log("Hardware ID generated:", hardwareId);

      const res = await fetch("/api/validate-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: normalizedKey, hardwareId }),
      });

      const data = await res.json();
      console.log("API Response:", data);

      if (data.valid) {
        console.log("License valid, saving to local DB...");
        try {
          const db = getDB();
          await db.saveActivation({
            licenseKey: normalizedKey,
            hardwareId,
            activatedAt: new Date(),
            isActive: true,
            tier: data.tier || "personal",
            maxDevices: data.max_devices || 1,
          });
          console.log("Local DB save successful.");

          setStatus("success");
          setMessage("Aktivasi berhasil! Mengalihkan ke dashboard...");

          // Use timeout for UX, then force redirect to setup
          setTimeout(() => {
            window.location.href = "/setup";
          }, 1500);
        } catch (dbErr: any) {
          console.error("Database save failed:", dbErr);
          throw new Error("Gagal menyimpan data aktivasi: " + dbErr.message);
        }
      } else {
        setStatus("error");
        setMessage(data.message || "Lisensi tidak valid.");
      }
    } catch (err: any) {
      console.error("Activation process failed:", err);
      setStatus("error");
      setMessage(
        err.message ||
          "Gagal terhubung ke server. Periksa koneksi internet kamu.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Branding & Info (Desktop Only) */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] bg-slate-900 relative flex-col justify-between p-12 overflow-hidden">
        {/* Animated Background Accents */}
        <div className="absolute top-0 right-0 w-full h-full">
          <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-(--color-primary) opacity-20 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] left-[-10%] w-[250px] h-[250px] rounded-full bg-(--color-primary) opacity-10 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-(--color-primary) flex items-center justify-center">
              <img
                src="/assets/logo-dark.svg"
                alt="Logo"
                className="w-7 h-7 object-contain"
              />
            </div>
            <span className="text-xl font-black text-white tracking-tighter">
              ShiftPlanner
            </span>
          </div>

          <div className="space-y-12">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tighter mb-6">
                Satu Langkah Menuju <br />
                <span className="text-(--color-primary)">Efisiensi Total.</span>
              </h2>
              <p className="text-lg text-white/60 leading-relaxed max-w-md">
                Aktifkan lisensi kamu sekarang untuk membuka fitur manajemen
                jadwal tanpa batas dan mulai optimalkan operasional tim kamu.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-6 h-6 text-(--color-primary)" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">
                    100% Offline First
                  </h4>
                  <p className="text-sm text-white/40">
                    Bekerja tanpa internet. Data tetap aman di perangkat kamu.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <img
                    src="/assets/logo-lime.svg"
                    alt="Logo"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Aktivasi Instan</h4>
                  <p className="text-sm text-white/40">
                    Masukkan kunci, dan aplikasi siap digunakan dalam detik.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-(--color-primary)" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">
                    Dukungan Prioritas
                  </h4>
                  <p className="text-sm text-white/40">
                    Tim kami siap membantu jika kamu mengalami kendala aktivasi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Activation Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-[#F8F8FA]">
        {/* Mobile Logo (visible only on mobile) */}
        <div className="md:hidden flex flex-col items-center mb-12">
          <div className="md:w-16 md:h-16 w-12 h-12 rounded-2xl bg-(--color-primary) flex items-center justify-center mb-4 ">
            <img
              src="/assets/logo-dark.svg"
              alt="Logo"
              className="md:w-10 md:h-10 w-8 h-8 object-contain"
            />
          </div>
          <h1 className="text-2xl font-black text-black">ShiftPlanner</h1>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-8 lg:p-10 border border-black/5 shadow-lg shadow-black/3">
            <div className="mb-10 sm:text-left text-center">
              <h1 className="text-3xl font-bold text-black tracking-tight mb-3">
                Aktifkan Lisensi
              </h1>
              <p className="text-(--color-muted) text-sm font-medium leading-relaxed">
                Silakan masukkan 16 digit kunci lisensi yang kamu dapatkan untuk
                melanjutkan penggunaan aplikasi.
              </p>
            </div>

            <form onSubmit={handleActivate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-(--color-muted) ml-1">
                  License Key
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-black text-(--color-muted)">
                    <Key className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className={cn(
                      "w-full h-16 bg-[#F8F8FA] border-2 border-transparent rounded-md pl-12 pr-4",
                      "text-lg font-mono font-black tracking-widest uppercase outline-none",
                      "focus:border-(--color-primary) focus:bg-white transition-all",
                      status === "error" && "border-red-500/20 bg-red-50/30",
                    )}
                    disabled={status === "loading" || status === "success"}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  !key.trim() || status === "loading" || status === "success"
                }
                className={cn(
                  "w-full h-16 bg-black text-white rounded-md font-black text-lg",
                  "flex items-center justify-center gap-3 transition-all",
                  "hover:bg-(--color-primary) hover:text-black hover:scale-[1.02] active:scale-[0.98]",
                  "disabled:opacity-20 disabled:cursor-not-allowed disabled:transform-none",
                  "cursor-pointer hover:shadow-(--color-primary)/20",
                )}
              >
                {status === "loading" ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Memverifikasi...
                  </>
                ) : status === "success" ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Berhasil Diaktifkan
                  </>
                ) : (
                  <>
                    <img
                      src="/assets/logo-lime.svg"
                      alt="Logo"
                      className="w-5 h-5 object-contain filter-[brightness(0)]"
                    />
                    Aktifkan Sekarang
                  </>
                )}
              </button>
            </form>

            {message && (
              <div
                className={cn(
                  "mt-6 flex items-start gap-4 p-4 rounded-2xl animate-fade-in",
                  status === "success"
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100",
                )}
              >
                {status === "success" ? (
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <p className="text-sm font-bold leading-relaxed">{message}</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-6">
            <div className="relative z-10">
              <p className="text-xs text-black font-light tracking-widest uppercase">
                ShiftPlanner Business Suite v0.1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
