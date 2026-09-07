"use client";

import { useEffect, useRef, useState } from "react";

/** Total countdown window. */
const TOTAL_SECONDS = 5 * 60;

const R = 52;
const C = 2 * Math.PI * R;

/**
 * Payment-progress popup shown while the customer is handed off to a UPI app.
 *
 * Mirrors the reference store exactly:
 *   • a 5-minute countdown ring;
 *   • at a RANDOM second between 5 and 10, shows "⚠️ Payment Failed. Try
 *     Again" + the refund note and a close button (this is a timer effect,
 *     not a real payment result — the UPI app never reports back);
 *   • at 0:00, shows "⏰ Session Expired. Please try again." and a close
 *     button.
 */
export default function PaymentPendingModal({
  open,
  onTryAgain,
}: {
  open: boolean;
  onTryAgain: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number>(0);
  const failureSecond = useRef<number>(0);

  // Pick the random failure second (5–10) once per open, like the reference.
  useEffect(() => {
    if (!open) return;
    failureSecond.current = Math.floor(Math.random() * 6) + 5; // 5 to 10
    startedAt.current = Date.now();
    setElapsed(0);
    const id = window.setInterval(() => {
      const secs = Math.floor((Date.now() - startedAt.current) / 1000);
      setElapsed(Math.min(secs, TOTAL_SECONDS));
    }, 250);
    return () => window.clearInterval(id);
  }, [open]);

  if (!open) return null;

  const remaining = Math.max(0, TOTAL_SECONDS - elapsed);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const failed = elapsed >= failureSecond.current;
  const expired = elapsed >= TOTAL_SECONDS;

  return (
    <div className="fixed inset-0 z-[100] bg-black/45 grid place-items-center px-6">
      <div className="bg-white rounded-2xl w-full max-w-[330px] px-6 py-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
        {/* Countdown ring — keeps spinning even after the timer hits 00:00 */}
        <div className="relative mx-auto w-[124px] h-[124px]">
          <svg viewBox="0 0 124 124" className="w-full h-full pay-spin">
            <circle cx="62" cy="62" r={R} fill="none" stroke="#eceff5" strokeWidth="8" />
            <circle
              cx="62"
              cy="62"
              r={R}
              fill="none"
              stroke="#3b7ff0"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${C * 0.25} ${C}`}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-[20px] font-semibold text-[#1a2024] tabular-nums">
            {mm}:{ss}
          </span>
        </div>

        {expired ? (
          <>
            <p className="mt-5 text-[15px] font-semibold text-[#1a2024]">
              ⏰ Session Expired. Please try again.
            </p>
            <button
              onClick={onTryAgain}
              className="mt-5 px-7 py-2.5 rounded-lg bg-[#3b7ff0] text-white text-[15px] font-semibold"
            >
              Close
            </button>
          </>
        ) : failed ? (
          <>
            <p className="mt-5 text-[15px] font-semibold text-[#1a2024]">
              ⚠️ Payment Failed. Try Again
            </p>
            <p className="mt-2 text-[13px] leading-snug text-[#e11900]">
              💡 If the amount has been deducted, it will be refunded within 24 hours.
            </p>
            <button
              onClick={onTryAgain}
              className="mt-5 px-7 py-2.5 rounded-lg bg-[#3b7ff0] text-white text-[15px] font-semibold"
            >
              Try Again
            </button>
          </>
        ) : (
          <p className="mt-5 text-[15px] text-[#4a4a55]">Processing Payment...</p>
        )}
      </div>
    </div>
  );
}
