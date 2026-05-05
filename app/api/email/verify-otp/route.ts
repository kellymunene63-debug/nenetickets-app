import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function redisGet(key: string): Promise<string | null> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json() as { result: unknown };
  if (!json.result) return null;
  let val: unknown = json.result;
  if (typeof val === "string" && val.startsWith('"')) {
    try { val = JSON.parse(val); } catch { /* keep */ }
  }
  return String(val);
}

async function redisDel(key: string): Promise<void> {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;
  await fetch(`${url}/del/${encodeURIComponent(key)}`, {
    method: "POST", headers: { Authorization: `Bearer ${token}` },
  });
}

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json() as { email: string; otp: string };
    if (!email || !otp) return NextResponse.json({ success: false, error: "Email and OTP required" }, { status: 400 });

    const key    = `nene:otp:${email.toLowerCase()}`;
    const stored = await redisGet(key);

    if (!stored) return NextResponse.json({ success: false, error: "Code expired or not found. Request a new one." }, { status: 400 });
    if (stored.trim() !== otp.trim()) return NextResponse.json({ success: false, error: "Incorrect code. Please try again." }, { status: 400 });

    await redisDel(key);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
