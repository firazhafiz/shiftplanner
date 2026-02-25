"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  Copy,
  Loader,
  Key,
  ArrowRight,
  Clock,
  PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PaymentStatus = "polling" | "paid" | "pending" | "expired" | "failed";

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F8FA]">
          <Loader className="w-8 h-8 animate-spin text-black/20" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");

  const [status, setStatus] = useState<PaymentStatus>("polling");
  const [licenseKey, setLicenseKey] = useState("");
  const [tier, setTier] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [copied, setCopied] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const checkStatus = useCallback(async () => {
    if (!orderId) return;

    try {
      const res = await fetch(`/api/payment/status?order_id=${orderId}`);
      const data = await res.json();

      if (data.status === "paid" && data.licenseKey) {
        setStatus("paid");
        setLicenseKey(data.licenseKey);
        setTier(data.tier);
        setBuyerName(data.buyerName || "");
      } else if (data.status === "expired") {
        setStatus("expired");
      } else if (data.status === "failed") {
        setStatus("failed");
      } else {
        setStatus("pending");
      }
    } catch {
      // Keep polling on error
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    // Initial check
    checkStatus();

    // Poll every 3 seconds for up to 2 minutes
    const interval = setInterval(() => {
      setPollCount((prev) => {
        if (prev >= 40) {
          clearInterval(interval);
          return prev;
        }
        checkStatus();
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, checkStatus]);

  const handleCopy = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8FA]">
        <div className="text-center space-y-4">
          <p className="font-bold text-red-600">Order ID tidak ditemukan.</p>
          <button
            onClick={() => router.push("/")}
            className="text-sm font-bold underline cursor-pointer"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8FA] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-(--color-primary) opacity-5 blur-[150px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-500 opacity-5 blur-[120px]" />

      <div className="w-full max-w-lg relative z-10">
        {/* ── Polling / Pending State ──────────────────────────── */}
        {(status === "polling" || status === "pending") && (
          <div className="bg-white rounded-3xl p-10 border border-black/5 shadow-xl shadow-black/3 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-tight mb-3">
              Menunggu Konfirmasi Pembayaran
            </h1>
            <p className="text-sm text-black/40 font-medium mb-8 leading-relaxed">
              Sistem sedang memverifikasi pembayaran Anda. Halaman ini akan
              otomatis diperbarui.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Loader className="w-5 h-5 animate-spin text-black/30" />
              <span className="text-xs font-bold text-black/30 uppercase tracking-widest">
                Memverifikasi...
              </span>
            </div>
          </div>
        )}

        {/* ── Success State ────────────────────────────────────── */}
        {status === "paid" && (
          <div className="bg-white rounded-3xl p-10 border border-black/5 shadow-xl shadow-black/3 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-2xl font-black tracking-tight mb-2">
              Pembayaran Berhasil! 🎉
            </h1>
            {buyerName && (
              <p className="text-sm text-black/50 font-medium mb-6">
                Terima kasih, <span className="font-bold">{buyerName}</span>
              </p>
            )}

            <div className="bg-[#F8F8FA] rounded-2xl p-6 mb-6 border border-black/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-3">
                Kode Lisensi Anda ({tier?.toUpperCase()})
              </p>
              <div className="flex items-center gap-3 justify-center">
                <code className="text-2xl md:text-3xl font-black tracking-[0.15em] text-black">
                  {licenseKey}
                </code>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className={cn(
                "w-full h-14 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all mb-4 cursor-pointer",
                copied
                  ? "bg-green-600 text-white"
                  : "bg-black/5 text-black hover:bg-black/10",
              )}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Tersalin!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Salin Kode Lisensi
                </>
              )}
            </button>

            <button
              onClick={() => router.push("/activate")}
              className="w-full h-14 bg-black text-(--color-primary) rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-(--color-primary) hover:text-black transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xl shadow-(--color-primary)/10"
            >
              <Key className="w-5 h-5" />
              Aktifkan Sekarang
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-xs font-bold text-amber-700 leading-relaxed">
                ⚠️ Simpan kode lisensi ini baik-baik. Anda juga bisa
                mengambilnya kembali nanti melalui halaman{" "}
                <button
                  onClick={() => router.push("/payment/retrieve")}
                  className="underline cursor-pointer"
                >
                  Ambil Ulang Lisensi
                </button>
                .
              </p>
            </div>
          </div>
        )}

        {/* ── Expired / Failed State ───────────────────────────── */}
        {(status === "expired" || status === "failed") && (
          <div className="bg-white rounded-3xl p-10 border border-black/5 shadow-xl shadow-black/3 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">😔</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mb-3">
              Pembayaran {status === "expired" ? "Kedaluwarsa" : "Gagal"}
            </h1>
            <p className="text-sm text-black/40 font-medium mb-8">
              {status === "expired"
                ? "Invoice telah melewati batas waktu pembayaran."
                : "Terjadi masalah saat memproses pembayaran Anda."}
            </p>
            <button
              onClick={() => router.push("/#pricing")}
              className="w-full h-14 bg-black text-white rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-(--color-primary) hover:text-black transition-all cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
