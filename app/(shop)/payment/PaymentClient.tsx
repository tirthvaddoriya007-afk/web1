"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/data";
import CheckoutSteps from "@/components/CheckoutSteps";
import PaymentPendingModal from "@/components/PaymentPendingModal";
import { buildUpiLink, upiConfigured, type UpiApp, type UpiConfig } from "@/lib/upi";

type Method = "gpay" | "phonepe" | "paytm" | "cod";

const LABELS: Record<Method, string> = {
  gpay: "UPI · Google Pay",
  phonepe: "UPI · PhonePe",
  paytm: "UPI · Paytm",
  cod: "Cash on Delivery",
};

export default function PaymentClient({ upi }: { upi: UpiConfig }) {
  const { items, total, payable, address, placeOrder, ready } = useStore();
  const router = useRouter();

  // No UPI ID saved in the admin panel yet — COD is the only workable option.
  const upiReady = upiConfigured(upi);
  const [method, setMethod] = useState<Method>(upiReady ? "phonepe" : "cod");
  const [placing, setPlacing] = useState(false);
  const [pending, setPending] = useState(false);
  // True once we've handed off to the UPI app. On return we confirm the order.
  const handedOff = useRef(false);
  const confirmedRef = useRef(false);
  const lastNav = useRef(0);

  useEffect(() => {
    if (ready && !pending && (items.length === 0 || !address)) router.replace("/cart");
  }, [ready, pending, items.length, address, router]);

  /**
   * Detect the moment the user comes back from the UPI app. Android WebView
   * and mobile browsers fire `visibilitychange` -> visible and/or `pageshow`
   * (with persisted=true) when the UPI app closes and control returns to this
   * page. We use a short grace period so an instant bounce-back (app not
   * installed) is NOT treated as a successful payment.
   */
  useEffect(() => {
    if (!pending) return;
    if (confirmedRef.current) return;

    const confirmOrder = () => {
      confirmedRef.current = true;
      setPending(false);
      setPlacing(false);
      const order = placeOrder(`${method === "cod" ? LABELS.cod : LABELS[method]} · Paid`);
      if (order) {
        router.replace(`/summary?order=${order.id}`);
      } else {
        // Cart was already empty / missing address — shouldn't happen here.
        router.replace("/cart");
      }
    };

    const cameBack = () => {
      // Ignore the very first paint / event storms during navigation.
      if (!handedOff.current || confirmedRef.current) return;

      // We fired a deep link but never left the page (WebView / missing app).
      // Don't confirm — the popup's failure/retry copy covers this case.
      if (Date.now() - lastNav.current < 1500) return;

      confirmOrder();
    };

    const onVis = () => {
      if (document.visibilityState === "visible") cameBack();
    };
    const onPageShow = (e: PageTransitionEvent) => {
      // A bfcache restore only happens after the page was actually left
      // (navigated away to the UPI app and came back). Treat that as a real
      // return — never a bounce. An instant bounce doesn't produce persisted.
      if (!e.persisted) return;
      if (!handedOff.current || confirmedRef.current) return;
      if (Date.now() - lastNav.current < 1500) return;
      confirmOrder();
    };

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [pending, method, placeOrder, router]);

  const pay = () => {
    if (method === "cod") {
      setPlacing(true);
      setTimeout(() => {
        const order = placeOrder(LABELS.cod);
        router.replace(order ? `/summary?order=${order.id}` : "/cart");
      }, 700);
      return;
    }

    // UPI: store a one-time snapshot of this first order (mirrors the
    // reference store's Ordered* keys), then hand off to the chosen app with
    // the amount locked into the intent link. The pending sheet shows while
    // the user is in the UPI app.
    snapshotFirstOrder();

    // Google Pay and PhonePe both open PhonePe's native collect screen
    // (`phonepe://native?data=<base64>&id=p2ppayment`); Paytm opens its
    // cash-wallet transfer screen. The amount is signed into the link, so the
    // UPI app renders it read-only — the user cannot edit what they pay.
    const appLink = buildUpiLink({ config: upi, app: method as UpiApp, amount: payable });

    handedOff.current = true;
    confirmedRef.current = false;
    lastNav.current = Date.now();
    setPending(true);
    setPlacing(true);

    // Always try the chosen app first. If the scheme can't be assigned the
    // page simply stays put and the popup's failure/retry copy covers it.
    try {
      window.location.assign(appLink);
    } catch {
      /* no-op: the popup's failure/retry state handles a failed handoff */
    }
  };

  // Mirrors the reference store: the first order ever placed is snapshotted
  // into Ordered* localStorage keys (used by the home/account "last order"
  // reorder UI). Subsequent orders leave the snapshot untouched.
  const snapshotFirstOrder = () => {
    try {
      if (window.localStorage.getItem("OrderPurchaseCount") === "1") return;
      const products = window.localStorage.getItem("products");
      const totalAmount = window.localStorage.getItem("TotalcartTotalAmount");
      const cartAmount = window.localStorage.getItem("cartTotalAmount");
      window.localStorage.setItem("OrderPurchaseCount", "1");
      if (products) window.localStorage.setItem("OrderedProducts", products);
      if (totalAmount) window.localStorage.setItem("OrderedTotalcartTotalAmount", totalAmount);
      if (cartAmount) window.localStorage.setItem("OrderedcartTotalAmount", cartAmount);
    } catch {
      /* localStorage unavailable — snapshot is best-effort */
    }
  };

  const tryAgain = () => {
    setPending(false);
    setPlacing(false);
    handedOff.current = false;
    confirmedRef.current = false;
    lastNav.current = 0;
  };

  return (
    <div className="pb-24 bg-[#f4f4f6] min-h-screen">
      <div className="bg-white">
        <CheckoutSteps active={3} />
      </div>

      {/* Header row — .gNFCeh: padding 16px 16px 18px; title .hEBjyt 17px/20px
          bold #353543; the safe-payments mark is grey #8B8BA3 over two lines */}
      <div className="bg-white mt-2 flex items-start justify-between pt-4 px-4 pb-[18px]">
        <h2 className="font-bold text-[17px] leading-5 text-[#353543] m-0">Select Payment Method</h2>
        <span className="flex items-center gap-1.5 shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#ADC6FF" aria-hidden>
            <path d="M12 2l8 3v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V5l8-3z" />
            <path d="M8.4 11.9l2.2 2.2 4.6-4.6" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-semibold leading-[13px] text-[#8b8ba3]">
            100% SAFE
            <br />
            PAYMENTS
          </span>
        </span>
      </div>

      {/* Extra off banner — .cHsEym padding 0 16px 18px; .efQsfx bg #E7EEFF,
          radius 4px, padding 6px 12px, gap 10px; text 15px/20px 600 #5585F8 */}
      <div className="bg-white px-4 pb-[18px]" hidden={!upiReady}>
        <div className="flex items-center justify-start gap-[10px] rounded bg-[#e7eeff] px-3 py-1.5">
          {/* .eVDQPI — 60×60, padding-left 10px (muted is required for the
              browser to honour autoplay) */}
          <video
            src="/banners/cod_lat.webm"
            autoPlay
            loop
            muted
            playsInline
            className="flex h-[60px] w-[60px] items-center pl-2.5"
          />
          <span className="text-[15px] font-semibold leading-5 text-[#5585f8]">
            Pay online &amp; get EXTRA ₹33 off
          </span>
        </div>
      </div>

      {/* Pay online / UPI accordion */}
      <div className="bg-white">
        {upiReady && (
          <>
            {/* .GmPbS — padding 6px 16px, gap 10px, label 10px/600, rule fills */}
            <div className="flex items-center gap-[10px] bg-white px-4 py-1.5">
              <span className="text-[10px] font-semibold text-[#353543]">PAY ONLINE</span>
              <div className="h-px flex-grow bg-[#cecede]" />
            </div>

            <div className="px-4">
              <div className="flex items-center gap-2 py-3 border-b">
                <span className="bg-[#5b6cf0] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">UPI</span>
                <span className="text-[15px] flex-1 text-[#353543]">UPI(GPay/PhonePe/Paytm)</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </div>

              <UpiRow k="gpay" label="G Pay" method={method} set={setMethod} logo={<GPayLogo />} />
              <UpiRow k="phonepe" label="PhonePe" method={method} set={setMethod}
                note={<span className="text-[11px] text-[red]">25% Cashback in 24 hour</span>}
                logo={<PhonePeLogo />} labelColor="green" />
              <UpiRow k="paytm" label="Paytm" method={method} set={setMethod}
                note={<span className="text-[11px] text-[green]">20% Cashback in 24 hour</span>}
                logo={<PaytmLogo />} />
            </div>
          </>
        )}

        {/* COD is the fallback when no UPI ID is configured — the reference
            screen only ever shows the UPI list. */}
        {!upiReady && (
          <div className="px-4">
            <UpiRow k="cod" label="Cash on Delivery" method={method} set={setMethod}
              note={<span className="text-[11px] text-[#9b9b9b]">Pay when your order arrives</span>} />
          </div>
        )}
      </div>

      {/* Price block — .cart__footer has 5px #eaeaf2 rules top and bottom */}
      <div className="bg-white mt-2 px-4 py-4 border-y-[5px] border-[#eaeaf2]">
        <div className="flex justify-between text-[14px] py-1.5">
          <span>Shipping:</span>
          <span className="font-semibold">FREE</span>
        </div>
        <div className="flex justify-between text-[14px] py-1.5">
          <span>Total Product Price:</span>
          <span className="font-semibold">{formatPrice(total)}</span>
        </div>
        {/* solid grey separator here (the cart's dashed rule is a different div) */}
        <div className="h-px bg-[#eaeaf2] mt-3 mb-1" />
        <div className="flex justify-between text-[15px] font-bold py-3">
          <span>Order Total :</span>
          <span>{formatPrice(payable)}</span>
        </div>
      </div>

      {/* Bottom bar — .eGwEyP padding 12px 16px; left half .dUijPM (amount
          17px/20px 700 #353543, link 13px/16px 700 #9F2089), right half 50% */}
      <div className="action-bar items-center">
        <div className="flex-1 max-w-[50%] pr-2">
          <div className="text-[17px] font-bold leading-5 text-[#353543]">{formatPrice(payable)}</div>
          <button className="text-[13px] font-bold leading-4 tracking-[0.0015em] text-left" style={{ color: "var(--brand)" }}>
            VIEW PRICE DETAILS
          </button>
        </div>
        <button className="btn-brand" onClick={pay} disabled={placing}>
          {placing ? "Processing..." : method === "cod" ? "Place Order" : "PayNow"}
        </button>
      </div>

      <PaymentPendingModal open={pending} onTryAgain={tryAgain} />
    </div>
  );
}

function UpiRow({
  k, label, method, set, note, logo, labelColor,
}: {
  k: Method;
  label: string;
  method: Method;
  set: (m: Method) => void;
  note?: React.ReactNode;
  logo?: React.ReactNode;
  labelColor?: string;
}) {
  const active = method === k;
  return (
    <button onClick={() => set(k)} className="w-full flex items-center gap-3 py-3.5 border-b text-left">
      {/* selected = filled blue ring (.IhlWp uses #5585F8); idle = grey ring
          with a faint centre dot */}
      <span className="w-5 h-5 rounded-full border-2 grid place-items-center shrink-0"
        style={{ borderColor: active ? "#5585f8" : "#c4c4cf" }}>
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: active ? "#5585f8" : "#e4e4ec" }}
        />
      </span>
      <span className="text-[15px] font-semibold" style={{ color: labelColor || "#353543" }}>{label}</span>
      <span className="flex-1 text-right pr-1">{note}</span>
      {logo && <span className="shrink-0">{logo}</span>}
    </button>
  );
}

/* Real provider marks from /public/banners. Each sits in the same 26×26 box
   with object-contain, so the three logos line up down the column no matter
   how differently they're cropped (GPay is wide, PhonePe round, Paytm square). */
function ProviderLogo({ src, name }: { src: string; name: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={26}
      height={26}
      loading="lazy"
      decoding="async"
      className="h-[26px] w-[26px] object-contain"
    />
  );
}
function GPayLogo() {
  return <ProviderLogo src="/banners/gpa.png" name="Google Pay" />;
}
function PhonePeLogo() {
  return <ProviderLogo src="/banners/phonepe.png" name="PhonePe" />;
}
function PaytmLogo() {
  return <ProviderLogo src="/banners/pam.png" name="Paytm" />;
}
