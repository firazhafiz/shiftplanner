// ============================================================
// Conflict Detection — Validates schedule for issues
// ============================================================

import type {
  ScheduleEntry,
  ShiftType,
  ScheduleConflict,
  Availability,
} from "@/types";
import { calcRestHours, timeToMinutes } from "@/lib/utils";

/**
 * Detect all conflicts in a given set of schedule entries.
 * Returns array of conflicts (empty = no issues).
 */
export function detectConflicts(
  entries: ScheduleEntry[],
  shiftTypes: ShiftType[],
  settings?: { shopClosedDays: number[]; minRestHours: number },
  availabilities: Availability[] = [],
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const shiftMap = new Map(shiftTypes.map((s) => [s.id!, s]));
  const minRest = settings?.minRestHours ?? 11;
  const closedDays = settings?.shopClosedDays ?? [];

  // Group entries by employee
  const byEmployee = new Map<number, ScheduleEntry[]>();
  for (const entry of entries) {
    const list = byEmployee.get(entry.employeeId) ?? [];
    list.push(entry);
    byEmployee.set(entry.employeeId, list);
  }

  for (const [empId, empEntries] of byEmployee) {
    // Sort by date
    const sorted = [...empEntries].sort((a, b) => a.date.localeCompare(b.date));

    // Group by date to detect double shifts
    const byDate = new Map<string, ScheduleEntry[]>();
    for (const entry of sorted) {
      const list = byDate.get(entry.date) ?? [];
      list.push(entry);
      byDate.set(entry.date, list);
    }

    // Check: availability, double shift or business closed
    for (const [date, dayEntries] of byDate) {
      // 1. Availability Check
      const isUnavailable = availabilities.find(
        (a) => a.employeeId === empId && a.date === date,
      );
      if (isUnavailable) {
        conflicts.push({
          employeeId: empId,
          date,
          type: "AVAILABILITY_CONFLICT",
          message: `Karyawan terdaftar tidak tersedia (Cuti/Sakit${isUnavailable.reason ? `: ${isUnavailable.reason}` : ""})`,
        });
      }

      const d = new Date(date);
      const isClosedDay = closedDays.includes(d.getDay());

      // Business Closed Check
      if (isClosedDay) {
        // Only warn if they actually have a working shift (not just marked "Off")
        const workingShifts = dayEntries.filter(
          (de) => !shiftMap.get(de.shiftTypeId)?.isOff,
        );
        if (workingShifts.length > 0) {
          conflicts.push({
            employeeId: empId,
            date,
            type: "BUSINESS_CLOSED",
            message: `Toko tutup pada hari ini (Hari Libur Rutin)`,
          });
        }
      }

      // Double Shift Check
      if (dayEntries.length > 1) {
        conflicts.push({
          employeeId: empId,
          date,
          type: "DOUBLE_SHIFT",
          message: `Karyawan memiliki ${dayEntries.length} shift di tanggal yang sama`,
        });
      }
    }

    // Check: insufficient rest
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      const currentShift = shiftMap.get(current.shiftTypeId);
      const nextShift = shiftMap.get(next.shiftTypeId);

      if (!currentShift || !nextShift) continue;
      if (currentShift.isOff || nextShift.isOff) continue;

      // Only check consecutive calendar days
      const currentDate = new Date(current.date);
      const nextDate = new Date(next.date);
      const diffDays =
        (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        // Absolute Time Logic:
        // Day 1 Start = 0
        // Day 1 End = E1 (relative to 0, if night shift E1 > 1440)
        // Day 2 Start = 1440 + S2

        const S1 = timeToMinutes(currentShift.startTime);
        let E1 = timeToMinutes(currentShift.endTime);
        const S2 = timeToMinutes(nextShift.startTime);

        // Handle transitions for shifts that cross midnight (Night Shift)
        if (E1 < S1) {
          E1 += 1440; // End time is actually on the next day
        }

        const absoluteStartNext = 1440 + S2;
        const rest = (absoluteStartNext - E1) / 60;

        if (rest < minRest) {
          conflicts.push({
            employeeId: empId,
            date: next.date,
            type: "INSUFFICIENT_REST",
            message: `Istirahat kurang: ${rest.toFixed(1)} jam (Kebijakan: ${minRest} jam)`,
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Get conflict for a specific employee on a specific date.
 */
export function getConflictForCell(
  conflicts: ScheduleConflict[],
  employeeId: number,
  date: string,
): ScheduleConflict | undefined {
  return conflicts.find((c) => c.employeeId === employeeId && c.date === date);
}
