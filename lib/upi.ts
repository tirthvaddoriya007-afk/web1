// =============================================================================
// UPI PAYMENT LINKS — merged payment hand-off.
//
//   • Google Pay → the PaymentRequest API (`https://tez.google.com/pay`,
//     handled in PaymentClient); the `tez://upi/pay` fallback link is built here.
//   • PhonePe    → `phonepe://pay`  (documented UPI intent)
//   • Paytm      → `paytmmp://pay`  (documented UPI intent)
//   • iOS        → PaymentRequest is unavailable, so the GPay button routes
//     through Paytm's wallet link (with the reference's signature).
//
// Every intent uses the documented UPI parameters:
//   pa (payee VPA), pn (payee name), am (amount), tr (reference),
//   mc (merchant code), cu (currency), tn (note).
//
// The live values come from the `settings` row in Supabase, edited at /admin.
// =============================================================================

export interface UpiConfig {
  /** UPI ID / VPA, e.g. "yourname@okhdfcbank" or "9876543210@ybl". */
  vpa: string;
  /** Payee name shown inside the UPI app. Keep it short. */
  payeeName: string;
  /** Optional merchant code (MCC). Empty falls back to the reference's 8999. */
  merchantCode: string;
}

export const emptyUpiConfig: UpiConfig = {
  vpa: "",
  payeeName: "",
  merchantCode: "",
};

export type UpiApp = "gpay" | "phonepe" | "paytm";

/**
 * True on iPhone/iPad (including iPads that report as Mac desktops) — the
 * reference store's detection. Used to route the GPay button around
 * PaymentRequest on iOS.
 */
export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * Paytm wallet signature the reference appends on iOS. Kept verbatim so the
 * iOS GPay link is byte-for-byte the reference's link.
 */
const PAYTM_WALLET_SIGN =
  "AAuN7izDWN5cb8A5scnUiNME+LkZqI2DWgkXlN1McoP6WZABa/KkFTiLvuPRP6/nWK8BPg/rPhb+u4QMrUEX10UsANTDbJaALcSM9b8Wk218X+55T/zOzb7xoiB+BcX8yYuYayELImXJHIgL/c7nkAnHrwUCmbM97nRbCVVRvU0ku3Tr";

/**
 * Build the deep link that hands the customer off to the chosen UPI app —
 * the same link strings the reference store builds:
 *   • gpay    → `tez://upi/pay` (Android fallback) / Paytm wallet link (iOS)
 *   • phonepe → `phonepe://pay`
 *   • paytm   → `paytmmp://pay`
 */
export function buildUpiLink(opts: {
  config: UpiConfig;
  app: UpiApp;
  amount: number;
}): string {
  const { config, app, amount } = opts;
  const vpa = config.vpa.trim();
  const payeeName = config.payeeName.trim() || "Merchant";
  const am = amount.toFixed(2);
  const mc = config.merchantCode.trim() || "8999";

  if (app === "gpay") {
    if (isIOS()) {
      // Reference flow: on iOS the GPay button opens Paytm's wallet link.
      const txnId = Math.floor(Math.random() * 10000000000);
      return (
        `paytmmp://cash_wallet?pa=${vpa}` +
        `&pn=${encodeURIComponent(payeeName)}` +
        `&am=${am}` +
        `&tr=&mc=8999&cu=INR` +
        `&tn=${txnId}` +
        `&sign=${PAYTM_WALLET_SIGN}`
      );
    }
    return (
      `tez://upi/pay?pa=${vpa}` +
      `&pn=${encodeURIComponent(payeeName)}` +
      `&am=${am}` +
      `&mc=${mc}&cu=INR` +
      `&tn=${encodeURIComponent(payeeName)}`
    );
  }

  if (app === "phonepe") {
    return (
      `phonepe://pay?pa=${vpa}` +
      `&pn=${encodeURIComponent(payeeName)}` +
      `&am=${am}` +
      `&tr=&mc=${mc}&cu=INR` +
      `&tn=${encodeURIComponent(payeeName)}`
    );
  }

  // paytm — the documented UPI pay intent, not the wallet-transfer screen.
  return (
    `paytmmp://pay?pa=${vpa}` +
    `&pn=${encodeURIComponent(payeeName)}` +
    `&am=${am}` +
    `&tr=&mc=${mc}&cu=INR` +
    `&tn=${encodeURIComponent(payeeName)}`
  );
}

/** True when a UPI ID is actually configured (has a VPA with an @). */
export const upiConfigured = (config: UpiConfig) => config.vpa.includes("@");
