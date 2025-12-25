"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TradeHistoryTable } from "@/components/trades/trade-history-table";
import { useTradeHistory } from "@/lib/hooks/use-trade-history";

export default function TradesPage() {
  const { trades } = useTradeHistory();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trades</h1>
          <p className="text-muted-foreground">
            View and submit trade recommendations
          </p>
        </div>
        <Link href="/trades/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Trade
          </Button>
        </Link>
      </div>

      {trades.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground mb-4">No trades yet</p>
          <Link href="/trades/new">
            <Button variant="outline">Submit Your First Trade</Button>
          </Link>
        </div>
      ) : (
        <TradeHistoryTable trades={trades} />
      )}
    </div>
  );
}
