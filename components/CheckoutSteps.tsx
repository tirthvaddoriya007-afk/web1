const STEPS = ["Cart", "Address", "Payment", "Summary"];
const BLUE = "#3f51d4";

export default function CheckoutSteps({ active }: { active: number }) {
  return (
    <div className="flex items-start px-4 pt-4 pb-3">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < active;
        const current = n === active;
        const filled = done || current;
        return (
          <div key={label} className="flex-1 flex flex-col items-center relative">
            {/* connector line to next step */}
            {n < STEPS.length && (
              <span
                className="absolute top-[13px] left-1/2 w-full h-[2px]"
                style={{ background: done ? BLUE : "#dcdce4" }}
              />
            )}
            {/* Reference: the CURRENT step is an outlined blue circle with a
                blue number — only completed steps get a filled blue disc. */}
            <span
              className="relative z-10 w-[26px] h-[26px] rounded-full grid place-items-center text-[12px] font-bold"
              style={{
                background: done ? BLUE : "#fff",
                color: done ? "#fff" : current ? BLUE : "#b6b6c2",
                border: `2px solid ${filled ? BLUE : "#dcdce4"}`,
              }}
            >
              {done ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5 9-11" />
                </svg>
              ) : (
                n
              )}
            </span>
            <span
              className="mt-1.5 text-[11px]"
              style={{ color: current ? "#333" : "#9b9b9b", fontWeight: current ? 700 : 400 }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
