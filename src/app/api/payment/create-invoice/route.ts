import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const TIER_PRICES: Record<string, number> = {
  personal: 99000,
  pro: 349000,
};

export async function POST(req: NextRequest) {
  try {
    const { tier, email, name, phone } = await req.json();

    // ── Validation ────────────────────────────────────────────
    if (!tier || !email || !name || !phone) {
      return NextResponse.json(
        { message: "Semua field (tier, email, name, phone) wajib diisi." },
        { status: 400 },
      );
    }

    if (!TIER_PRICES[tier]) {
      return NextResponse.json(
        { message: "Tier tidak valid. Pilih 'personal' atau 'pro'." },
        { status: 400 },
      );
    }

    const xenditSecretKey = process.env.XENDIT_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!xenditSecretKey || !supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { message: "Konfigurasi server belum lengkap." },
        { status: 500 },
      );
    }

    // ── Generate External ID ──────────────────────────────────
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const externalId = `SP-${timestamp}-${random}`;

    const amount = TIER_PRICES[tier];
    const origin =
      req.headers.get("origin") ||
      req.headers.get("referer")?.replace(/\/$/, "") ||
      "https://shiftplanner.vercel.app";

    // ── Create Xendit Invoice ─────────────────────────────────
    const xenditResponse = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(xenditSecretKey + ":").toString("base64")}`,
      },
      body: JSON.stringify({
        external_id: externalId,
        amount,
        currency: "IDR",
        description: `Pembelian Lisensi ShiftPlanner - Paket ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
        payer_email: email,
        customer: {
          given_names: name,
          email,
          mobile_number: phone,
        },
        success_redirect_url: `${origin}/payment/success?order_id=${externalId}`,
        failure_redirect_url: `${origin}/payment/checkout?tier=${tier}&failed=true`,
        invoice_duration: 86400, // 24 hours
        items: [
          {
            name: `ShiftPlanner ${tier.charAt(0).toUpperCase() + tier.slice(1)} License`,
            quantity: 1,
            price: amount,
          },
        ],
      }),
    });

    if (!xenditResponse.ok) {
      const errData = await xenditResponse.json();
      console.error("Xendit API Error:", errData);
      return NextResponse.json(
        { message: "Gagal membuat invoice pembayaran." },
        { status: 502 },
      );
    }

    const invoiceData = await xenditResponse.json();

    // ── Save Order to Supabase ────────────────────────────────
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from("orders").insert({
      invoice_id: invoiceData.id,
      external_id: externalId,
      tier,
      amount,
      buyer_email: email.toLowerCase().trim(),
      buyer_name: name.trim(),
      buyer_phone: phone.trim(),
      status: "pending",
      invoice_url: invoiceData.invoice_url,
    });

    return NextResponse.json({
      invoiceUrl: invoiceData.invoice_url,
      orderId: externalId,
    });
  } catch (error: any) {
    console.error("Create invoice error:", error);
    return NextResponse.json(
      { message: error.message || "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
