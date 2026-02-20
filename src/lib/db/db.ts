// ============================================================
// Dexie.js — Singleton DB Instance
// ============================================================

import { ShiftPlannerDB } from "./schema";

// Single instance used across the whole app (client-side only)
let _db: ShiftPlannerDB | null = null;

export function getDB(): ShiftPlannerDB {
  if (typeof window === "undefined") {
    throw new Error("Dexie DB can only be used client-side");
  }
  if (!_db) {
    _db = new ShiftPlannerDB();
  }
  return _db;
}

export { ShiftPlannerDB };
