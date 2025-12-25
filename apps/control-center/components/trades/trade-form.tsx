"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orchestratorClient } from "@/lib/api";
import { TradeRecommendationResponse } from "@/lib/types";
import { useTradeHistory, createHistoryEntry } from "@/lib/hooks/use-trade-history";

// Zod validation schema matching the API types
const tradeFormSchema = z.object({
  // Actor fields
  user_id: z.string().min(1, "User ID is required"),
  desk: z.string().min(1, "Desk is required"),
  role: z.enum(["trader", "risk_manager", "compliance", "ops"]),

  // Trade fields
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
  side: z.enum(["buy", "sell"]),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  order_type: z.enum(["market", "limit"]),
  limit_price: z.coerce.number().positive().optional(),

  // Context fields
  intent: z.string().min(10, "Please provide a detailed intent (min 10 characters)"),
  trace_id: z.string().optional(),
});

type TradeFormData = z.infer<typeof tradeFormSchema>;

interface TradeFormProps {
  onSuccess?: (response: TradeRecommendationResponse) => void;
}

export function TradeForm({ onSuccess }: TradeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addTrade } = useTradeHistory();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      role: "trader",
      side: "buy",
      order_type: "market",
      desk: "equities",
    },
  });

  const orderType = watch("order_type");

  const onSubmit = async (data: TradeFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Generate request ID
      const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Build the request payload
      const request = {
        request_id: requestId,
        actor: {
          user_id: data.user_id,
          desk: data.desk,
          role: data.role,
        },
        trade: {
          symbol: data.symbol,
          side: data.side,
          quantity: data.quantity,
          order_type: data.order_type,
          ...(data.order_type === "limit" && data.limit_price
            ? { limit_price: data.limit_price }
            : {}),
        },
        intent: data.intent,
        constraints: {},
        as_of: new Date().toISOString(),
      };

      // Submit to orchestrator
      const response = await orchestratorClient.submitTradeRecommendation(
        request,
        data.trace_id
      );

      // Save to trade history
      const historyEntry = createHistoryEntry(request, response, data.trace_id);
      addTrade(historyEntry);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response);
      }

      // Reset form on success
      reset();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit trade recommendation"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Actor Information */}
      <Card>
        <CardHeader>
          <CardTitle>Actor Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="user_id">
                User ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="user_id"
                placeholder="trader_001"
                {...register("user_id")}
              />
              {errors.user_id && (
                <p className="text-sm text-destructive">{errors.user_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="desk">
                Desk <span className="text-destructive">*</span>
              </Label>
              <Select id="desk" {...register("desk")}>
                <option value="equities">Equities</option>
                <option value="fx">FX</option>
                <option value="fixed_income">Fixed Income</option>
                <option value="commodities">Commodities</option>
                <option value="derivatives">Derivatives</option>
              </Select>
              {errors.desk && (
                <p className="text-sm text-destructive">{errors.desk.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select id="role" {...register("role")}>
                <option value="trader">Trader</option>
                <option value="risk_manager">Risk Manager</option>
                <option value="compliance">Compliance</option>
                <option value="ops">Operations</option>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade Details */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="symbol">
                Symbol <span className="text-destructive">*</span>
              </Label>
              <Input
                id="symbol"
                placeholder="AAPL"
                {...register("symbol")}
              />
              {errors.symbol && (
                <p className="text-sm text-destructive">{errors.symbol.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="side">
                Side <span className="text-destructive">*</span>
              </Label>
              <Select id="side" {...register("side")}>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </Select>
              {errors.side && (
                <p className="text-sm text-destructive">{errors.side.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="1000"
                {...register("quantity")}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="order_type">
                Order Type <span className="text-destructive">*</span>
              </Label>
              <Select id="order_type" {...register("order_type")}>
                <option value="market">Market</option>
                <option value="limit">Limit</option>
              </Select>
              {errors.order_type && (
                <p className="text-sm text-destructive">
                  {errors.order_type.message}
                </p>
              )}
            </div>

            {orderType === "limit" && (
              <div className="space-y-2">
                <Label htmlFor="limit_price">
                  Limit Price <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="limit_price"
                  type="number"
                  step="0.01"
                  placeholder="150.50"
                  {...register("limit_price")}
                />
                {errors.limit_price && (
                  <p className="text-sm text-destructive">
                    {errors.limit_price.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Context */}
      <Card>
        <CardHeader>
          <CardTitle>Context</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="intent">
              Intent / Rationale <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="intent"
              placeholder="Portfolio rebalancing to reduce exposure to tech sector..."
              rows={4}
              {...register("intent")}
            />
            {errors.intent && (
              <p className="text-sm text-destructive">{errors.intent.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="trace_id">Trace ID (Optional)</Label>
            <Input
              id="trace_id"
              placeholder="Auto-generated if not provided"
              {...register("trace_id")}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to auto-generate
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Trade Recommendation"}
        </Button>
      </div>
    </form>
  );
}
