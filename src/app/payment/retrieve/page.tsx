"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Search,
  Key,
  Copy,
  CheckCircle,
  Loader,
  ArrowLeft,
  Crown,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderResult {
  orderId: string;
  tier: string;
  licenseKey: string;
  purchasedAt: string;
}

export default function RetrieveLicensePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OrderResult[] | null>(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch(
        `/api/payment/status?email=${encodeURIComponent(email.trim())}`,
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Terjadi kesalahan.");
      }

      setResults(data.orders || []);
    } catch (err: any) {
      setError(err.message || "Gagal mencari. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8F8FA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-black/5">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-(--color-primary) flex items-center justify-center">
              <img
                src="/assets/logo-dark.svg"
                alt="Logo"
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="text-lg font-black tracking-tight">
              ShiftPlanner
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl p-8 lg:p-10 border border-black/5 shadow-lg shadow-black/3">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-(--color-primary) flex items-center justify-center mx-auto mb-5">
                <Key className="w-8 h-8 text-black" />
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-2">
                Ambil Ulang Lisensi
              </h1>
              <p className="text-sm text-black/40 font-medium leading-relaxed">
                Masukkan email yang Anda gunakan saat pembelian untuk mengambil
                kembali kode lisensi.
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4 mb-6">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-black transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  required
                  className="w-full h-14 bg-[#F8F8FA] border-2 border-transparent rounded-xl pl-12 pr-4 text-sm font-bold outline-none focus:border-(--color-primary) focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full h-14 bg-black text-white rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-(--color-primary) hover:text-black transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Mencari...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Cari Lisensi
                  </>
                )}
              </button>
            </form>

            {/* Error */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-bold animate-fade-in">
                {error}
              </div>
            )}

            {/* Results */}
            {results !== null && (
              <div className="space-y-4 animate-fade-in">
                {results.length === 0 ? (
                  <div className="text-center p-6 rounded-xl bg-[#F8F8FA] border border-black/5">
                    <p className="text-sm font-bold text-black/40">
                      Tidak ditemukan pembelian untuk email ini.
                    </p>
                    <button
                      onClick={() => router.push("/#pricing")}
                      className="text-sm font-bold text-(--color-primary) underline mt-3 cursor-pointer"
                    >
                      Beli Lisensi Sekarang
                    </button>
                  </div>
                ) : (
                  results.map((order) => {
                    const TierIcon = order.tier === "pro" ? Crown : User;
                    return (
                      <div
                        key={order.orderId}
                        className="p-5 rounded-2xl border border-black/5 bg-[#F8F8FA] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TierIcon className="w-4 h-4 text-black/50" />
                            <span className="text-xs font-black uppercase tracking-widest text-black/40">
                              {order.tier}
                            </span>
                          </div>
                          <span className="text-xs text-black/30 font-medium">
                            {new Date(order.purchasedAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>

                        <code className="block text-lg font-black tracking-[0.12em] text-black">
                          {order.licenseKey}
                        </code>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopy(order.licenseKey)}
                            className={cn(
                              "flex-1 h-10 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer",
                              copiedKey === order.licenseKey
                                ? "bg-green-600 text-white"
                                : "bg-black/5 text-black hover:bg-black/10",
                            )}
                          >
                            {copiedKey === order.licenseKey ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                Tersalin
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Salin
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => router.push("/activate")}
                            className="flex-1 h-10 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-(--color-primary) hover:text-black transition-all cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5" />
                            Aktifkan
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
