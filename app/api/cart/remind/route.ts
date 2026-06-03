// app/api/cart/remind/route.ts  (NEW FILE)
//
// Called by Upstash QStash ~1 hour after a cart is saved.
// Sends a reminder email via Resend if the cart is still abandoned
// (not completed and not already reminded).

import { NextResponse } from "next/server";
import type { AbandonedCart } from "../route";   // adjust if you rename the file

export const runtime = "edge";
export const dynamic = "force-dynamic";

// ─── Redis helpers ────────────────────────────────────────────────────────────

async function redisGet<T>(key: string): Promise<T | null> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  const res  = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;

  const json = await res.json() as { result: string | null };
  if (!json.result) return null;

  try {
    let data: unknown = json.result;
    if (typeof data === "string") data = JSON.parse(data);
    if (typeof data === "string") data = JSON.parse(data);
    return data as T;
  } catch {
    return null;
  }
}

async function redisSet(key: string, value: unknown, exSeconds?: number): Promise<void> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;

  const cmd: unknown[] = ["SET", key, JSON.stringify(value)];
  if (exSeconds) cmd.push("EX", exSeconds);

  await fetch(`${url}/pipeline`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body:    JSON.stringify([cmd]),
  });
}

// ─── Email sender (Resend) ────────────────────────────────────────────────────

