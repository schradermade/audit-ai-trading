"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TradeForm } from "@/components/trades/trade-form";
import { TradeRecommendationResult } from "@/components/trades/trade-recommendation-result";
import { TradeRecommendationResponse } from "@/lib/types";

export default function NewTradePage() {
  const [recommendation, setRecommendation] =
    useState<TradeRecommendationResponse | null>(null);

  const handleSuccess = (response: TradeRecommendationResponse) => {
    setRecommendation(response);
    // Scroll to results
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setRecommendation(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/trades">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Trades
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            New Trade Recommendation
          </h1>
          <p className="text-muted-foreground">
            Submit a trade for risk evaluation and compliance review
          </p>
        </div>
      </div>

      {/* Results (if available) */}
      {recommendation && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Results</h2>
            <Button variant="outline" onClick={handleReset}>
              Submit Another Trade
            </Button>
          </div>
          <TradeRecommendationResult response={recommendation} />
        </div>
      )}

      {/* Form (hidden when results are shown) */}
      {!recommendation && <TradeForm onSuccess={handleSuccess} />}
    </div>
  );
}
