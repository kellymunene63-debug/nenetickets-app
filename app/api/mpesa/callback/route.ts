import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Safaricom hides the result inside this specific object
    const callbackData = data?.Body?.stkCallback;

    if (!callbackData) {
      console.log("❌ Invalid callback payload received from Safaricom.");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (callbackData.ResultCode === 0) {
      // Payment was SUCCESSFUL
      console.log("✅ M-PESA PAYMENT SUCCESSFUL!");
      console.log("Transaction ID:", callbackData.CallbackMetadata?.Item[1]?.Value);
      console.log("Amount Paid:", callbackData.CallbackMetadata?.Item[0]?.Value);
      console.log("Phone Number:", callbackData.CallbackMetadata?.Item[4]?.Value);
      
      // Later, we will connect this to your database to issue the NeneTickets!
    } else {
      // Payment FAILED or was CANCELLED
      console.log("❌ M-PESA PAYMENT FAILED OR CANCELLED.");
      console.log("Error Code:", callbackData.ResultCode);
      console.log("Reason:", callbackData.ResultDesc);
    }

    // Safaricom REQUIRES us to respond with this exact success message, 
    // otherwise they will think our server is dead and keep spamming it.
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });

  } catch (error) {
    console.error("Callback Processing Error:", error);
    return NextResponse.json({ error: "Callback failed" }, { status: 500 });
  }
}