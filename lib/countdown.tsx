"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface Time {
  h: number;
  m: number;
  s: number;
}

const Ctx = createContext<Time>({ h: 1, m: 29, s: 56 });

// One global countdown shared by the Daily Deals header and every product card,
// so they all tick together (matching the reference site's single timer).
export function CountdownProvider({ children }: { children: React.ReactNode }) {
  const [t, setT] = useState<Time>({ h: 1, m: 29, s: 56 });

  useEffect(() => {
    const h = parseInt(localStorage.getItem("timerHours") || "") || 1;
    const m = parseInt(localStorage.getItem("timerMinutes") || "");
    const s = parseInt(localStorage.getItem("timerSeconds") || "");
    let cur: Time = {
      h,
      m: Number.isNaN(m) ? 29 : m,
      s: Number.isNaN(s) ? 56 : s,
    };
    setT(cur);
    const id = setInterval(() => {
      if (cur.s > 0) cur = { ...cur, s: cur.s - 1 };
      else if (cur.m > 0) cur = { ...cur, m: cur.m - 1, s: 59 };
      else if (cur.h > 0) cur = { h: cur.h - 1, m: 59, s: 59 };
      else {
        // reset for a fresh "deal" cycle
        cur = { h: 1, m: 29, s: 56 };
      }
      localStorage.setItem("timerHours", String(cur.h));
      localStorage.setItem("timerMinutes", String(cur.m));
      localStorage.setItem("timerSeconds", String(cur.s));
      setT({ ...cur });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <Ctx.Provider value={t}>{children}</Ctx.Provider>;
}

export function useCountdown() {
  return useContext(Ctx);
}

export function fmtCountdown(t: Time) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(t.h)}h : ${p(t.m)}m : ${p(t.s)}s`;
}
