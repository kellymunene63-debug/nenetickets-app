import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { reference: string } }
) {
  try {
    const { reference } = params;

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "Paystack secret key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        { error: data.message ?? "Verification failed" },
        { status: 400 }
      );
    }

    const transaction = data.data;

    if (transaction.status !== "success") {
      return NextResponse.json(
        { paid: false, status: transaction.status },
        { status: 200 }
      );
    }

    return NextResponse.json({
      paid: true,
      reference: transaction.reference,
      amount: transaction.amount / 100,
      currency: transaction.currency,
      email: transaction.customer?.email,
      paidAt: transaction.paid_at,
      channel: transaction.channel,
      metadata: transaction.metadata,
    });
  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
