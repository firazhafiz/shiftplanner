// ============================================================
// ShiftPlanner — Core TypeScript Types
// ============================================================

export interface Employee {
  id?: number;
  name: string;
  position: string;
  color: string; // hex color for calendar display
  phone?: string;
  createdAt: Date;
}

export interface ShiftType {
  id?: number;
  name: string; // e.g. "Pagi", "Siang", "Malam"
  code: string; // e.g. "P", "S", "M", "L" (Libur)
  startTime: string; // "07:00"
  endTime: string; // "15:00"
  color: string; // hex color
  bgColor: string; // background hex
  isOff?: boolean; // true if this is a day-off type
}

export interface ScheduleEntry {
  id?: number;
  employeeId: number;
  date: string; // ISO date string "YYYY-MM-DD"
  shiftTypeId: number;
  notes?: string;
  createdAt: Date;
}

export interface AuthConfig {
  id?: number;
  licenseKey: string;
  hardwareId: string;
  activatedAt: Date;
  isActive: boolean;
}

// Rolling shift pattern config
export interface RollingPattern {
  shiftTypeId: number;
  duration: number; // consecutive days
}

export interface RollingConfig {
  employeeId: number;
  startDate: string;
  pattern: RollingPattern[];
}

// Export / Backup
export interface BackupData {
  version: string;
  exportedAt: string;
  employees: Employee[];
  shiftTypes: ShiftType[];
  schedules: ScheduleEntry[];
  appSettings?: AppSettings;
}

export interface AppSettings {
  id?: number;
  shopClosedDays: number[]; // 0 for Sunday, 1 for Monday, etc.
  minRestHours: number;
}

// Conflict types
export type ConflictType =
  | "DOUBLE_SHIFT"
  | "INSUFFICIENT_REST"
  | "BUSINESS_CLOSED";

export interface ScheduleConflict {
  employeeId: number;
  date: string;
  type: ConflictType;
  message: string;
}
