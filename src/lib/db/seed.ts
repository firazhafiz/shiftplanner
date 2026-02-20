import { getDB } from "./db";
import { ShiftType } from "@/types";
import { randomColor } from "@/lib/utils";

const DUMMY_EMPLOYEES = [
  { name: "Budi Santoso", position: "Security", gender: "M" },
  { name: "Siti Aminah", position: "Kasir", gender: "F" },
  { name: "Ahmad Fauzi", position: "Gudang", gender: "M" },
  { name: "Dewi Lestari", position: "SPG", gender: "F" },
  { name: "Rudi Hartono", position: "Driver", gender: "M" },
  { name: "Nina Marlina", position: "Admin", gender: "F" },
  { name: "Eko Prasetyo", position: "Supervisor", gender: "M" },
  { name: "Rina Wati", position: "Kasir", gender: "F" },
  { name: "Joko Susilo", position: "Security", gender: "M" },
  { name: "Maya Sari", position: "SPG", gender: "F" },
];

const DUMMY_SHIFTS: Omit<ShiftType, "id">[] = [
  {
    name: "Pagi",
    code: "P",
    startTime: "07:00",
    endTime: "15:00",
    color: "#3B82F6", // Blue
    bgColor: "#EFF6FF",
    isOff: false,
  },
  {
    name: "Siang",
    code: "S",
    startTime: "15:00",
    endTime: "23:00",
    color: "#F59E0B", // Amber
    bgColor: "#FFFBEB",
    isOff: false,
  },
  {
    name: "Malam",
    code: "M",
    startTime: "23:00",
    endTime: "07:00",
    color: "#8B5CF6", // Purple
    bgColor: "#F5F3FF",
    isOff: false,
  },
  {
    name: "Libur",
    code: "OFF",
    startTime: "",
    endTime: "",
    color: "#9CA3AF", // Gray
    bgColor: "#F3F4F6",
    isOff: true,
  },
];

export async function seedDatabase(force = false) {
  const db = getDB();

  // 1. Clear existing data if forced
  if (force) {
    await db.employees.clear();
    await db.shiftTypes.clear();
    await db.schedules.clear();
  } else {
    // Check if data exists
    const empCount = await db.employees.count();
    if (empCount > 0) {
      throw new Error(
        "Database tidak kosong. Gunakan reset jika ingin menimpa data.",
      );
    }
  }

  // 1.5 Add App Settings
  await db.saveAppSettings({
    shopClosedDays: [0], // Libur hari Minggu
    minRestHours: 11,
  });

  // 2. Add Shift Types
  const shiftIds: number[] = [];
  for (const shift of DUMMY_SHIFTS) {
    const id = await db.addShiftType(shift);
    shiftIds.push(id);
  }

  // 3. Add Employees
  const empIds: number[] = [];
  for (const emp of DUMMY_EMPLOYEES) {
    const id = await db.addEmployee({
      name: emp.name,
      position: emp.position,
      phone: "08123456789",
      color: randomColor(),
      createdAt: new Date(),
    });
    empIds.push(id);
  }

  // 4. Generate Schedule for Current Month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  // Simple pattern: 2P 2S 2M 2L
  // We'll offset the start for each employee to create variety
  const patternCodes = [0, 0, 1, 1, 2, 2, 3, 3]; // Indices in shiftIds

  for (let i = 0; i < empIds.length; i++) {
    const empId = empIds[i];
    const baseOffset = i * 2; // Stagger start
    let cycleCounter = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayOfWeek = new Date(dateStr).getDay();

      // Skip Sunday in seeder as well
      if (dayOfWeek === 0) continue;

      const patternIdx = (cycleCounter + baseOffset) % patternCodes.length;
      const shiftTypeId = shiftIds[patternCodes[patternIdx]];

      await db.upsertSchedule({
        employeeId: empId,
        date: dateStr,
        shiftTypeId,
        createdAt: new Date(),
      });
      cycleCounter++;
    }
  }

  console.log("Seeding complete!");
}
