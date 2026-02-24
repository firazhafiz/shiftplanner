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
    <section id="pricing" className="pb-32 px-6 bg-[#F8F8FA]">
      <div className="max-w-6xl mx-auto">
        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
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
