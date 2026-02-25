"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Crown,
  User,
  Check,
  Loader,
  ArrowLeft,
  Mail,
  Phone,
  UserCircle,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TIER_CONFIG: Record<
  string,
  {
    name: string;
    price: number;
    priceLabel: string;
    icon: any;
    features: string[];
    color: string;
  }
> = {
  personal: {
    name: "Personal",
    price: 99000,
    priceLabel: "Rp 99.000",
    icon: User,
    features: [
      "Karyawan TANPA BATAS",
      "Otomatisasi 31 Hari",
      "Manajemen Ketersediaan",
      "Export Gambar & Excel",
    ],
    color: "bg-blue-600",
  },
  pro: {
    name: "Professional",
    price: 349000,
    priceLabel: "Rp 349.000",
    icon: Crown,
    features: [
      "Otomatisasi TANPA BATAS",
      "Labor Cost Estimation",
      "WA Auto-Share",
      "Live Portal & Publikasi",
      "Custom Branding",
      "Template Library Lengkap",
    ],
    color: "bg-black",
  },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tier = searchParams.get("tier") || "personal";
  const failed = searchParams.get("failed");

  const config = TIER_CONFIG[tier];

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (failed) {
      setError("Pembayaran sebelumnya tidak berhasil. Silakan coba lagi.");
    }
  }, [failed]);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8FA]">
        <div className="text-center space-y-4">
          <p className="text-lg font-bold text-red-600">Tier tidak valid.</p>
          <button
            onClick={() => router.push("/")}
            className="text-sm font-bold text-black underline"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payment/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          email: email.trim(),
          name: name.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal membuat invoice.");
      }

      // Redirect to Xendit payment page
      window.location.href = data.invoiceUrl;
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-[#F8F8FA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-black/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
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
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Order Summary */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    tier === "pro"
                      ? "bg-(--color-primary) text-black"
                      : "bg-blue-100 text-blue-600",
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg">{config.name}</h3>
                  <p className="text-xs text-black/40 font-bold uppercase tracking-wider">
                    Lifetime License
                  </p>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {config.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium text-black/70">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-black/5 pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-black/50 font-medium">
                    Total
                  </span>
                  <span className="text-3xl font-black tracking-tight">
                    {config.priceLabel}
                  </span>
                </div>
                <p className="text-xs text-black/30 font-medium text-right">
                  Pembayaran sekali selamanya
                </p>
              </div>

              <div className="flex items-center gap-2 mt-6 p-3 rounded-xl bg-green-50 border border-green-100">
                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-xs font-bold text-green-700">
                  Transaksi aman & terenkripsi via Xendit
                </p>
              </div>
            </div>
          </div>

          {/* Right: Checkout Form */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-3xl p-8 lg:p-10 border border-black/5 shadow-lg shadow-black/3">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-black mb-2">
                  Informasi Pembeli
                </h1>
                <p className="text-sm text-black/40 font-medium">
                  Lengkapi data di bawah untuk melanjutkan ke pembayaran.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-widest text-black/40 ml-1">
                    Nama Lengkap *
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-black transition-colors">
                      <UserCircle className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      required
                      className="w-full h-14 bg-[#F8F8FA] border-2 border-transparent rounded-xl pl-12 pr-4 text-sm font-bold outline-none focus:border-(--color-primary) focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-widest text-black/40 ml-1">
                    Email *
                  </label>
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
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold tracking-widest text-black/40 ml-1">
                    Nomor HP *
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-black transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08123456789"
                      required
                      className="w-full h-14 bg-[#F8F8FA] border-2 border-transparent rounded-xl pl-12 pr-4 text-sm font-bold outline-none focus:border-(--color-primary) focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 animate-fade-in">
                    <p className="text-sm font-bold">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !email || !name || !phone}
                  className={cn(
                    "w-full h-16 rounded-md font-black text-base uppercase tracking-widest transition-all flex items-center justify-center gap-3 cursor-pointer",
                    tier === "pro"
                      ? "bg-black text-(--color-primary) hover:bg-(--color-primary) hover:text-black"
                      : "bg-blue-600 text-white hover:bg-blue-700",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    "disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none",
                  )}
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>Bayar {config.priceLabel}</>
                  )}
                </button>

                <p className="text-xs text-center text-black/30 font-medium leading-relaxed">
                  Dengan melanjutkan, Anda menyetujui pembelian lisensi lifetime
                  ShiftPlanner dan menerima ketentuan layanan kami.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F8FA]">
          <Loader className="w-8 h-8 animate-spin text-black/20" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
