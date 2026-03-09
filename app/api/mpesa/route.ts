import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { phone, amount } = await request.json();

    // 1. Format the phone number (Safaricom requires 254XXXXXXXXX)
    let formattedPhone = phone.replace(/\s+/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith("+")) {
      formattedPhone = formattedPhone.slice(1);
    }

    // 2. Grab your secret keys from the .env file
    const consumerKey = process.env.MPESA_CONSUMER_KEY!;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
    const passkey = process.env.MPESA_PASSKEY!;
    const shortcode = process.env.MPESA_SHORTCODE!;
    
    // We are using the Safaricom Sandbox URL for testing
    const baseUrl = "https://sandbox.safaricom.co.ke";

    // 3. Authenticate and get the Daraja Access Token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const tokenResponse = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      cache: "no-store", // Prevents Next.js from freezing an old token
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error("Token Error:", tokenData);
      return NextResponse.json({ success: false, error: "Failed to authenticate with Safaricom." }, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // 4. Generate the strict Timestamp and Password Safaricom demands
    const date = new Date();
    const timestamp =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      date.getDate().toString().padStart(2, "0") +
      date.getHours().toString().padStart(2, "0") +
      date.getMinutes().toString().padStart(2, "0") +
      date.getSeconds().toString().padStart(2, "0");

    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    // 5. Fire the actual STK Push to the customer's phone!
    const stkResponse = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        // IMPORTANT: This is where Safaricom will send the receipt
        CallBackURL: "https://nenetickets.co.ke/api/mpesa/callback",
        AccountReference: "NeneTickets",
        TransactionDesc: "Event Ticket Payment",
      }),
    });

    const stkData = await stkResponse.json();

    // 6. Handle the response back to the frontend
    if (stkData.ResponseCode === "0") {
      return NextResponse.json({ success: true, data: stkData });
    } else {
      console.error("STK Push Error:", stkData);
      return NextResponse.json({ success: false, error: stkData.errorMessage || "STK Push failed." }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}