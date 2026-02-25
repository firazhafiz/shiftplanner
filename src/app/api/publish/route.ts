import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { workspaceId, month, year, data } = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Verify license tier (Security Audit Fix)
    const { data: license, error: licenseError } = await supabase
      .from("licenses")
      .select("tier")
      .eq("hardware_id", workspaceId)
      .maybeSingle();

    if (licenseError || !license || license.tier !== "pro") {
      return NextResponse.json(
        {
          message:
            "Akses ditolak. Fitur Portal Publik hanya tersedia untuk paket Professional.",
        },
        { status: 403 },
      );
    }

    // Upsert the share data
    // We use workspace_id + month + year as a unique constraint to avoid duplicates per month
    // But since the primary key is ID (UUID), we might want to check for existing one first
    // Or just let it create new ones. For simplicity, we'll try to find existing first.

    const { data: existing, error: findError } = await supabase
      .from("public_shares")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle();

    if (findError) throw findError;

    let shareId;

    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from("public_shares")
        .update({
          data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) throw updateError;
      shareId = updated.id;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("public_shares")
        .insert({
          workspace_id: workspaceId,
          month,
          year,
          data,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      shareId = inserted.id;
    }

    return NextResponse.json({ shareId, success: true });
  } catch (error: any) {
    console.error("Publish error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
