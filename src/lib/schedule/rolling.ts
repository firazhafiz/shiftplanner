// ============================================================
// Rolling Shift Logic — Auto-generate monthly schedule
// ============================================================

import type { RollingPattern, ScheduleEntry } from "@/types";
import { getDaysOfMonth } from "@/lib/utils";

/**
 * Generate schedule entries for one employee using a rolling pattern.
 * Pattern repeats cyclically across all days in the month.
 *
 * @param employeeId     - Target employee
 * @param year           - Year (e.g. 2026)
 * @param month          - Month 1-12
 * @param pattern        - Array of { shiftTypeId, duration } — repeats cyclically
 * @param startOffset    - How many days into the current cycle to begin (0-based)
 * @param shopClosedDays - Array of day indices (0=Sun, 1=Mon, etc) where business is closed
 */
export function generateRollingSchedule(
  employeeId: number,
  year: number,
  month: number,
  pattern: RollingPattern[],
  startOffset: number = 0,
  shopClosedDays: number[] = [],
): Omit<ScheduleEntry, "id">[] {
  const days = getDaysOfMonth(year, month);
  const entries: Omit<ScheduleEntry, "id">[] = [];

  if (pattern.length === 0) return entries;

  // Expand pattern into a flat cycle: e.g. [{P,2},{M,2}] → [P,P,M,M]
  const cycle: number[] = [];
  for (const step of pattern) {
    for (let i = 0; i < step.duration; i++) {
      cycle.push(step.shiftTypeId);
    }
  }

  if (cycle.length === 0) return entries;

  let cycleIndex = startOffset % cycle.length;

  for (const date of days) {
    const d = new Date(date);
    const dayOfWeek = d.getDay();

    // Skip if shop is closed on this day
    if (shopClosedDays.includes(dayOfWeek)) {
      continue;
    }

    const shiftTypeId = cycle[cycleIndex % cycle.length];
    entries.push({
      employeeId,
      date,
      shiftTypeId,
      createdAt: new Date(),
    });
    cycleIndex++;
  }

  return entries;
}

/**
 * Calculate cycle offset for a given start date so the pattern
 * continues correctly from the previous month.
 */
export function calculateCycleOffset(
  previousEntries: ScheduleEntry[],
  pattern: RollingPattern[],
): number {
  if (previousEntries.length === 0 || pattern.length === 0) return 0;

  const cycle: number[] = [];
  for (const step of pattern) {
    for (let i = 0; i < step.duration; i++) {
      cycle.push(step.shiftTypeId);
    }
  }

  return previousEntries.length % cycle.length;
}
