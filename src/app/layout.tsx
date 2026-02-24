import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShiftPlanner — Manajemen Shift Karyawan",
  description: "Aplikasi penjadwalan shift karyawan otomatis berbasis lokal.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ShiftPlanner",
  },
  icons: {
    icon: "/assets/icon-meta.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#D0F500",
  width: "device-width",
  initialScale: 1,
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/assets/logo-lime.svg" />
      </head>
      <body>
        {children}
        <Toaster position="top-center" expand={false} richColors />
      </body>
    </html>
  );
}
