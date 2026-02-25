// ============================================================
// API Route — License Validation via Supabase
// POST /api/validate-license
// Body: { key: string, hardwareId: string }
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key (server-side only — NOT exposed to client)
export async function POST(req: NextRequest) {
  try {
    const { key, hardwareId } = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !supabaseUrl ||
      !supabaseServiceKey ||
      supabaseUrl.includes("your_supabase_project_url")
    ) {
      return NextResponse.json(
        {
          valid: false,
          message:
            "Konfigurasi server belum lengkap (Supabase URL/Key missing atau masih placeholder)",
          debug: "Check your .env or .env.local file",
        },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!key || !hardwareId) {
      return NextResponse.json(
        { valid: false, message: "Key dan Hardware ID diperlukan" },
        { status: 400 },
      );
    }

    const normalizedKey = key.trim().toUpperCase();
    console.log(
      "Validating license:",
      normalizedKey,
      "HardwareID:",
      hardwareId,
    );

    // [DEV BYPASS] Dedicated testing keys for different tiers
    const testingKeys: Record<string, { tier: string; max_devices: number }> = {
      "TEST-STARTER-123": { tier: "starter", max_devices: 1 },
      "TEST-PERSONAL-123": { tier: "personal", max_devices: 1 },
      "TEST-PRO-123": { tier: "pro", max_devices: 3 },
      // Legacy generic keys (default to pro)
      "TES-LICENSE-123": { tier: "pro", max_devices: 3 },
      "TEST-LICENSE-123": { tier: "pro", max_devices: 3 },
      "TESTING-123": { tier: "pro", max_devices: 3 },
    };

    if (testingKeys[normalizedKey]) {
      const config = testingKeys[normalizedKey];
      console.log(
        `Testing Key (${config.tier}) detected, allowing activation:`,
        normalizedKey,
        "HWID:",
        hardwareId,
      );
      return NextResponse.json({
        valid: true,
        message: `Aktivasi berhasil menggunakan kunci testing (${config.tier.toUpperCase()})!`,
        tier: config.tier,
        max_devices: config.max_devices,
      });
    }

    // Use maybeSingle() to avoid PGRST116 if not found
    const { data: license, error } = await supabase
      .from("licenses")
      .select("*")
      .eq("license_key", normalizedKey)
      .maybeSingle();

    if (error) {
      console.error("Supabase Query Error:", error);
      return NextResponse.json(
        { valid: false, message: "Database error: " + error.message },
        { status: 500 },
      );
    }

    if (!license) {
      console.warn("License NOT FOUND in Supabase for key:", normalizedKey);
      return NextResponse.json(
        { valid: false, message: "Lisensi tidak ditemukan di database cloud." },
        { status: 200 },
      );
    }

    // Already used?
    if (license.is_used) {
      // If it's the same device, allow re-activation (recovery)
      if (license.hardware_id === hardwareId) {
        return NextResponse.json({
          valid: true,
          message: "Lisensi sudah aktif di perangkat ini. Silakan masuk.",
          tier: license.tier || "personal",
          max_devices: license.max_devices || 1,
        });
      }

      // Check for multi-device seat limit (if implemented in DB)
      // For now, if is_used is true but HWID differs, we check hardware_id list or just block
      // Based on current schema, we only store one hardware_id.
      // To support multiple devices, we'd need a separate table for bindings.
      // FOR NOW: If is_used is true and HWID is different, block it unless we add binding support.

      return NextResponse.json(
        { valid: false, message: "Lisensi sudah digunakan di perangkat lain" },
        { status: 200 },
      );
    }

    // Activate: mark as used and store hardware ID
    if (!license.is_used) {
      await supabase
        .from("licenses")
        .update({
          is_used: true,
          hardware_id: hardwareId,
          activated_at: new Date().toISOString(),
        })
        .eq("id", license.id);
    }

    return NextResponse.json({
      valid: true,
      message: "Aktivasi berhasil!",
      tier: license.tier || "personal",
      max_devices: license.max_devices || 1,
    });
  } catch (error: any) {
    console.error("License validation error:", error);
    return NextResponse.json(
      { valid: false, message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
