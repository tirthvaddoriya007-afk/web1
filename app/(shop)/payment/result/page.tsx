import { Suspense } from "react";
import PaymentResultClient from "./PaymentResultClient";

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-xl px-4 py-12 text-center">Checking your payment…</main>}>
      <PaymentResultClient />
    </Suspense>
  );
}
