"use client";

import { useEffect } from "react";
import { getDB } from "@/lib/db/db";

export default function ThemeHandler() {
  useEffect(() => {
    function getContrastColor(hex: string) {
      // Remove hash if present
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      // Calculate relative luminance
      const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luma > 0.6 ? "#000000" : "#FFFFFF";
    }

    async function applyTheme() {
      const db = getDB();
      const settings = await db.getAppSettings();
      const primary = settings.primaryColor || "#D0F500";
      const fg = getContrastColor(primary);

      document.documentElement.style.setProperty("--color-primary", primary);
      document.documentElement.style.setProperty("--color-primary-fg", fg);

      // Calculate active-state/darker variant (simplified: 10% dark overlay)
      // For simplicity, we just use the same or a fixed dark variant if not provided.
      document.documentElement.style.setProperty(
        "--color-primary-dark",
        primary,
      );
    }

    // Initial apply
    applyTheme();

    // Listen for changes
    window.addEventListener("theme-changed", applyTheme);
    return () => window.removeEventListener("theme-changed", applyTheme);
  }, []);

  return null;
}
