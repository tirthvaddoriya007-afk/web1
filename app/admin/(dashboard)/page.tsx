import { createClient } from "@/lib/supabase/server";
import UpiSettingsForm from "./UpiSettingsForm";

export const dynamic = "force-dynamic";
// Never serve a cached settings row — the form must show what is actually
// saved after an update (Next 14 fetch cache would otherwise keep the old one).
export const fetchCache = "force-no-store";

export default async function AdminSettingsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("settings")
    .select("upi_vpa, upi_payee_name, upi_merchant_code")
    .eq("id", 1)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
          Payment
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          These details are used for every UPI payment on the storefront.
          Changes go live instantly for all visitors.
        </p>
        <div className="mt-3">
          <UpiSettingsForm
            initial={{
              upi_vpa: data?.upi_vpa ?? "",
              upi_payee_name: data?.upi_payee_name ?? "",
              upi_merchant_code: data?.upi_merchant_code ?? "",
            }}
          />
        </div>
      </section>
    </div>
  );
}
