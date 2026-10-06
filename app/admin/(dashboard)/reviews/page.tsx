import { getReviews } from "@/lib/catalog";
import ReviewsManager from "@/components/admin/ReviewsManager";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function AdminReviewsPage() {
  const reviews = await getReviews();

  return <ReviewsManager initial={reviews} />;
}
