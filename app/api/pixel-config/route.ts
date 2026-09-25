import { getMetaPixelId } from "@/lib/settings";

// Public JSON endpoint: client pages fetch the pixel ID from here so an admin
// can change it at /admin without a redeploy. Never cached — always fresh.
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ pixelId: await getMetaPixelId() });
}
