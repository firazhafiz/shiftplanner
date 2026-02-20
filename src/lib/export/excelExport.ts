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
): void {
  const days = getDaysOfMonth(year, month);
  const shiftMap = new Map(shiftTypes.map((s) => [s.id!, s]));

  // Build lookup: `${employeeId}-${date}` → shift code
  const lookup = new Map<string, string>();
  for (const entry of schedules) {
    const shift = shiftMap.get(entry.shiftTypeId);
    if (shift) {
      lookup.set(`${entry.employeeId}-${entry.date}`, shift.code);
    }
  }

  // Headers: Employee | 1 | 2 | 3 ... | Total Hari Kerja
  const dayNumbers = days.map((d) => parseInt(d.split("-")[2]));
  const headers = ["Karyawan / Posisi", ...dayNumbers, "Total Kerja"];

  const rows: (string | number)[][] = [headers];

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
  XLSX.utils.book_append_sheet(wb, ws, `Jadwal ${month}-${year}`);

  // Auto column widths
  const colWidths = headers.map((_, i) => ({
    wch: i === 0 ? 25 : 5,
  }));
  ws["!cols"] = colWidths;

  XLSX.writeFile(wb, `Jadwal_${year}_${String(month).padStart(2, "0")}.xlsx`);
}
