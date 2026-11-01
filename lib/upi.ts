export interface UpiConfig {
  vpa: string;
  payeeName: string;
  merchantCode: string;
}

export const emptyUpiConfig: UpiConfig = {
  vpa: "",
  payeeName: "",
  merchantCode: "",
};

function generateUpiPayload(vpa: string, payeeName: string, amount: number, orderId: string): string {
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
      initialAmount: Math.round(amount * 100),
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
  return Buffer.from(JSON.stringify(data), "utf8").toString("base64");
}

export function buildUpiLink(opts: {
  config: UpiConfig;
  amount: number;
  orderId: string;
  isIOS?: boolean;
}): string {
  const { config, amount, orderId, isIOS = false } = opts;
  const vpa = config.vpa.trim();
  const payeeName = config.payeeName.trim() || "Merchant";

  if (isIOS) {
    return (
      `phonepe:upi://pay?pa=${encodeURIComponent(vpa)}` +
      `&pn=${encodeURIComponent(payeeName)}` +
      `&am=${amount.toFixed(2)}&cu=INR` +
      `&tn=${encodeURIComponent(`Orderid-${orderId}`)}`
    );
  }

  const payload = generateUpiPayload(vpa, payeeName, amount, orderId);
  return `phonepe://native?data=${payload}&id=p2ppayment`;
}

export const upiConfigured = (config: UpiConfig) => config.vpa.includes("@");
