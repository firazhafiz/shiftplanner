import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { message: "Server configuration error." },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(req.url);

    const orderId = searchParams.get("order_id");
    const email = searchParams.get("email");

    // ── Lookup by Order ID ────────────────────────────────────
    if (orderId) {
      const { data: order, error } = await supabase
        .from("orders")
        .select("status, tier, license_key, buyer_email, buyer_name")
        .eq("external_id", orderId)
        .maybeSingle();

      if (error || !order) {
        return NextResponse.json(
          { message: "Order tidak ditemukan." },
          { status: 404 },
        );
      }

      return NextResponse.json({
        status: order.status,
        tier: order.tier,
        licenseKey: order.status === "paid" ? order.license_key : null,
        buyerName: order.buyer_name,
      });
    }

    // ── Retrieve by Email ─────────────────────────────────────
    if (email) {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("external_id, tier, status, license_key, created_at")
        .eq("buyer_email", email.toLowerCase().trim())
        .eq("status", "paid")
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json(
          { message: "Database error." },
          { status: 500 },
        );
      }

      return NextResponse.json({
        orders: (orders || []).map((o) => ({
          orderId: o.external_id,
          tier: o.tier,
          licenseKey: o.license_key,
          purchasedAt: o.created_at,
        })),
      });
    }

    return NextResponse.json(
      { message: "Parameter 'order_id' atau 'email' diperlukan." },
      { status: 400 },
    );
  } catch (error: any) {
    console.error("Payment status error:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
