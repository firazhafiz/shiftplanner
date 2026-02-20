"use client";

import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { label: "Fitur", href: "#features" },
  { label: "Cara Kerja", href: "#how-it-works" },
  { label: "Harga", href: "#pricing" },
];

export default function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll when menu is open
  if (typeof window !== "undefined") {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-5 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <nav className="bg-white/70 backdrop-blur-md rounded-full px-6 py-3.5 flex items-center border-black/40 border justify-between duration-300">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-(--color-primary) flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src="/assets/logo-dark.svg"
                  alt="Logo"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <span className="font-bold text-[16px] tracking-tight text-(--color-fg)">
                ShiftPlanner
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm font-medium text-(--color-muted) hover:text-(--color-fg) transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-(--color-primary) after:transition-all hover:after:w-full"
                >
                  {l.label}
                </a>
              ))}
              <div className="pl-4 border-l border-(--color-border)">
                <Link
                  href="/activate"
                  className="btn-primary text-sm py-2.5 px-6 shadow-sm hover:shadow-[#D0F500]/30"
                >
                  Masuk Sekarang
                </Link>
              </div>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden group flex items-center gap-2 pl-4 pr-1 py-1 bg-black text-white rounded-full hover:bg-black/80 transition-all active:scale-95"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className="text-xs font-bold pl-1">Menu</span>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black">
                {mobileOpen ? (
                  <X className="w-4 h-4" strokeWidth={2.5} />
                ) : (
                  <Menu className="w-4 h-4" strokeWidth={2.5} />
                )}
              </div>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <div
        className={`fixed inset-x-4 top-24 z-60 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden ${
          mobileOpen
            ? "translate-y-0 opacity-100 visible"
            : "-translate-y-8 opacity-0 invisible pointer-events-none"
        }`}
      >
        <button
          className="absolute -top-12 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-lg hover:bg-zinc-100 transition-colors pointer-events-auto"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
        <div className="bg-white/90 backdrop-blur-2xl border border-white/40 rounded-4xl shadow-2xl shadow-black/10 overflow-hidden p-2 ring-1 ring-black/5 relative">
          <div className="flex flex-col gap-1 p-2">
            {navLinks.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                className="flex items-center justify-between p-4 px-5 rounded-3xl hover:bg-gray-50 active:scale-[0.98] transition-all group"
                onClick={() => setMobileOpen(false)}
              >
                <span className="font-semibold text-lg text-(--color-fg)">
                  {l.label}
                </span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-black/5 group-hover:bg-[#D0F500] group-hover:scale-110 transition-all shadow-sm">
                  <ArrowRight className="w-4 h-4 text-black -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
              </a>
            ))}
            <div className="h-px bg-black/5 my-2 mx-4" />
            <Link
              href="/activate"
              className="btn-primary justify-center text-lg font-bold py-4 rounded-[1.2rem] shadow-xl shadow-[#D0F500]/20 hover:shadow-[#D0F500]/30 transition-all"
              onClick={() => setMobileOpen(false)}
            >
              Mulai Sekarang
            </Link>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-500 md:hidden ${
          mobileOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />
    </>
  );
}
