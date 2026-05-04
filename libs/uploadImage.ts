/**
 * uploadImage — fast client-side image upload to ImgBB
 *
 * Flow:
 *  1. Compress & resize the image in the browser (Canvas API) → ~80% smaller
 *  2. Upload the compressed base64 directly to ImgBB (no Vercel round trip)
 *
 * Why direct? The old route was:  Browser → Vercel → ImgBB  (2 network hops)
 * This is:                        Browser → ImgBB             (1 network hop)
 *
 * Set NEXT_PUBLIC_IMGBB_API_KEY in Vercel env vars (same value as IMGBB_API_KEY).
 */

const MAX_WIDTH  = 1200; // px — sufficient for event hero images
const QUALITY    = 0.82; // JPEG quality (0–1)

/** Resize + compress a File using the Canvas API, returns base64 (no prefix). */
function compressToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.onload  = (e) => {
      const dataUrl = e.target?.result as string;
      const img     = new Image();

      img.onerror = () => reject(new Error("Image decode failed"));
      img.onload  = () => {
        // Scale down only if wider than MAX_WIDTH
        const scale  = Math.min(1, MAX_WIDTH / img.width);
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not available"));

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // toDataURL returns "data:image/jpeg;base64,<base64>" — strip the prefix
        const full   = canvas.toDataURL("image/jpeg", QUALITY);
        const base64 = full.split(",")[1];
        resolve(base64);
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}

/** Upload a File to ImgBB and return the hosted image URL. */
export async function uploadImage(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) throw new Error("NEXT_PUBLIC_IMGBB_API_KEY is not set");

  // 1. Compress client-side
  const base64 = await compressToBase64(file);

  // 2. Upload directly to ImgBB from the browser
  const body = new URLSearchParams();
  body.append("key",   apiKey);
  body.append("image", base64);
  body.append("name",  file.name.replace(/\.[^/.]+$/, "")); // strip extension

  const res = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body,
  });

  if (!res.ok) throw new Error(`ImgBB error ${res.status}`);

  const data = await res.json() as {
    success: boolean;
    data: { display_url: string };
  };

  if (!data.success) throw new Error("ImgBB rejected the upload");

  return data.data.display_url; // clean https://i.ibb.co/... URL
}
