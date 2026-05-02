import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      email: string;
      title: string;
      type: string;
      quantity: number;
      date: string;
      time: string;
      location: string;
      image: string;
      ticketId: string;
      grandTotal: number;
      reference: string;
    };

    const {
      email, title, type, quantity,
      date, time, location, image,
      ticketId, grandTotal, reference,
    } = body;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // Email not configured — silently succeed so checkout isn't blocked
      return NextResponse.json({ sent: false, reason: "not_configured" });
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=ffffff&bgcolor=050511&data=${encodeURIComponent(ticketId)}`;

    // Google Calendar add-event link
    const gcalStart = date.replace(/[^0-9]/g, "");   // rough — works for "Jun 14, 2026" style
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(`NeneTickets — ${type} ticket. Ref: ${ticketId}`)}&location=${encodeURIComponent(location)}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your NeneTickets Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#050511;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050511;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header / Logo -->
        <tr><td style="padding-bottom:24px;" align="center">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#2563eb;border-radius:12px;padding:10px 12px;margin-right:10px;">
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

        <!-- Hero image -->
        ${image ? `
        <tr><td style="border-radius:16px 16px 0 0;overflow:hidden;">
          <img src="${image}" alt="${title}" width="560" style="width:100%;max-width:560px;height:180px;object-fit:cover;display:block;border-radius:16px 16px 0 0;" />
        </td></tr>
        ` : ""}

        <!-- Main card -->
        <tr><td style="background:#0d0d1f;border:1px solid rgba(255,255,255,0.08);border-radius:${image ? "0 0 16px 16px" : "16px"};padding:32px;">

          <!-- Success badge -->
          <div style="text-align:center;margin-bottom:24px;">
            <span style="background:#16a34a;color:#fff;font-size:12px;font-weight:700;padding:6px 16px;border-radius:999px;letter-spacing:0.5px;">
              ✓ &nbsp;PAYMENT CONFIRMED
            </span>
          </div>

          <!-- Title -->
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;text-align:center;color:#fff;">${title}</h1>
          <p style="margin:0 0 28px;font-size:14px;color:#6b7280;text-align:center;">Your ticket is confirmed and ready to use at the gate.</p>

          <!-- Details grid -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td width="50%" style="padding:0 6px 12px 0;">
                <div style="background:#0a0a1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:14px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Ticket Type</p>
                  <p style="margin:0;font-size:15px;font-weight:700;color:#fff;text-transform:capitalize;">${type}</p>
                </div>
              </td>
              <td width="50%" style="padding:0 0 12px 6px;">
                <div style="background:#0a0a1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:14px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Quantity</p>
                  <p style="margin:0;font-size:15px;font-weight:700;color:#fff;">${quantity} ticket${quantity > 1 ? "s" : ""}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td width="50%" style="padding:0 6px 12px 0;">
                <div style="background:#0a0a1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:14px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Date &amp; Time</p>
                  <p style="margin:0;font-size:15px;font-weight:700;color:#fff;">${date}</p>
                  <p style="margin:0;font-size:12px;color:#6b7280;">${time}</p>
                </div>
              </td>
              <td width="50%" style="padding:0 0 12px 6px;">
                <div style="background:#0a0a1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:14px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Amount Paid</p>
                  <p style="margin:0;font-size:15px;font-weight:700;color:#22c55e;">KES ${grandTotal.toLocaleString()}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td colspan="2">
                <div style="background:#0a0a1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:14px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Venue</p>
                  <p style="margin:0;font-size:15px;font-weight:700;color:#fff;">📍 ${location}</p>
                </div>
              </td>
            </tr>
          </table>

          <!-- Divider -->
          <div style="border-top:1px dashed rgba(255,255,255,0.1);margin:24px 0;"></div>

          <!-- QR Code -->
          <div style="text-align:center;margin-bottom:20px;">
            <p style="margin:0 0 14px;font-size:13px;color:#6b7280;font-weight:600;">Show this QR code at the gate</p>
            <div style="display:inline-block;background:#050511;border:2px solid rgba(255,255,255,0.1);border-radius:16px;padding:16px;">
              <img src="${qrUrl}" alt="Ticket QR Code" width="160" height="160" style="display:block;border-radius:8px;" />
            </div>
            <p style="margin:12px 0 0;font-size:20px;font-weight:900;letter-spacing:6px;font-family:monospace;color:#fff;">${ticketId}</p>
            <p style="margin:4px 0 0;font-size:11px;color:#374151;font-family:monospace;">Ref: ${reference}</p>
          </div>

          <!-- Divider -->
          <div style="border-top:1px dashed rgba(255,255,255,0.1);margin:24px 0;"></div>

          <!-- CTA buttons -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding-bottom:12px;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "https://nenetickets.co.ke"}/tickets"
                   style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;letter-spacing:0.2px;">
                  View My Tickets
                </a>
              </td>
            </tr>
            <tr>
              <td align="center">
                <a href="${calUrl}"
                   style="display:inline-block;background:rgba(255,255,255,0.05);color:#9ca3af;font-weight:600;font-size:13px;padding:12px 28px;border-radius:12px;text-decoration:none;border:1px solid rgba(255,255,255,0.08);">
                  📅 &nbsp;Add to Calendar
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
        subject: `🎟 Your ticket for ${title} is confirmed!`,
        html,
      }),
    });

    const resendData = await resendRes.json() as { id?: string; error?: { message: string } };

    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      return NextResponse.json({ sent: false, error: resendData.error?.message }, { status: 200 });
    }

    return NextResponse.json({ sent: true, id: resendData.id });
  } catch (err) {
    console.error("Email confirm error:", err);
    // Never block checkout — return 200 even on failure
    return NextResponse.json({ sent: false, error: "unexpected_error" });
  }
}
