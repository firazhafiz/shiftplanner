// ============================================================
// Excel Export — Generate .xlsx from schedule data
// ============================================================

import * as XLSX from "xlsx";
import type { Employee, ShiftType, ScheduleEntry } from "@/types";
import { getDaysOfMonth, formatDateId } from "@/lib/utils";

export function exportToExcel(
  employees: Employee[],
  shiftTypes: ShiftType[],
  schedules: ScheduleEntry[],
  year: number,
  month: number,
  businessName?: string,
  tier: "starter" | "personal" | "pro" = "personal",
): void {
  const days = getDaysOfMonth(year, month);
  const shiftMap = new Map(shiftTypes.map((s) => [s.id!, s]));

  // Build lookup
  const lookup = new Map<string, string>();
  for (const entry of schedules) {
    const shift = shiftMap.get(entry.shiftTypeId);
    if (shift) {
      lookup.set(`${entry.employeeId}-${entry.date}`, shift.code);
    }
  }

  const dayNumbers = days.map((d) => parseInt(d.split("-")[2]));
  const headers = ["Karyawan / Posisi", ...dayNumbers, "Total Kerja"];

  // Start with Optional Business Name and Month Title
  const rows: (string | number)[][] = [];

  if (tier === "starter") {
    rows.push(["CREATED BY SHIFTPLANNER (FREE EDITION)"]);
  }

  if (businessName) {
    rows.push([businessName.toUpperCase()]);
  }
  rows.push([
    `JADWAL KERJA - ${formatDateId(new Date(year, month - 1, 1), "MMMM yyyy").toUpperCase()}`,
  ]);
  rows.push([]); // Spacer
  rows.push(headers);

  for (const emp of employees) {
    const row: (string | number)[] = [`${emp.name} (${emp.position})`];
    let workDays = 0;

    for (const date of days) {
      const code = lookup.get(`${emp.id}-${date}`) ?? "";
      row.push(code);
      const shift = shiftTypes.find((s) => s.code === code);
      if (shift && !shift.isOff) workDays++;
    }

    row.push(workDays);
    rows.push(row);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Jadwal Shift");

  // Merge titles
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }, // Business Name Merge
    { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }, // Date Title Merge
  ];

  const colWidths = headers.map((_, i) => ({
    wch: i === 0 ? 30 : 5,
  }));
  ws["!cols"] = colWidths;

  XLSX.writeFile(
    wb,
    `Jadwal_${businessName || "Shift"}_${year}_${String(month).padStart(2, "0")}.xlsx`,
  );
}
