"use client";

import { useCountdown, fmtCountdown } from "@/lib/countdown";
import { brand } from "@/lib/brand";
import TimerIcon from "./TimerIcon";

// Reference metrics: title 18px "Mier book" (400) / #616173 / 23.5px line-box /
// 4px right margin, pill 20px tall / #FFE8CD / 0 8px padding, timer text 13px
// demi #9F2089. Bar sits tight to the grid.
export default function DealsBar() {
  const t = useCountdown();

  return (
    <div className="flex items-center justify-center px-2 py-2" >
      {/* Heading — bold, eye-catching "Mega Sales Deals" */}
      <p className="deals-title">
        <span className="deals-title-main"style={{ height: "30px" }}>
          Mega Sales Deals
          {/* deal bolt — the reference's own deal_svg path, 19×22, #E11900 */}
          <svg width="19" height="22" viewBox="0 0 19 22" fill="none" aria-hidden>
            <path
              d="M5.198.795a.73.73 0 0 0-.699.522l-2.621 8.858a1.458 1.458 0 0 0 1.568 1.862l6.018-.708L6.835 19.8a1.089 1.089 0 0 0 1.944.929l8.174-12.206c.698-1.043-.16-2.423-1.405-2.257l-5.033.671 1.724-5.183a.73.73 0 0 0-.692-.96H5.198Z"
              fill="#E11900"
            />
          </svg>
        </span>
      </p>
      {/* <div className="deals-timer">
        <TimerIcon size={16} />
        <span>{fmtCountdown(t)}</span>
      </div> */}
    </div>
  );
}
