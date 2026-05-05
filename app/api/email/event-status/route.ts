import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      email: string;
      organizerName: string;
      eventTitle: string;
      status: "approved" | "rejected";
      rejectReason?: string;
    };

    const { email, organizerName, eventTitle, status, rejectReason } = body;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return NextResponse.json({ sent: false, reason: "not_configured" });

    const isApproved = status === "approved";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Event ${isApproved ? "Approved" : "Rejected"} — NeneTickets</title>
</head>
<body style="margin:0;padding:0;background:#050511;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050511;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Logo -->
        <tr><td style="padding-bottom:24px;" align="center">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#2563eb;border-radius:12px;padding:10px 12px;">
                <span style="color:#fff;font-size:18px;">🎟</span>
              </td>
              <td style="padding-left:10px;">
                <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
                  Nene<span style="color:#3b82f6;">Tickets</span>
                </span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Main card -->
        <tr><td style="background:#0d0d1f;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">

          <!-- Status badge -->
          <div style="text-align:center;margin-bottom:24px;">
            <span style="background:${isApproved ? "#16a34a" : "#dc2626"};color:#fff;font-size:12px;font-weight:700;padding:6px 16px;border-radius:999px;letter-spacing:0.5px;">
              ${isApproved ? "✓ &nbsp;EVENT APPROVED" : "✗ &nbsp;EVENT REJECTED"}
            </span>
          </div>

          <!-- Heading -->
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;text-align:center;color:#fff;">
            ${isApproved ? "Your event is live! 🎉" : "Your event was not approved"}
          </h1>
          <p style="margin:0 0 28px;font-size:14px;color:#6b7280;text-align:center;">
            Hi ${organizerName}, here is an update on your event submission.
          </p>

          <!-- Event name -->
          <div style="background:#0a0a1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px;margin-bottom:20px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Event</p>
            <p style="margin:0;font-size:18px;font-weight:800;color:#fff;">${eventTitle}</p>
          </div>

          ${isApproved ? `
          <!-- Approved message -->
          <div style="background:#16a34a15;border:1px solid #16a34a40;border-radius:12px;padding:16px;margin-bottom:24px;">
            <p style="margin:0;font-size:14px;color:#86efac;line-height:1.6;">
              🎉 Congratulations! Your event has been reviewed and approved by the NeneTickets team. 
              It is now <strong>live on the platform</strong> and visible to buyers. Tickets can now be purchased.
            </p>
          </div>
          ` : `
          <!-- Rejected message -->
          <div style="background:#dc262615;border:1px solid #dc262640;border-radius:12px;padding:16px;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#f87171;">Reason for rejection:</p>
            <p style="margin:0;font-size:14px;color:#fca5a5;line-height:1.6;">
              ${rejectReason ?? "No specific reason provided. Please contact support for more details."}
            </p>
          </div>
          <p style="font-size:13px;color:#6b7280;text-align:center;">
            You can edit your event and resubmit it for review from your organizer dashboard.
          </p>
          `}

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "https://nenetickets.co.ke"}/host"
                   style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
                  Go to My Dashboard
                </a>
              </td>
            </tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 0;text-align:center;">
          <p style="margin:0 0 8px;font-size:12px;color:#374151;">
            Questions? <a href="mailto:support@nenetickets.co.ke" style="color:#3b82f6;text-decoration:none;">support@nenetickets.co.ke</a>
          </p>
          <p style="margin:0;font-size:11px;color:#1f2937;">
            © ${new Date().getFullYear()} NeneTickets · Nairobi, Kenya
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? "NeneTickets <onboarding@resend.dev>",
        to: [email],
        subject: isApproved
          ? `✅ Your event "${eventTitle}" is now live on NeneTickets!`
          : `❌ Your event "${eventTitle}" was not approved`,
        html,
      }),
    });

    const data = await resendRes.json() as { id?: string; error?: { message: string } };
    if (!resendRes.ok) return NextResponse.json({ sent: false, error: data.error?.message });
    return NextResponse.json({ sent: true, id: data.id });

  } catch (err) {
    console.error("Event status email error:", err);
    return NextResponse.json({ sent: false, error: "unexpected_error" });
  }
}
