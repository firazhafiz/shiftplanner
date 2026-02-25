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
  baseRate?: number; // rate per shift for labor cost
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
  tier: "starter" | "personal" | "pro";
  maxDevices: number;
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
  availability?: Availability[];
  businessProfile?: BusinessProfile;
}

export interface Availability {
  id?: number;
  employeeId: number;
  date: string; // ISO date "YYYY-MM-DD"
  status: "unavailable";
  reason?: string;
}

export interface AppSettings {
  id?: number;
  shopClosedDays: number[]; // 0 for Sunday, 1 for Monday, etc.
  minRestHours: number;
  primaryColor?: string; // Hex color for the theme engine
}

export interface BusinessProfile {
  id?: number;
  name: string;
  logo?: string; // Base64 string of the logo
  isSetupComplete?: boolean;
  updatedAt: Date;
}

// Conflict types
export type ConflictType =
  | "DOUBLE_SHIFT"
  | "INSUFFICIENT_REST"
  | "BUSINESS_CLOSED"
  | "AVAILABILITY_CONFLICT";

export interface ScheduleConflict {
  employeeId: number;
  date: string;
  type: ConflictType;
  message: string;
}
