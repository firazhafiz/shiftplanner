import { Github, Twitter, Linkedin, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-24 pb-12 px-6 border-t border-white/10 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D0F500]/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 relative z-10">
        {/* Brand */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D0F500] flex items-center justify-center">
              <img
                src="/assets/logo-dark.svg"
                alt="Logo"
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="font-bold text-xl tracking-tight">
              ShiftPlanner
            </span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Kelola jadwal shift karyawan tanpa ribet. 100% lokal, tanpa server,
            data aman di browser Anda.
          </p>
          <div className="flex gap-4">
            {[Twitter, Github, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#D0F500] hover:text-black hover:border-[#D0F500] transition-all duration-300"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Product */}
        <div>
          <h4 className="font-bold text-lg mb-6 text-white">Produk</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li>
              <a
                href="#features"
                className="hover:text-[#D0F500] transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D0F500] opacity-0 group-hover:opacity-100 transition-opacity" />{" "}
                Fitur Utama
              </a>
            </li>
            <li>
              <a
                href="#pricing"
                className="hover:text-[#D0F500] transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D0F500] opacity-0 group-hover:opacity-100 transition-opacity" />{" "}
                Harga
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-[#D0F500] transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D0F500] opacity-0 group-hover:opacity-100 transition-opacity" />{" "}
                Cara Kerja
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-[#D0F500] transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D0F500] opacity-0 group-hover:opacity-100 transition-opacity" />{" "}
                Changelog
              </a>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="font-bold text-lg mb-6 text-white">Resources</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li>
              <a href="#" className="hover:text-[#D0F500] transition-colors">
                Dokumentasi
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#D0F500] transition-colors">
                Panduan
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#D0F500] transition-colors">
                Support
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#D0F500] transition-colors">
                API Status
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-bold text-lg mb-6 text-white">Stay Updated</h4>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            Dapatkan tips mengelola shift dan update terbaru langsung ke
            inboxmu.
          </p>
          <div className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email instansi..."
              className="bg-white/5 border border-white/60 rounded-md px-4 py-3 text-sm w-full focus:outline-none focus:border-[#D0F500]/50 focus:bg-white/10 transition-all text-white placeholder:text-white/40"
            />
            <button className="bg-[#D0F500] text-black font-bold py-3 rounded-md hover:bg-[#b8d900] transition-all flex items-center justify-center gap-2 group">
              Subscribe
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p>© 2026 ShiftPlanner. All rights reserved.</p>
        <div className="flex items-center gap-8">
          <a href="#" className="hover:text-white transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
