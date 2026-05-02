import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, amount, metadata } = body as {
      email: string;
      amount: number;
      metadata: Record<string, unknown>;
    };

    if (!email || !amount) {
      return NextResponse.json(
        { error: "email and amount are required" },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "Paystack secret key not configured" },
        { status: 500 }
      );
    }

    const amountInKobo = Math.round(amount * 100);

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        currency: "KES",
        metadata: {
          ...metadata,
          custom_fields: [
            {
              display_name: "Platform",
              variable_name: "platform",
              value: "NeneTickets",
            },
          ],
        },
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/paystack/verify`,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        { error: data.message ?? "Failed to initialize payment" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      access_code: data.data.access_code,
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (error) {
    console.error("Paystack initialize error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
