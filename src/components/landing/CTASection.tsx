"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const featureCategories = [
  {
    title: "Core Operations",
    items: [
      "Unlimited karyawan & shift",
      "Auto-rolling shift otomatis",
      "Deteksi konflik realtime",
    ],
  },
  {
    title: "Data & Security",
    items: [
      "100% offline setelah aktivasi",
      "Backup / Restore database",
      "1 lisensi = 1 perangkat",
    ],
  },
  {
    title: "Reporting & Access",
    items: [
      "Ekspor Excel & Gambar (PNG)",
      "Instalasi PWA (Semua Perangkat)",
      "Updates Seumur Hidup",
    ],
  },
];

const faqs = [
  {
    q: "Apakah ini biaya berlangganan bulanan?",
    a: "Tidak. Kamu hanya perlu membayar satu kali untuk mendapatkan lisensi seumur hidup (Lifetime Access). Tidak ada biaya tersembunyi atau tagihan berulang.",
  },
  {
    q: "Bagaimana jika saya ganti perangkat?",
    a: "Satu lisensi berlaku untuk satu perangkat aktif. Kamu bisa memindahkan lisensi ke perangkat baru dengan menghubungi tim dukungan kami.",
  },
  {
    q: "Apakah data saya tersimpan di cloud?",
    a: "Secara default, data kamu 100% tersimpan secara lokal di browser perangkat kamu. Kamu memiliki kontrol penuh atas privasi data tim kamu.",
  },
  {
    q: "Apakah aplikasi ini butuh internet?",
    a: "Hanya saat aktivasi lisensi pertama kali. Setelah itu, seluruh fitur ShiftPlanner dapat dijalankan sepenuhnya tanpa koneksi internet sama sekali.",
  },
];

export default function CTASection() {
  return (
    <section id="pricing" className="py-24 px-6 bg-[#F8F8FA]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block bg-black text-white text-[10px] font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-[0.2em]">
            Investment
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter mb-4">
            Satu Harga untuk <br className="sm:hidden" />
            <span className="text-(--color-primary)">Selamanya.</span>
          </h2>
          <p className="text-(--color-muted) font-medium max-w-xl mx-auto">
            Hentikan biaya langganan yang menguras kantong. Dapatkan kontrol
            penuh atas jadwal tim kamu dengan sekali bayar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Detailed Features Matrix */}
          <div className="lg:col-span-7 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featureCategories.map((cat, i) => (
                <div key={i} className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-black/40">
                    {cat.title}
                  </h4>
                  <ul className="space-y-3">
                    {cat.items.map((item, ii) => (
                      <li
                        key={ii}
                        className="flex items-center gap-3 text-sm font-bold text-black"
                      >
                        <div className="w-5 h-5 rounded-full bg-(--color-primary) flex items-center justify-center shrink-0">
                          <Check
                            className="w-3 h-3 text-black"
                            strokeWidth={4}
                          />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Testimonial/Trust Badge Placeholder or extra info */}
            <div className="p-8 bg-slate-800 rounded-2xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-(--color-primary) opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <p className="text-lg font-light leading-relaxed mb-4 italic">
                  "ShiftPlanner membantu kami menghemat jam kerja setiap
                  minggunya dalam mengatur shift 50+ karyawan kami secara
                  offline."
                </p>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-black">Budi Santoso</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">
                      Manager Operasional
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-8 lg:p-10 border border-black/15 relative">
              <div className="absolute -top-4 right-8 bg-(--color-primary) text-black text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                Best Value
              </div>

              <div className="mb-10">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-sm font-black text-(--color-muted)">
                    Rp
                  </span>
                  <span className="text-6xl font-black text-black tracking-tighter">
                    199k
                  </span>
                  <span className="text-sm font-bold text-(--color-muted)">
                    /flat
                  </span>
                </div>
                <p className="text-sm font-bold text-(--color-muted) uppercase tracking-wide">
                  Lifetime Business License
                </p>
              </div>

              <div className="space-y-4 mb-10">
                <Link
                  href="/activate"
                  className="w-full flex items-center justify-center gap-3 bg-black text-white h-16 rounded-md font-black text-lg transition-all hover:bg-(--color-primary) hover:text-black hover:scale-[1.02] active:scale-[0.98]"
                >
                  Dapatkan Akses Sekarang
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <p className="text-center text-[11px] font-bold text-(--color-muted) uppercase tracking-widest">
                  Aktivasi Instan & Bergaransi
                </p>
              </div>

              <div className="pt-8 border-t border-black/5 flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-[10px] font-bold text-black/60 uppercase tracking-widest">
                    Secure Checkout
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-[10px] font-bold text-black/60 uppercase tracking-widest">
                    Zero Monthly Fee
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-32 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-black text-black">
              Pertanyaan Populer
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {faqs.map((faq, i) => (
              <div key={i} className="space-y-3">
                <h4 className="text-lg font-black text-black flex gap-3">
                  <span className="text-(--color-primary)">Q.</span>
                  {faq.q}
                </h4>
                <p className="text-sm font-medium text-(--color-muted) leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
