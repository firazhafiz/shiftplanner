// ============================================================
// Dexie.js — IndexedDB Schema Definition
// ============================================================

import Dexie, { type EntityTable } from "dexie";
import type {
  Employee,
  ShiftType,
  ScheduleEntry,
  AuthConfig,
  AppSettings,
} from "@/types";

export class ShiftPlannerDB extends Dexie {
  employees!: EntityTable<Employee, "id">;
  shiftTypes!: EntityTable<ShiftType, "id">;
  schedules!: EntityTable<ScheduleEntry, "id">;
  authConfig!: EntityTable<AuthConfig, "id">;
  appSettings!: EntityTable<AppSettings, "id">;

  constructor() {
    super("ShiftPlannerDB");

    this.version(3).stores({
      employees: "++id, name, position, createdAt",
      shiftTypes: "++id, name, code",
      schedules: "++id, employeeId, date, shiftTypeId, createdAt",
      authConfig: "++id, licenseKey, isActive",
      appSettings: "++id",
    });
  }

  // ── Auth / Activation ─────────────────────────────────────
  async getAuthConfig(): Promise<AuthConfig | undefined> {
    return this.authConfig.toCollection().first();
  }

  async isActivated(): Promise<boolean> {
    const config = await this.getAuthConfig();
    return config?.isActive === true;
  }

  async saveActivation(data: Omit<AuthConfig, "id">): Promise<void> {
    await this.authConfig.clear();
    await this.authConfig.add(data);
  }

  // ── App Settings ──────────────────────────────────────────
  async getAppSettings(): Promise<AppSettings> {
    const settings = await this.appSettings.toCollection().first();
    if (settings) return settings;

    // Default settings
    return {
      shopClosedDays: [], // None closed by default
      minRestHours: 11,
    };
  }

  async saveAppSettings(data: AppSettings): Promise<void> {
    await this.appSettings.clear();
    await this.appSettings.add(data);
  }

  // ── Employees ─────────────────────────────────────────────
  async getAllEmployees(): Promise<Employee[]> {
    return this.employees.orderBy("name").toArray();
  }

  async addEmployee(emp: Omit<Employee, "id">): Promise<number> {
    return (await this.employees.add(emp as Employee)) as number;
  }

  async updateEmployee(id: number, data: Partial<Employee>): Promise<void> {
    await this.employees.update(id, data);
  }

  async deleteEmployee(id: number): Promise<void> {
    await this.employees.delete(id);
    // Cascade: remove all schedule entries for this employee
    await this.schedules.where("employeeId").equals(id).delete();
  }

  // ── Shift Types ───────────────────────────────────────────
  async getAllShiftTypes(): Promise<ShiftType[]> {
    return this.shiftTypes.toArray();
  }

  async addShiftType(shift: Omit<ShiftType, "id">): Promise<number> {
    return (await this.shiftTypes.add(shift as ShiftType)) as number;
  }

  async updateShiftType(id: number, data: Partial<ShiftType>): Promise<void> {
    await this.shiftTypes.update(id, data);
  }

  async deleteShiftType(id: number): Promise<void> {
    await this.shiftTypes.delete(id);
    await this.schedules.where("shiftTypeId").equals(id).delete();
  }

  // ── Schedules ─────────────────────────────────────────────
  async getScheduleForMonth(
    year: number,
    month: number,
  ): Promise<ScheduleEntry[]> {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-31`;
    return this.schedules
      .where("date")
      .between(startDate, endDate, true, true)
      .toArray();
  }

  async upsertSchedule(entry: Omit<ScheduleEntry, "id">): Promise<void> {
    const existing = await this.schedules
      .where("employeeId")
      .equals(entry.employeeId)
      .and((s) => s.date === entry.date)
      .first();

    if (existing?.id) {
      await this.schedules.update(existing.id, {
        shiftTypeId: entry.shiftTypeId,
        notes: entry.notes,
      });
    } else {
      await this.schedules.add(entry as ScheduleEntry);
    }
  }

  async deleteSchedule(employeeId: number, date: string): Promise<void> {
    await this.schedules
      .where("employeeId")
      .equals(employeeId)
      .and((s) => s.date === date)
      .delete();
  }

  async bulkSetSchedules(entries: Omit<ScheduleEntry, "id">[]): Promise<void> {
    await this.transaction("rw", this.schedules, async () => {
      for (const entry of entries) {
        await this.upsertSchedule(entry);
      }
    });
  }

  // ── Backup / Restore ──────────────────────────────────────
  async exportAll() {
    const [employees, shiftTypes, schedules] = await Promise.all([
      this.employees.toArray(),
      this.shiftTypes.toArray(),
      this.schedules.toArray(),
    ]);
    return { employees, shiftTypes, schedules };
  }

  async importAll(data: {
    employees: Employee[];
    shiftTypes: ShiftType[];
    schedules: ScheduleEntry[];
  }): Promise<void> {
    await this.transaction(
      "rw",
      [this.employees, this.shiftTypes, this.schedules],
      async () => {
        await this.employees.clear();
        await this.shiftTypes.clear();
        await this.schedules.clear();
        await this.employees.bulkAdd(data.employees);
        await this.shiftTypes.bulkAdd(data.shiftTypes);
        await this.schedules.bulkAdd(data.schedules);
      },
    );
  }
}
