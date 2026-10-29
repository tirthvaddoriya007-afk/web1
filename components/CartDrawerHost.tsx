"use client";

import { useStore } from "@/lib/store";
import CartDrawer from "./CartDrawer";

// Renders the cart drawer once for the whole app, driven by shared store state
// so both the header cart icon and "Add to Cart" can open it.
export default function CartDrawerHost() {
  const { cartOpen, closeCart } = useStore();
  if (!cartOpen) return null;
  return <CartDrawer onClose={closeCart} />;
}
