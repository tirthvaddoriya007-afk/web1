// =============================================================================
// UPI PAYMENT CONFIG
//
// The live values come from the `settings` row in Supabase, edited at /admin.
// The constants below are only the fallback used before that row is filled in.
//
// The deep links mirror the reference store's payment hand-off:
//   • Google Pay and PhonePe open PhonePe's native collect screen
//     (`phonepe://native?data=<base64>&id=p2ppayment`) with a base64 JSON
//     checkout payload built by generateUpiPayload().
//   • Paytm opens its cash-wallet transfer screen
//     (`paytmmp://cash_wallet?pa=…&pn=…&am=…&cu=INR&tn=…&featuretype=money_transfer`).
// =============================================================================

export interface UpiConfig {
  /** UPI ID / VPA, e.g. "yourname@okhdfcbank" or "9876543210@ybl". */
  vpa: string;
  /** Payee name shown inside the UPI app. Keep it short. */
  payeeName: string;
  /** Optional merchant code (MCC). Empty for a personal UPI ID. */
  merchantCode: string;
}

export const emptyUpiConfig: UpiConfig = {
  vpa: "",
  payeeName: "",
  merchantCode: "",
};

export type UpiApp = "gpay" | "phonepe" | "paytm";

/**
 * Base64 JSON payload for PhonePe's native P2P collect screen
 * (`phonepe://native?data=<this>&id=p2ppayment`).
 *
 * Mirrors the reference site's generateUpiPayload(): the note is a unique
 * `Orderid-<6 digits>`, the amount is locked (allowAmountEdit /
 * disableNotesEdit / disableViewHistory), the contact is an external merchant,
 * and the amount is expressed in paise (`initialAmount: Math.round(amount * 100)`).
 */
export function generateUpiPayload(vpa: string, payeeName: string, amount: number): string {
  const orderId = Math.floor(100000 + Math.random() * 900000);
  const data = {
    p2pPaymentCheckoutParams: {
      isByDefaultKnownContact: true,
      enableSpeechToText: false,
      allowAmountEdit: false,
      showQrCodeOption: false,
      disableViewHistory: true,
      shouldShowUnsavedContactBanner: false,
      isRecurring: false,
      checkoutType: "COLLECT",
      transactionContext: "p2p",
      initialAmount: Math.round(amount * 100), // paise
      disableNotesEdit: true,
      currency: "INR",
      shouldShowMaskedNumber: true,
      note: {
        type: "text",
        message: `Orderid-${orderId}`,
      },
      supportedInstruments: -1,
    },
    contact: {
      type: "EXTERNAL_MERCHANT",
      name: payeeName,
      vpa,
    },
  };
  // Kept raw (not URL-encoded) exactly like the reference flow — the UPI app
  // expects the plain base64 string in the `data` parameter.
  return btoa(JSON.stringify(data));
}

/**
 * Build the deep link that hands the customer off to the chosen UPI app:
 *   • gpay / phonepe → PhonePe's native collect screen (base64 payload above)
 *   • paytm          → Paytm cash-wallet transfer with the amount read-only
 */
export function buildUpiLink(opts: {
  config: UpiConfig;
  app: UpiApp;
  amount: number;
}): string {
  const { config, app, amount } = opts;
  const vpa = config.vpa.trim();
  const payeeName = config.payeeName.trim() || "Merchant";

  if (app === "paytm") {
    const amt = amount.toFixed(2);
    return (
      `paytmmp://cash_wallet?pa=${vpa}` +
      `&pn=${encodeURIComponent(payeeName)}` +
      `&am=${amt}&cu=INR` +
      `&tn=${encodeURIComponent(payeeName)}` +
      `&featuretype=money_transfer`
    );
  }

  // Google Pay and PhonePe both open PhonePe's collect screen (reference flow).
  return `phonepe://native?data=${generateUpiPayload(vpa, payeeName, amount)}&id=p2ppayment`;
}

/** True when a UPI ID is actually configured (has a VPA with an @). */
export const upiConfigured = (config: UpiConfig) => config.vpa.includes("@");
