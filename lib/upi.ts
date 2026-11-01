export interface UpiConfig {
  vpa: string;
  payeeName: string;
  merchantCode: string;
}

export const UPI_APPS = ["gpay", "phonepe", "paytm"] as const;
export type UpiApp = (typeof UPI_APPS)[number];

const APP_SCHEMES: Record<UpiApp, string> = {
  gpay: "tez://upi/pay",
  phonepe: "phonepe://pay",
  paytm: "paytmmp://pay",
};

export const emptyUpiConfig: UpiConfig = {
  vpa: "",
  payeeName: "",
  merchantCode: "",
};

export function buildUpiLink(opts: {
  config: UpiConfig;
  amount: number;
  orderId: string;
  app?: UpiApp;
  purpose?: "COD advance" | "Order payment";
}): string {
  const { config, amount, orderId, app, purpose = "Order payment" } = opts;
  const params = new URLSearchParams({
    pa: config.vpa.trim(),
    pn: config.payeeName.trim() || "Merchant",
    am: amount.toFixed(2),
    cu: "INR",
    tn: `${purpose} ${orderId}`,
    tr: orderId,
  });
  if (config.merchantCode.trim()) params.set("mc", config.merchantCode.trim());
  return `${app ? APP_SCHEMES[app] : "upi://pay"}?${params.toString()}`;
}

export const upiConfigured = (config: UpiConfig) => config.vpa.includes("@");

export function isUpiApp(value: unknown): value is UpiApp {
  return typeof value === "string" && UPI_APPS.includes(value as UpiApp);
}
