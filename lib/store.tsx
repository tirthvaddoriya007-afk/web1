"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { CartItem, Product, Address, Order } from "./types";

const CART_KEY = "products"; // same key name the reference app used
const ADDR_KEY = "address";

interface StoreCtx {
  items: CartItem[];
  count: number;
  total: number;
  mrpTotal: number;
  comboDiscount: number;
  payable: number;
  addItem: (p: Product, qty?: number, size?: string) => void;
  removeItem: (hash: string, size?: string) => void;
  setQty: (hash: string, size: string | undefined, qty: number) => void;
  clear: () => void;
  address: Address | null;
  saveAddress: (a: Address) => void;
  ready: boolean;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Whole-cart combo ladder: total units across ALL products decide one flat %
 * off the cart total — 1 → 0%, 2 → 10%, 3 → 20%, 4+ → 30% (capped).
 */
export function tierPct(count: number): number {
  if (count >= 4) return 30;
  if (count === 3) return 20;
  if (count === 2) return 10;
  return 0;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<Address | null>(null);
  const [ready, setReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    setItems(read<CartItem[]>(CART_KEY, []));
    setAddress(read<Address | null>(ADDR_KEY, null));
    try {
      window.localStorage.removeItem("orders");
    } catch (error) {
      console.error("Could not remove legacy local order data:", error);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) write(CART_KEY, items);
  }, [items, ready]);

  const addItem = useCallback((p: Product, qty = 1, size?: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.hash === p.hash && (i.size ?? "") === (size ?? ""));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [
        ...prev,
        { hash: p.hash, name: p.name, price: p.price, mrp: p.mrp, image: p.image, qty, size },
      ];
    });
  }, []);

  const removeItem = useCallback((hash: string, size?: string) => {
    setItems((prev) => prev.filter((i) => !(i.hash === hash && (i.size ?? "") === (size ?? ""))));
  }, []);

  const setQty = useCallback((hash: string, size: string | undefined, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.hash === hash && (i.size ?? "") === (size ?? "") ? { ...i, qty: Math.max(0, qty) } : i
        )
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const saveAddress = useCallback((a: Address) => {
    setAddress(a);
    write(ADDR_KEY, a);
  }, []);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const mrpTotal = items.reduce((s, i) => s + i.mrp * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  // Whole-cart combo: one flat % off the cart total based on total units.
  const comboDiscount = round2((total * tierPct(count)) / 100);

  const payable = round2(total - comboDiscount);

  return (
    <Ctx.Provider
      value={{
        items, count, total, mrpTotal, comboDiscount, payable,
        addItem, removeItem, setQty, clear,
        address, saveAddress, ready,
        cartOpen,
        openCart: () => setCartOpen(true),
        closeCart: () => setCartOpen(false),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
