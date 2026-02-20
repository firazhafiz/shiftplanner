// ============================================================
// Utility Functions
// ============================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// Shadcn-compatible className merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to "YYYY-MM-DD"
export function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

// Format date to Indonesian locale for display
export function formatDateId(date: Date | string, fmt = "d MMMM yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, fmt, { locale: idLocale });
}

// Get all days in a month as "YYYY-MM-DD" strings
export function getDaysOfMonth(year: number, month: number): string[] {
  const days: string[] = [];
  const total = getDaysInMonth(new Date(year, month - 1));
  for (let d = 1; d <= total; d++) {
    days.push(
      `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    );
  }
  return days;
}

// Get first day-of-week offset for a month (0=Sun, 1=Mon...)
export function getMonthStartOffset(year: number, month: number): number {
  return getDay(startOfMonth(new Date(year, month - 1)));
}

// Convert minutes to "Xj Ym" format
export function minutesToDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}j ${m}m` : `${h}j`;
}

// Time string "HH:MM" → minutes from midnight
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Calculate rest hours between two shifts
export function calcRestHours(endTime: string, nextStartTime: string): number {
  let end = timeToMinutes(endTime);
  let start = timeToMinutes(nextStartTime);
  if (start < end) start += 24 * 60; // crosses midnight
  return (start - end) / 60;
}

// Generate a random pastel color
export function randomColor(): string {
  const colors = [
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#F59E0B",
    "#10B981",
    "#EF4444",
    "#06B6D4",
    "#F97316",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
