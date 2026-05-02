import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
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
        headers: { Authorization: `Bearer ${secretKey}` },
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

    // ── Increment sold count in Redis ─────────────────────────────────────────
    // metadata is passed from the checkout initialize call
    const meta = transaction.metadata ?? {};
    const eventId    = meta.eventId    as string | undefined;
    const ticketType = meta.ticketType as string | undefined;
    const quantity   = parseInt(meta.quantity ?? "1", 10) || 1;

    if (eventId && ticketType) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nenetickets.co.ke";
        await fetch(`${baseUrl}/api/events/${eventId}/capacity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketType, quantity }),
        });
      } catch (capErr) {
        // Non-fatal — ticket is still valid even if count update fails
        console.warn("Capacity update failed:", capErr);
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

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
