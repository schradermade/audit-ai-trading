"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TradeRecommendationResponse } from "@/lib/types";

interface TradeHistoryEntry {
  request_id: string;
  trace_id?: string;
  timestamp: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  user_id: string;
  desk: string;
  recommendation?: "proceed" | "deny" | "modify" | "escalate";
  compliance_status?: "pass" | "fail" | "needs_review";
  audit_id?: string;
}

interface TradeHistoryContextType {
  trades: TradeHistoryEntry[];
  addTrade: (trade: TradeHistoryEntry) => void;
  clearHistory: () => void;
}

const TradeHistoryContext = createContext<TradeHistoryContextType | undefined>(
  undefined
);

const STORAGE_KEY = "audit-ai-trading-history";

export function TradeHistoryProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<TradeHistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTrades(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load trade history:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever trades change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
      } catch (error) {
        console.error("Failed to save trade history:", error);
      }
    }
  }, [trades, isLoaded]);

  const addTrade = (trade: TradeHistoryEntry) => {
    setTrades((prev) => [trade, ...prev]);
  };

  const clearHistory = () => {
    setTrades([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <TradeHistoryContext.Provider value={{ trades, addTrade, clearHistory }}>
      {children}
    </TradeHistoryContext.Provider>
  );
}

export function useTradeHistory() {
  const context = useContext(TradeHistoryContext);
  if (!context) {
    throw new Error("useTradeHistory must be used within TradeHistoryProvider");
  }
  return context;
}

// Helper to convert API response to history entry
export function createHistoryEntry(
  request: any,
  response: TradeRecommendationResponse,
  traceId?: string
): TradeHistoryEntry {
  return {
    request_id: request.request_id,
    trace_id: traceId,
    timestamp: request.as_of || new Date().toISOString(),
    symbol: request.trade.symbol,
    side: request.trade.side,
    quantity: request.trade.quantity,
    user_id: request.actor.user_id,
    desk: request.actor.desk,
    recommendation: response.recommendation,
    compliance_status: response.compliance.status,
    audit_id: response.audit_id,
  };
}
