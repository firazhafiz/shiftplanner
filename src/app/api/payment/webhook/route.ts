import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// ── License Key Generator ─────────────────────────────────────
function generateLicenseKey(tier: "personal" | "pro"): string {
  const prefix = tier === "pro" ? "PRO" : "PRS";
  const segments = Array.from({ length: 3 }, () =>
    crypto.randomBytes(2).toString("hex").toUpperCase(),
  );
  return `SP-${prefix}-${segments.join("-")}`;
}

export async function POST(req: NextRequest) {
  try {
    const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!webhookToken || !supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { message: "Server configuration error." },
        { status: 500 },
      );
    }

    // ── Security: Verify Xendit Callback Token ────────────────
    const callbackToken = req.headers.get("x-callback-token");
    if (callbackToken !== webhookToken) {
      console.warn("Webhook rejected: invalid callback token");
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { external_id, status } = body;

    if (!external_id || !status) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── Find the order ────────────────────────────────────────
    const { data: order, error: findError } = await supabase
      .from("orders")
      .select("*")
      .eq("external_id", external_id)
      .maybeSingle();

    if (findError || !order) {
      console.error("Order not found:", external_id);
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // ── Idempotency: Skip if already processed ────────────────
    if (order.status === "paid") {
      console.log("Order already paid, skipping:", external_id);
      return NextResponse.json({ message: "Already processed" });
    }

    const normalizedStatus = status.toUpperCase();

    if (normalizedStatus === "PAID") {
      // ── Generate Unique License Key ─────────────────────────
      let licenseKey: string;
      let attempts = 0;
      const tier = order.tier as "personal" | "pro";

      do {
        licenseKey = generateLicenseKey(tier);
        const { data: existing } = await supabase
          .from("licenses")
          .select("id")
          .eq("license_key", licenseKey)
          .maybeSingle();

        if (!existing) break;
        attempts++;
      } while (attempts < 10);

      if (attempts >= 10) {
        console.error(
          "Failed to generate unique license key after 10 attempts",
        );
        return NextResponse.json(
          { message: "License generation failed" },
          { status: 500 },
        );
      }

      // ── Insert License into licenses table ──────────────────
      const maxDevices = tier === "pro" ? 3 : 1;
      await supabase.from("licenses").insert({
        license_key: licenseKey,
        tier,
        is_used: false,
        hardware_id: null,
        activated_at: null,
        max_devices: maxDevices,
      });

      // ── Update Order as Paid ────────────────────────────────
      await supabase
        .from("orders")
        .update({
          status: "paid",
          license_key: licenseKey,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      console.log(`✅ Payment PAID: ${external_id} → License: ${licenseKey}`);
    } else if (
      normalizedStatus === "EXPIRED" ||
      normalizedStatus === "FAILED"
    ) {
      await supabase
        .from("orders")
        .update({
          status: normalizedStatus.toLowerCase(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      console.log(`⚠️ Payment ${normalizedStatus}: ${external_id}`);
    }

    return NextResponse.json({ message: "Webhook processed" });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
