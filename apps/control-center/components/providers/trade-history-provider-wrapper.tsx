"use client";

import { TradeHistoryProvider } from "@/lib/hooks/use-trade-history";

export function TradeHistoryProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TradeHistoryProvider>{children}</TradeHistoryProvider>;
}
