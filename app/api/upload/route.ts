import { NextResponse } from "next/server";

// Node runtime so we have access to Buffer for base64 conversion
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64 (ImgBB requires base64 encoded image)
    const bytes  = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Post to ImgBB
    const body = new URLSearchParams();
    body.append("key",   process.env.IMGBB_API_KEY!);
    body.append("image", base64);
    body.append("name",  file.name.replace(/\.[^/.]+$/, "")); // filename without extension

    const res  = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body,
    });

    if (!res.ok) {
      return NextResponse.json({ error: "ImgBB upload failed" }, { status: 500 });
    }

    const data = await res.json() as {
      data: { url: string; display_url: string; delete_url: string };
      success: boolean;
    };

    if (!data.success) {
      return NextResponse.json({ error: "Upload rejected" }, { status: 500 });
    }

    return NextResponse.json({ url: data.data.display_url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
