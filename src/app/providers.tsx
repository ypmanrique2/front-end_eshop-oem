"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/lib/cart-context";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchInterval={60 * 5} refetchOnWindowFocus={false}>
      <CartProvider>
        {children}
      </CartProvider>
    </SessionProvider>
  );
}