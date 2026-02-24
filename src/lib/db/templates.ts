import { getDB } from "./db";
import { ShiftType } from "@/types";

export type TemplateType = "cafe" | "retail" | "custom";

export const TEMPLATES: Record<
  TemplateType,
  { name: string; description: string; shifts: Omit<ShiftType, "id">[] }
> = {
  cafe: {
    name: "Cafe / Restoran",
    description:
      "Ideal untuk bisnis F&B dengan 3 shift operasional (Pagi, Siang, Malam).",
    shifts: [
      {
        name: "Pagi",
        code: "P",
        startTime: "07:00",
        endTime: "15:00",
        color: "#3B82F6",
        bgColor: "#EFF6FF",
        isOff: false,
      },
      {
        name: "Siang",
        code: "S",
        startTime: "15:00",
        endTime: "23:00",
        color: "#F59E0B",
        bgColor: "#FFFBEB",
        isOff: false,
      },
      {
        name: "Malam",
        code: "M",
        startTime: "23:00",
        endTime: "07:00",
        color: "#8B5CF6",
        bgColor: "#F5F3FF",
        isOff: false,
      },
      {
        name: "Libur",
        code: "OFF",
        startTime: "",
        endTime: "",
        color: "#9CA3AF",
        bgColor: "#F3F4F6",
        isOff: true,
      },
    ],
  },
  retail: {
    name: "Ritel / Toko",
    description:
      "Cocok untuk toko atau butik dengan 2 shift kerja (Shift 1 & Shift 2).",
    shifts: [
      {
        name: "Shift 1",
        code: "S1",
        startTime: "08:00",
        endTime: "16:00",
        color: "#10B981",
        bgColor: "#ECFDF5",
        isOff: false,
      },
      {
        name: "Shift 2",
        code: "S2",
        startTime: "13:00",
        endTime: "21:00",
        color: "#3B82F6",
        bgColor: "#EFF6FF",
        isOff: false,
      },
      {
        name: "Libur",
        code: "OFF",
        startTime: "",
        endTime: "",
        color: "#9CA3AF",
        bgColor: "#F3F4F6",
        isOff: true,
      },
    ],
  },
  custom: {
    name: "Kustom (Kosong)",
    description:
      "Mulai dari nol dan buat konfigurasi shift Anda sendiri sesuai kebutuhan.",
    shifts: [],
  },
};

export async function applyTemplate(type: TemplateType) {
  const db = getDB();
  const template = TEMPLATES[type];

  if (!template) return;

  await db.shiftTypes.clear();

  for (const shift of template.shifts) {
    await db.addShiftType(shift);
  }

  // Mark setup as complete in business profile
  const profile = await db.getBusinessProfile();
  await db.saveBusinessProfile({
    ...profile,
    isSetupComplete: true,
  });

  // Also set some default app settings if it's the first time
  const settings = await db.getAppSettings();
  if (!settings.id) {
    await db.saveAppSettings({
      shopClosedDays: [0], // Default Sunday off
      minRestHours: 11,
    });
  }
}
