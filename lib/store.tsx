"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { CartItem, Product, Address, Order } from "./types";

const CART_KEY = "products"; // same key name the reference app used
const ADDR_KEY = "address";
const ORDERS_KEY = "orders";

interface StoreCtx {
  items: CartItem[];
  count: number;
  total: number;
  mrpTotal: number;
  promoDiscount: number;
  freeCount: number;
  payable: number;
  addItem: (p: Product, qty?: number) => void;
  removeItem: (hash: string) => void;
  setQty: (hash: string, qty: number) => void;
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

  const addItem = useCallback((p: Product, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.hash === p.hash);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [
        ...prev,
        { hash: p.hash, name: p.name, price: p.price, mrp: p.mrp, image: p.image, qty },
      ];
    });
  }, []);

  const removeItem = useCallback((hash: string) => {
    setItems((prev) => prev.filter((i) => i.hash !== hash));
  }, []);

  const setQty = useCallback((hash: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.hash === hash ? { ...i, qty: Math.max(0, qty) } : i))
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
      const u: number[] = [];
      items.forEach((i) => { for (let k = 0; k < i.qty; k++) u.push(i.price); });
      u.sort((a, b) => b - a);
      let promo = 0;
      for (let i = 2; i < u.length; i += 3) promo += u[i];
      const total = gross - promo;
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

  // Buy 2 Get 1 Free: for every group of 3 units, the cheapest one is free.
  const units: number[] = [];
  items.forEach((i) => { for (let k = 0; k < i.qty; k++) units.push(i.price); });
  units.sort((a, b) => b - a); // most expensive first
  let promoDiscount = 0;
  let freeCount = 0;
  for (let i = 2; i < units.length; i += 3) { promoDiscount += units[i]; freeCount++; }
  const payable = total - promoDiscount;

  return (
    <Ctx.Provider
      value={{
        items, count, total, mrpTotal, promoDiscount, freeCount, payable,
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
