"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { CartItem, CartOffer, Product, Address, Order } from "./types";

const CART_KEY = "products"; // same key name the reference app used
const ADDR_KEY = "address";
const ORDERS_KEY = "orders";

interface StoreCtx {
  items: CartItem[];
  count: number;
  total: number;
  mrpTotal: number;
  promoDiscount: number;
  offerDiscount: number;
  freeCount: number;
  payable: number;
  addItem: (p: Product, qty?: number, size?: string, offer?: CartOffer | null) => void;
  removeItem: (hash: string, size?: string) => void;
  setQty: (hash: string, size: string | undefined, qty: number) => void;
  clear: () => void;
  address: Address | null;
  saveAddress: (a: Address) => void;
  orders: Order[];
  placeOrder: (paymentMode: string) => Order | null;
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

/** Effective unit price after a PDP offer chip (discount % off every unit). */
export function offerUnitPrice(price: number, offer?: CartOffer | null): number {
  if (!offer) return price;
  return round2(price * (1 - offer.discountPct / 100));
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<Address | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    setItems(read<CartItem[]>(CART_KEY, []));
    setAddress(read<Address | null>(ADDR_KEY, null));
    setOrders(read<Order[]>(ORDERS_KEY, []));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) write(CART_KEY, items);
  }, [items, ready]);

  const addItem = useCallback((p: Product, qty = 1, size?: string, offer?: CartOffer | null) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.hash === p.hash && (i.size ?? "") === (size ?? ""));
      if (idx >= 0) {
        const next = [...prev];
        const cur = next[idx];
        if (offer) {
          // Same offer re-tapped → stack more units. Different offer (or the
          // line had none) → the line becomes the newly chosen combo.
          if (cur.offer?.qty === offer.qty && cur.offer?.discountPct === offer.discountPct) {
            next[idx] = { ...cur, qty: cur.qty + qty };
          } else {
            next[idx] = { ...cur, qty, offer };
          }
        } else {
          // Regular single add — never strips an offer the line already has.
          next[idx] = { ...cur, qty: cur.qty + qty };
        }
        return next;
      }
      return [
        ...prev,
        { hash: p.hash, name: p.name, price: p.price, mrp: p.mrp, image: p.image, qty, size, offer: offer ?? null },
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

  const placeOrder = useCallback(
    (paymentMode: string): Order | null => {
      if (items.length === 0 || !address) return null;
      const gross = items.reduce((s, i) => s + i.price * i.qty, 0);
      const offerDisc = items.reduce(
        (s, i) => s + (i.offer ? (i.price - offerUnitPrice(i.price, i.offer)) * i.qty : 0),
        0
      );
      // Buy 2 Get 1 Free: only regular lines join the pool — combo-offer
      // lines are already discounted and never stack with the freebie.
      const u: number[] = [];
      items.forEach((i) => {
        if (!i.offer) for (let k = 0; k < i.qty; k++) u.push(i.price);
      });
      u.sort((a, b) => b - a);
      let promo = 0;
      for (let i = 2; i < u.length; i += 3) promo += u[i];
      const total = round2(gross - offerDisc - promo);
      const order: Order = {
        id: "OD" + Date.now().toString().slice(-10),
        items: [...items],
        total,
        address,
        paymentMode,
        status: "Confirmed",
        placedAt: new Date().toISOString(),
      };
      const next = [order, ...orders];
      setOrders(next);
      write(ORDERS_KEY, next);
      setItems([]);
      return order;
    },
    [items, address, orders]
  );

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const mrpTotal = items.reduce((s, i) => s + i.mrp * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const offerDiscount = items.reduce(
    (s, i) => s + (i.offer ? (i.price - offerUnitPrice(i.price, i.offer)) * i.qty : 0),
    0
  );

  // Buy 2 Get 1 Free: for every group of 3 units, the cheapest one is free.
  // Lines bought under a PDP combo offer are excluded (already discounted).
  const units: number[] = [];
  items.forEach((i) => { if (!i.offer) for (let k = 0; k < i.qty; k++) units.push(i.price); });
  units.sort((a, b) => b - a); // most expensive first
  let promoDiscount = 0;
  let freeCount = 0;
  for (let i = 2; i < units.length; i += 3) { promoDiscount += units[i]; freeCount++; }
  const payable = round2(total - offerDiscount - promoDiscount);

  return (
    <Ctx.Provider
      value={{
        items, count, total, mrpTotal, promoDiscount, offerDiscount, freeCount, payable,
        addItem, removeItem, setQty, clear,
        address, saveAddress, orders, placeOrder, ready,
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
