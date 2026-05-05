import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function redisSetEx(key: string, value: string, ttl: number): Promise<void> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Redis not configured");
  const res = await fetch(`${url}/setex/${encodeURIComponent(key)}/${ttl}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "text/plain" },
    body: value,
  });
  if (!res.ok) throw new Error(`Redis SETEX failed: ${res.status}`);
}

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json() as { email: string; name: string };
    if (!email) return NextResponse.json({ success: false, error: "Email required" }, { status: 400 });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisSetEx(`nene:otp:${email.toLowerCase()}`, otp, 600);

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log(`[DEV] OTP for ${email}: ${otp}`);
      return NextResponse.json({ success: true, dev: true });
    }

    const year = new Date().getFullYear();
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from:    "NeneTickets <noreply@nenetickets.co.ke>",
        to:      [email],
        subject: "Your NeneTickets verification code",
        html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a1a;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
<table width="520" cellpadding="0" cellspacing="0" style="background:#0f0f2e;border-radius:16px;border:1px solid #1e293b;">
<tr><td style="background:linear-gradient(135deg,#1e3a8a,#312e81);padding:32px;text-align:center;border-radius:16px 16px 0 0;">
  <div style="font-size:36px;">🎪</div>
  <h1 style="color:white;margin:8px 0 0;font-size:22px;">NeneTickets</h1>
  <p style="color:#93c5fd;margin:4px 0 0;font-size:13px;">Organizer Verification</p>
</td></tr>
<tr><td style="padding:36px 32px;">
  <h2 style="color:white;margin:0 0 8px;font-size:18px;">Hi ${name || "there"},</h2>
  <p style="color:#94a3b8;margin:0 0 24px;font-size:14px;line-height:1.6;">
    Thanks for signing up as a NeneTickets organizer. Enter the code below to verify your email and activate your account.
  </p>
  <div style="background:#0a0a1a;border:2px solid #3b82f6;border-radius:12px;padding:28px;text-align:center;margin:24px 0;">
    <div style="font-size:42px;font-weight:800;letter-spacing:14px;color:white;">${otp}</div>
  </div>
  <p style="color:#64748b;font-size:12px;text-align:center;margin:0;">
    This code expires in <strong style="color:#94a3b8;">10 minutes</strong>.<br/>
    If you didn't sign up for NeneTickets, you can safely ignore this email.
  </p>
</td></tr>
<tr><td style="padding:16px 32px 24px;border-top:1px solid #1e293b;text-align:center;">
  <p style="color:#475569;font-size:11px;margin:0;">© ${year} NeneTickets · support@nenetickets.co.ke</p>
</td></tr>
</table></td></tr></table>
</body></html>`,
      }),
    });

    if (!emailRes.ok) {
      console.error("Resend error:", await emailRes.text());
      return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/email/otp:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