async function sendReminderEmail(cart: AbandonedCart): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const baseUrl   = process.env.NEXT_PUBLIC_BASE_URL ?? "https://nenetickets.co.ke";
  const eventUrl  = cart.eventId ? `${baseUrl}/event/${cart.eventId}` : `${baseUrl}/events`;

  const checkoutParams = new URLSearchParams({
    title:    cart.title,
    type:     cart.type,
    price:    String(cart.price),
    quantity: String(cart.quantity),
    date:     cart.date,
    time:     cart.time,
    location: cart.location,
    eventId:  cart.eventId,
  });
  const checkoutUrl = `${baseUrl}/checkout?${checkoutParams.toString()}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You left tickets behind!</title>
</head>
<body style="margin:0;padding:0;background:#050511;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050511;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Logo -->
        <tr><td style="padding-bottom:28px;" align="center">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#2563eb;border-radius:12px;padding:10px 14px;">
                <span style="color:#fff;font-size:20px;">🎟</span>
              </td>
              <td style="padding-left:10px;">
                <span style="font-size:22px;font-weight:900;color:#ffffff;">NeneTickets</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Hero card -->
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0"
            style="background:linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%);
                   border:1px solid rgba(255,255,255,0.1);border-radius:20px;
                   padding:36px 32px;">

            <!-- Emoji + headline -->
            <tr><td align="center" style="padding-bottom:8px;">
              <span style="font-size:48px;">🎫</span>
            </td></tr>
            <tr><td align="center" style="padding-bottom:4px;">
              <h1 style="margin:0;font-size:26px;font-weight:900;color:#ffffff;line-height:1.2;">
                You left a ticket behind!
              </h1>
            </td></tr>
            <tr><td align="center" style="padding-bottom:28px;">
              <p style="margin:8px 0 0;font-size:15px;color:#94a3b8;line-height:1.5;">
                Your seat at <strong style="color:#ffffff;">${cart.title}</strong> is not yet secured.
                Complete your purchase before it sells out.
              </p>
            </td></tr>

            <!-- Event details card -->
            <tr><td style="padding-bottom:28px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
                       border-radius:14px;padding:20px 24px;">
                <tr>
                  <td style="padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08);">
                    <p style="margin:0;font-size:12px;font-weight:700;color:#64748b;
                               text-transform:uppercase;letter-spacing:1px;">Event</p>
                    <p style="margin:4px 0 0;font-size:17px;font-weight:800;color:#ffffff;">
                      ${cart.title}
                    </p>
                  </td>
                </tr>
                <tr><td style="padding-top:12px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="padding-bottom:10px;">
                        <p style="margin:0;font-size:11px;font-weight:700;color:#64748b;
                                   text-transform:uppercase;letter-spacing:0.8px;">Ticket Type</p>
                        <p style="margin:3px 0 0;font-size:14px;font-weight:700;color:#e2e8f0;">
                          ${cart.type}
                        </p>
                      </td>
                      <td width="50%" style="padding-bottom:10px;">
                        <p style="margin:0;font-size:11px;font-weight:700;color:#64748b;
                                   text-transform:uppercase;letter-spacing:0.8px;">Quantity</p>
                        <p style="margin:3px 0 0;font-size:14px;font-weight:700;color:#e2e8f0;">
                          ${cart.quantity} ticket${cart.quantity > 1 ? "s" : ""}
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td width="50%">
                        <p style="margin:0;font-size:11px;font-weight:700;color:#64748b;
                                   text-transform:uppercase;letter-spacing:0.8px;">Price</p>
                        <p style="margin:3px 0 0;font-size:16px;font-weight:900;color:#f97316;">
                          ${cart.price === 0 ? "FREE" : `KES ${(cart.price * cart.quantity).toLocaleString()}`}
                        </p>
                      </td>
                      <td width="50%">
                        <p style="margin:0;font-size:11px;font-weight:700;color:#64748b;
                                   text-transform:uppercase;letter-spacing:0.8px;">Date</p>
                        <p style="margin:3px 0 0;font-size:14px;font-weight:700;color:#e2e8f0;">
                          ${cart.date}${cart.time ? ` · ${cart.time}` : ""}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </td></tr>

            <!-- CTA button -->
            <tr><td align="center" style="padding-bottom:16px;">
              <a href="${checkoutUrl}"
                style="display:inline-block;background:#2563eb;color:#ffffff;
                       font-size:16px;font-weight:900;text-decoration:none;
                       padding:16px 40px;border-radius:14px;
                       box-shadow:0 0 24px rgba(37,99,235,0.5);">
                Complete My Purchase →
              </a>
            </td></tr>

            <!-- Urgency note -->
            <tr><td align="center">
              <p style="margin:0;font-size:13px;color:#64748b;">
                🔥 Seats are filling up fast. Don't miss out!
              </p>
            </td></tr>

          </table>
        </td></tr>

        <!-- View event link -->
        <tr><td align="center" style="padding-top:20px;padding-bottom:28px;">
          <a href="${eventUrl}"
            style="color:#3b82f6;font-size:13px;text-decoration:underline;">
            View event page
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td align="center">
          <p style="margin:0;font-size:12px;color:#334155;line-height:1.6;">
            You received this because you started checking out on NeneTickets.<br />
            If you completed your purchase, ignore this email.<br />
            &copy; ${new Date().getFullYear()} NeneTickets Ltd · Built with ❤️ in Nairobi
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method:  "POST",
    headers: {
      Authorization:  `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:    process.env.RESEND_FROM_EMAIL ?? "NeneTickets <onboarding@resend.dev>",
      to:      [cart.email],
      subject: `⏰ You left tickets for "${cart.title}" behind`,
      html,
    }),
  });

  return res.ok;
}

// ─── POST /api/cart/remind ────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json() as { cartId?: string };
    const cartId = body.cartId;

    if (!cartId) {
      return NextResponse.json({ ok: false, error: "Missing cartId" }, { status: 400 });
    }

    const cart = await redisGet<AbandonedCart>(`nene:cart:${cartId}`);

    // Skip if cart was completed, already reminded, or doesn't exist
    if (!cart) return NextResponse.json({ ok: true, skipped: "not_found" });
    if (cart.completed)    return NextResponse.json({ ok: true, skipped: "completed" });
    if (cart.reminderSent) return NextResponse.json({ ok: true, skipped: "already_sent" });

    // Send the reminder email
    const sent = await sendReminderEmail(cart);

    // Mark reminder as sent regardless of email success (avoid spam on retry)
    await redisSet(`nene:cart:${cartId}`, { ...cart, reminderSent: true }, 172_800);

    return NextResponse.json({ ok: true, sent });
  } catch (err) {
    console.error("POST /api/cart/remind:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
