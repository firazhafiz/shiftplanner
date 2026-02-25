// ============================================================
// Image Export — Capture schedule grid as PNG
// ============================================================

import { toPng } from "html-to-image";

export async function exportScheduleAsImage(
  elementId: string,
  filename = "jadwal.png",
  tier: "starter" | "personal" | "pro" = "personal",
): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element #${elementId} not found`);

  // ── Temporarily remove overflow & sticky so the FULL table is captured ──
  const originalStyles = {
    overflow: el.style.overflow,
    maxHeight: el.style.maxHeight,
    height: el.style.height,
    width: el.style.width,
    position: el.style.position,
  };

  // Watermark Injection for Starter Tier
  let watermark: HTMLElement | null = null;
  if (tier === "starter") {
    watermark = document.createElement("div");
    watermark.innerText = "Dibuat dengan SHIFTPLANNER (Starter — Gratis)";
    watermark.style.position = "absolute";
    watermark.style.bottom = "40px";
    watermark.style.right = "40px";
    watermark.style.background = "black";
    watermark.style.color = "#D0F500";
    watermark.style.padding = "10px 20px";
    watermark.style.fontSize = "14px";
    watermark.style.fontWeight = "900";
    watermark.style.borderRadius = "8px";
    watermark.style.zIndex = "999";
    watermark.style.letterSpacing = "0.1em";
    watermark.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
    watermark.style.pointerEvents = "none";
    el.classList.add("relative"); // Ensure container is relative
    el.appendChild(watermark);
  }

  // Force the container to show everything
  el.style.overflow = "visible";
  el.style.maxHeight = "none";
  el.style.height = "auto";
  el.style.width = "max-content";

  // Remove sticky positioning from thead and first-column cells
  // so they render at their natural position in the full capture
  const stickyEls = el.querySelectorAll<HTMLElement>("[class*='sticky']");
  const stickyOriginals: {
    el: HTMLElement;
    position: string;
    left: string;
    top: string;
    zIndex: string;
  }[] = [];
  stickyEls.forEach((stickyEl) => {
    stickyOriginals.push({
      el: stickyEl,
      position: stickyEl.style.position,
      left: stickyEl.style.left,
      top: stickyEl.style.top,
      zIndex: stickyEl.style.zIndex,
    });
    stickyEl.style.position = "static";
    stickyEl.style.left = "auto";
    stickyEl.style.top = "auto";
  });

  // Hide elements with .no-export class
  const noExportEls = el.querySelectorAll<HTMLElement>(".no-export");
  noExportEls.forEach((item) => {
    item.style.display = "none";
  });

  // Wait for reflow
  await new Promise((r) => requestAnimationFrame(r));

  try {
    const dataUrl = await toPng(el, {
      quality: 0.95,
      pixelRatio: 2, // High DPI / Retina
      backgroundColor: "#ffffff",
      width: el.scrollWidth,
      height: el.scrollHeight,
      style: {
        overflow: "visible",
        transform: "none",
      },
    });

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
  } finally {
    // ── Restore all original styles ──
    el.style.overflow = originalStyles.overflow;
    el.style.maxHeight = originalStyles.maxHeight;
    el.style.height = originalStyles.height;
    el.style.width = originalStyles.width;
    el.style.position = originalStyles.position;

    noExportEls.forEach((item) => {
      item.style.display = "";
    });

    if (watermark && watermark.parentNode) {
      watermark.parentNode.removeChild(watermark);
    }

    stickyOriginals.forEach(({ el: stickyEl, position, left, top, zIndex }) => {
      stickyEl.style.position = position;
      stickyEl.style.left = left;
      stickyEl.style.top = top;
      stickyEl.style.zIndex = zIndex;
    });
  }
}
