import { getHomeContent } from "@/lib/catalog";
import HomeContentForm from "@/components/admin/HomeContentForm";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminHomeContentPage() {
  const content = await getHomeContent();

  return <HomeContentForm initial={content} />;
}
