import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return NextResponse.json({ success: false, error: "Paystack not configured" }, { status: 500 });

    const body = await req.json() as {
      business_name: string;
      settlement_bank: string;
      account_number: string;
      primary_contact_email: string;
      primary_contact_name: string;
      primary_contact_phone?: string;
    };

    const res = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        business_name:         body.business_name,
        settlement_bank:       body.settlement_bank,
        account_number:        body.account_number,
        percentage_charge:     95,
        primary_contact_email: body.primary_contact_email,
        primary_contact_name:  body.primary_contact_name,
        primary_contact_phone: body.primary_contact_phone ?? "",
        description:           `NeneTickets organizer — ${body.business_name}`,
      }),
    });

    const data = await res.json() as {
      status: boolean;
      message: string;
      data?: { subaccount_code: string; account_name: string };
    };

    if (!res.ok || !data.status) {
      return NextResponse.json({ success: false, error: data.message ?? "Failed to create subaccount" }, { status: 400 });
    }

    return NextResponse.json({
      success:         true,
      subaccount_code: data.data!.subaccount_code,
      account_name:    data.data!.account_name,
    });
  } catch (err) {
    console.error("POST /api/paystack/subaccount:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
