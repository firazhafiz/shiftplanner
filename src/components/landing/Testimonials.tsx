"use client";

import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote:
      "Jujur, bikin jadwal shift tadinya butuh waktu 3 jam tiap minggu. Pake ShiftPlanner cuma 5 menit. Solver otomatisnya beneran pinter!",
    author: "Budi Santoso",
    role: "Owner, Kopi Kenangan Manis",
    rating: 5,
  },
  {
    quote:
      "Fitur custom branding-nya gila sih. Hasil export jadwal saya ada logo toko sendiri, jadi kelihatan profesional banget di depan karyawan.",
    author: "Siska Amelia",
    role: "Manager, Boutique Siska",
    rating: 5,
  },
  {
    quote:
      "Awalnya ragu karena aplikasinya lokal, ternyata malah enak banget. Ga perlu internet, data aman di laptop saya sendiri. Best investment!",
    author: "Reza Pahlevi",
    role: "Proprietor, Reza Gym & Fitness",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-24 bg-[#F8F8FA] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-(--color-primary) bg-black inline-block px-4 py-1.5 rounded-full">
            Testimonials
          </h2>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-black leading-none">
            Apa Kata Mereka?
          </h1>
          <p className="text-(--color-muted) font-medium text-lg max-w-2xl mx-auto">
            Dengarkan langsung dari para pengusaha yang sudah membebaskan diri
            dari drama penjadwalan manual.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white p-10 rounded-2xl border border-black/15 transition-all duration-300 flex flex-col group"
            >
              <div className="mb-6 flex gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-(--color-primary) text-(--color-primary)"
                  />
                ))}
              </div>

              <div className="relative mb-8">
                <Quote className="absolute -top-4 -left-4 w-12 h-12 text-black/5 -z-10 group-hover:text-(--color-primary)/20 transition-colors" />
                <p className="text-black/80 font-medium italic leading-relaxed text-lg">
                  "{t.quote}"
                </p>
              </div>

              <div className="mt-auto pt-8 border-t border-black/5">
                <h4 className="font-black text-black tracking-tight">
                  {t.author}
                </h4>
                <p className="text-[10px] font-bold text-(--color-muted) uppercase tracking-widest mt-1">
                  {t.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Featured logos or trust badge */}
        <div className="mt-10 pt-10 border-t border-black/5 flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="text-xl font-black tracking-tighter">
            COFFEE HOUSES
          </div>
          <div className="text-xl font-black tracking-tighter">RETAIL SHOP</div>
          <div className="text-xl font-black tracking-tighter">
            GYM & STUDIO
          </div>
          <div className="text-xl font-black tracking-tighter">
            FASHION BRAND
          </div>
        </div>
      </div>
    </section>
  );
}
