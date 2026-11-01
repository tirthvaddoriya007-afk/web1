import PaytmChecksum from "paytmchecksum";

type PaytmEnvironment = "staging" | "production";

interface PaytmResponse<T> {
  head?: { signature?: string };
  body?: T;
}

interface PaytmResultInfo {
  resultStatus?: string;
  resultCode?: string;
  resultMsg?: string;
}

interface InitiateTransactionBody {
  resultInfo?: PaytmResultInfo;
  txnToken?: string;
}

interface PaymentStatusBody {
  mid?: string;
  orderId?: string;
  txnAmount?: string;
  txnId?: string;
  resultInfo?: PaytmResultInfo;
}

export interface PaytmConfig {
  mid: string;
  merchantKey: string;
  environment: PaytmEnvironment;
  apiBaseUrl: string;
  checkoutBaseUrl: string;
}

export function getPaytmConfig(): PaytmConfig {
  const mid = process.env.PAYTM_MID?.trim();
  const merchantKey = process.env.PAYTM_MERCHANT_KEY;
  const environment = process.env.PAYTM_ENV;

  if (!mid || !merchantKey || (environment !== "staging" && environment !== "production")) {
    throw new Error("Set PAYTM_MID, PAYTM_MERCHANT_KEY, and PAYTM_ENV.");
  }
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(mid) || Buffer.byteLength(merchantKey, "utf8") !== 16) {
    throw new Error("Paytm credentials are not valid.");
  }

  const isProduction = environment === "production";
  return {
    mid,
    merchantKey,
    environment,
    apiBaseUrl: isProduction
      ? "https://secure.paytmpayments.com"
      : "https://securestage.paytmpayments.com",
    checkoutBaseUrl: isProduction
      ? "https://securegw.paytm.in"
      : "https://securegw-stage.paytm.in",
  };
}

export function isPaytmConfigured() {
  try {
    getPaytmConfig();
    return true;
  } catch {
    return false;
  }
}

async function postPaytm<T>(config: PaytmConfig, path: string, query: Record<string, string>, body: object) {
  const payload = JSON.stringify(body);
  const signature = await PaytmChecksum.generateSignature(payload, config.merchantKey);
  const url = new URL(path, config.apiBaseUrl);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, head: { signature } }),
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Could not reach Paytm Payment Gateway:", error);
    throw new Error("Paytm checkout could not be reached. Please try again later.");
  }

  let result: PaytmResponse<T>;
  try {
    result = await response.json() as PaytmResponse<T>;
  } catch {
    throw new Error("Paytm returned an invalid response.");
  }

  if (!response.ok || !result.body || !result.head?.signature) {
    console.error("Paytm returned an unsuccessful or unsigned response.", response.status);
    throw new Error("Paytm could not process the payment request.");
  }

  const validSignature = await PaytmChecksum.verifySignature(
    JSON.stringify(result.body),
    config.merchantKey,
    result.head.signature
  );
  if (!validSignature) {
    console.error("Paytm response signature verification failed.");
    throw new Error("Paytm response could not be verified.");
  }

  return result.body;
}

export async function initiatePaytmTransaction(input: {
  orderId: string;
  amount: number;
  customerPhone: string;
  callbackUrl: string;
}) {
  const config = getPaytmConfig();
  const body = await postPaytm<InitiateTransactionBody>(
    config,
    "/theia/api/v1/initiateTransaction",
    { mid: config.mid, orderId: input.orderId },
    {
      requestType: "Payment",
      mid: config.mid,
      websiteName: config.environment === "production" ? "DEFAULT" : "WEBSTAGING",
      orderId: input.orderId,
      txnAmount: { value: input.amount.toFixed(2), currency: "INR" },
      userInfo: {
        custId: `CUST_${input.customerPhone}`,
        mobile: input.customerPhone,
      },
      callbackUrl: input.callbackUrl,
      enablePaymentMode: [{ mode: "UPI" }],
    }
  );

  if (body.resultInfo?.resultStatus !== "S" || !body.txnToken) {
    console.error("Paytm did not create a transaction token.", body.resultInfo?.resultCode);
    throw new Error("Paytm could not start checkout. Please try again.");
  }

  const checkoutUrl = new URL("/theia/api/v1/showPaymentPage", config.checkoutBaseUrl);
  checkoutUrl.searchParams.set("mid", config.mid);
  checkoutUrl.searchParams.set("orderId", input.orderId);

  return { mid: config.mid, txnToken: body.txnToken, checkoutUrl: checkoutUrl.toString() };
}

export async function getPaytmPaymentStatus(orderId: string) {
  const config = getPaytmConfig();
  const body = await postPaytm<PaymentStatusBody>(
    config,
    "/merchant-status/api/v1/getPaymentStatus",
    { mid: config.mid, orderId },
    { mid: config.mid, orderId }
  );

  if (!body.resultInfo?.resultStatus) {
    throw new Error("Paytm returned an incomplete payment status.");
  }
  return body;
}

export async function verifyPaytmCallback(fields: Record<string, string>) {
  const config = getPaytmConfig();
  const checksum = fields.CHECKSUMHASH;
  if (!checksum) return false;

  const callbackFields = { ...fields };
  delete callbackFields.CHECKSUMHASH;
  return await PaytmChecksum.verifySignature(callbackFields, config.merchantKey, checksum);
}
