export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error("Upload failed");

  const data = await res.json() as { url: string };
  return data.url; // clean https://i.ibb.co/... URL stored in Redis
}
