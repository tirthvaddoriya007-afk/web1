import { redirect } from "next/navigation";

// Campaign catch-all — every URL that isn't a real page of the store is a
// tracker-style campaign link (e.g. /cvft4r/OFFER/cmf99-fk/). Opening one
// converts it to the store root, exactly like the reference chain: entry URL
// → tracker link → store opens. The welcome landing takes over from there
// (tap anywhere or the auto-redirect timer → /home).
export const dynamic = "force-dynamic";

export default function CampaignCatchAll() {
  redirect("/");
}
