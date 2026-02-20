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

    // [DEV BYPASS] Allow testing keys in development mode
    const isTestingKey = [
      "TES-LICENSE-123",
      "TEST-LICENSE-123",
      "TESTING-123",
    ].includes(normalizedKey);

    if (isTestingKey && process.env.NODE_ENV === "development") {
      console.log(
        "Dev Mode: Auto-validating testing key:",
        normalizedKey,
        "HWID:",
        hardwareId,
      );
      return NextResponse.json({
        valid: true,
        message: "Dev Mode: Aktivasi berhasil untuk kunci testing!",
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
      if (license.hardware_id === hardwareId) {
        return NextResponse.json({
          valid: true,
          message: "Lisensi sudah aktif di perangkat ini. Silakan masuk.",
        });
      }
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

    return NextResponse.json({ valid: true, message: "Aktivasi berhasil!" });
  } catch (error: any) {
    console.error("License validation error:", error);
    return NextResponse.json(
      { valid: false, message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
