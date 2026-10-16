"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/data";
import CheckoutSteps from "@/components/CheckoutSteps";
import PaymentPendingModal, { type PaymentPopupState } from "@/components/PaymentPendingModal";
import { buildUpiLink, upiConfigured, type UpiApp, type UpiConfig } from "@/lib/upi";

type Method = "gpay" | "phonepe" | "paytm" | "cod";

const LABELS: Record<Method, string> = {
  gpay: "UPI · Google Pay",
  phonepe: "UPI · PhonePe",
  paytm: "UPI · Paytm",
  cod: "Cash on Delivery",
};

export default function PaymentClient({ upi }: { upi: UpiConfig }) {
  const { items, total, comboDiscount, payable, address, placeOrder, ready } = useStore();
  const router = useRouter();

  // No UPI ID saved in the admin panel yet — COD is the only workable option.
  const upiReady = upiConfigured(upi);
  const [method, setMethod] = useState<Method>(upiReady ? "phonepe" : "cod");
  const [placing, setPlacing] = useState(false);
  // "opening" = spinner popup during hand-off; "incomplete" = the "Payment
  // not completed?" popup shown when the user comes back from the UPI app.
  const [popup, setPopup] = useState<PaymentPopupState | null>(null);
  // True once the UPI deep link has been fired; guards the return listeners.
  const handedOff = useRef(false);

  useEffect(() => {
    if (ready && !popup && (items.length === 0 || !address)) router.replace("/cart");
  }, [ready, popup, items.length, address, router]);

  /**
   * While the "opening" popup is up, watch page visibility to detect the UPI
   * round-trip:
   *   • the page goes hidden (user actually left for the payment app) and
   *     then comes back visible → switch the popup to "Payment not
   *     completed?" — ANY return does this, no order is placed here.
   *   • a bfcache `pageshow` restore counts as a real return too.
   *   • if the page NEVER went hidden within 2s, the deep link failed (app
   *     not installed / scheme blocked) → close the popup and leave the user
   *     on the payment page with their method and amount intact.
   */
  useEffect(() => {
    if (popup !== "opening") return;

    let leftPage = false;

    const markIncomplete = () => {
      if (!handedOff.current) return;
      setPopup("incomplete");
    };

    const backToPayment = () => {
      setPopup(null);
      setPlacing(false);
      handedOff.current = false;
    };

    const onVis = () => {
      if (document.visibilityState === "hidden") {
        leftPage = true;
      } else if (document.visibilityState === "visible" && leftPage) {
        markIncomplete();
      }
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      markIncomplete();
    };

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pageshow", onPageShow);
    const timer = window.setTimeout(() => {
      if (!leftPage && document.visibilityState === "visible") backToPayment();
    }, 2000);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pageshow", onPageShow);
      window.clearTimeout(timer);
    };
  }, [popup]);

  /**
   * Fire the deep link for the given app — the exact same redirection as
   * before (PhonePe collect screen for gpay/phonepe, Paytm cash-wallet for
   * paytm). The spinner popup opens on the same tick so the user sees
   * "Opening payment app..." while the OS switches apps.
   */
  const handoff = (app: Method) => {
    const appLink = buildUpiLink({ config: upi, app: app as UpiApp, amount: payable });

    handedOff.current = true;
    setPlacing(true);
    setPopup("opening");

    try {
      window.location.assign(appLink);
    } catch {
      /* no-op: the 2s fallback returns the user to the payment page */
    }
  };

  /**
   * Tap-to-pay: selecting a DIFFERENT UPI option fires the hand-off to that
   * app instantly — no Pay Now tap needed. Same-option taps only select, and
   * COD (the no-UPI fallback) stays button-driven so an order is never placed
   * by accident.
   */
  const selectMethod = (k: Method) => {
    setMethod(k);
    if (k === "cod" || !upiReady || k === method) return;
    snapshotFirstOrder();
    handoff(k);
  };

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
    // reference store's Ordered* keys), then hand off to the chosen app.
    snapshotFirstOrder();
    handoff(method);
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
    // Same selected method and amount — restart the flow: spinner popup +
    // hand off to the same payment app again.
    handoff(method);
  };

  const cancel = () => {
    // Stay on the payment page — selected method and amount are untouched.
    setPopup(null);
    setPlacing(false);
    handedOff.current = false;
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

              <UpiRow k="gpay" label="G Pay" method={method} set={selectMethod} logo={<GPayLogo />} />
              <UpiRow k="phonepe" label="PhonePe" method={method} set={selectMethod}
                note={<span className="text-[11px] text-[red]">25% Cashback in 24 hour</span>}
                logo={<PhonePeLogo />} labelColor="green" />
              <UpiRow k="paytm" label="Paytm" method={method} set={selectMethod}
                note={<span className="text-[11px] text-[green]">20% Cashback in 24 hour</span>}
                logo={<PaytmLogo />} />
            </div>
          </>
        )}

        {/* COD is the fallback when no UPI ID is configured — the reference
            screen only ever shows the UPI list. */}
        {!upiReady && (
          <div className="px-4">
            <UpiRow k="cod" label="Cash on Delivery" method={method} set={selectMethod}
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
        {comboDiscount > 0 && (
          <div className="flex justify-between text-[14px] py-1.5 text-[#1ba672]">
            <span>Offers applied:</span>
            <span className="font-semibold">- {formatPrice(comboDiscount)}</span>
          </div>
        )}
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

      <PaymentPendingModal
        open={popup !== null}
        state={popup ?? "opening"}
        onTryAgain={tryAgain}
        onCancel={cancel}
      />
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
