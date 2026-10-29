"use client";

import { createClient } from "./client";

const BUCKET = "product-images";

// Uploads an admin-chosen image into the public "product-images" bucket and
// returns its public URL. Runs in the browser with the admin's session, so the
// storage policies (public read, admin write) apply.
export async function uploadStoreImage(file: File, folder = "products"): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "img";
  const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(name, file, {
    cacheControl: "31536000", // images are content-addressed by unique name — cache forever
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(name);
  return data.publicUrl;
}
