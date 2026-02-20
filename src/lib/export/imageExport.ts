// ============================================================
// Image Export — Capture schedule grid as PNG
// ============================================================

import { toPng } from "html-to-image";

export async function exportScheduleAsImage(
  elementId: string,
  filename = "jadwal.png",
): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element #${elementId} not found`);

  const dataUrl = await toPng(el, {
    quality: 0.95,
    pixelRatio: 2, // High DPI / Retina
    backgroundColor: "#ffffff",
  });

  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
