import { Suspense } from "react";
import { StoreProvider } from "@/lib/store";
import { CountdownProvider } from "@/lib/countdown";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import CartDrawerHost from "@/components/CartDrawerHost";
import PageViewTracker from "@/components/PageViewTracker";

// Storefront chrome. Admin routes live outside this group and skip it.
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <CountdownProvider>
        <div className="app-shell">
          <Header />
          <main className="app-main">{children}</main>
          <BottomNav />
          <CartDrawerHost />
          {/* Invisible analytics beacon — see components/PageViewTracker. */}
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>
        </div>
      </CountdownProvider>
    </StoreProvider>
  );
}
