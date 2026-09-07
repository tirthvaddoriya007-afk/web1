import { createClient } from "@/lib/supabase/server";
import UpiSettingsForm from "./UpiSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("settings")
    .select("upi_vpa, upi_payee_name, upi_merchant_code")
    .eq("id", 1)
    .maybeSingle();

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-900">UPI settings</h1>
      <p className="mt-1 mb-4 text-sm text-gray-500">
        These details are used for every UPI payment on the storefront.
      </p>
      <UpiSettingsForm
        initial={{
          upi_vpa: data?.upi_vpa ?? "",
          upi_payee_name: data?.upi_payee_name ?? "",
          upi_merchant_code: data?.upi_merchant_code ?? "",
        }}
      />
    </div>
  );
}
