import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const signature = req.headers.get("x-paystack-signature");
    const rawBody = await req.text();

    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
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

    if (event.event === "charge.success" && event.data.status === "success") {
      console.log("Payment confirmed:", {
        reference: event.data.reference,
        amount: event.data.amount / 100,
        email: event.data.customer.email,
        channel: event.data.channel,
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
