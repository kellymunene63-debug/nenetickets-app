import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { password } = await req.json() as { password: string };
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) return NextResponse.json({ success: false, error: "Admin not configured" }, { status: 500 });
    if (password !== adminPassword) return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
