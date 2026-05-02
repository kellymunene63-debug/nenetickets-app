import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    // Verify the webhook signature
    const signature = req.headers.get("x-paystack-signature");
    const rawBody = await req.text();

    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      console.warn("Paystack webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as {
      event: string;
      data: {
        reference: string;
        status: string;
        amount: number;
        currency: string;
        customer: { email: string };
        metadata: Record<string, unknown>;
        paid_at: string;
        channel: string;
      };
    };

    // Handle successful charge
    if (event.event === "charge.success" && event.data.status === "success") {
      const { reference, amount, customer, metadata, paid_at, channel } = event.data;

      // Log the confirmed payment — in production you'd write to a database here
      console.log("✅ Payment confirmed via webhook:", {
        reference,
        amount: amount / 100,
        email: customer.email,
        metadata,
        paid_at,
        channel,
      });

      // TODO: When you add a database (e.g. Supabase/PlanetScale), persist the ticket here:
      // await db.tickets.create({ reference, email: customer.email, metadata, paidAt: paid_at });
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    // Still return 200 so Paystack doesn't keep retrying for parse errors
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
