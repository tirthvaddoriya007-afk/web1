"use client";

export type PaymentPopupState = "opening" | "incomplete";

/**
 * Payment hand-off popup — replaces the old countdown/failure sheet.
 *
 * Two states, styled like the reference "Payment not completed?" card
 * (white rounded card, dimmed backdrop, brand purple #9f2089 primary):
 *   • "opening"    — fast circular spinner with two lines: "Opening payment
 *                    app..." and the "please wait" line below it. Shown the
 *                    instant Pay Now fires the UPI deep link.
 *   • "incomplete" — "Payment not completed?" sheet with Try Again (re-fires
 *                    the hand-off to the same app) and Cancel (back to the
 *                    payment page).
 */
export default function PaymentPendingModal({
  open,
  state,
  onTryAgain,
  onCancel,
}: {
  open: boolean;
  state: PaymentPopupState;
  onTryAgain: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/45 grid place-items-center px-6">
      <div className="bg-white rounded-2xl w-full max-w-[330px] px-6 py-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
        {state === "opening" ? (
          <>
            {/* Fast circular loader in brand purple. */}
            <svg viewBox="0 0 76 76" className="mx-auto w-[76px] h-[76px] pay-spin">
              <circle cx="38" cy="38" r="32" fill="none" stroke="#f3e6f1" strokeWidth="7" />
              <circle
                cx="38"
                cy="38"
                r="32"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="72 140"
              />
            </svg>
            <p className="mt-6 text-[16px] font-semibold text-[#1a2024]">
              Opening payment app...
            </p>
            <p className="mt-2 text-[13px] leading-snug text-[#6b6b78]">
              Please wait while we are opening your selected payment app
            </p>
          </>
        ) : (
          <>
            {/* Soft pink circle with a dark pink exclamation mark. */}
            <div className="mx-auto w-[64px] h-[64px] rounded-full bg-[#fdecec] grid place-items-center">
              <span className="text-[30px] leading-none font-bold text-[#d9376e]">!</span>
            </div>
            <p className="mt-6 text-[17px] font-semibold text-[#1a2024]">
              Payment not completed?
            </p>
            <p className="mt-2 text-[13px] leading-snug text-[#6b6b78]">
              You can safely open the same payment app again and try once more.
            </p>
            <button
              onClick={onTryAgain}
              className="mt-6 w-full py-3 rounded-lg text-white text-[15px] font-semibold"
              style={{ background: "var(--brand)" }}
            >
              Try Again
            </button>
            <button
              onClick={onCancel}
              className="mt-3 w-full py-3 rounded-lg bg-white text-[#1a2024] text-[15px] font-semibold border border-[#c4c4cf]"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
