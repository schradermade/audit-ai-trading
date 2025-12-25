/**
 * Trade types matching shared/schemas/trade.py
 */

import { Actor } from "./common";

export type OrderType = "market" | "limit";
export type Side = "buy" | "sell";
export type Recommendation = "proceed" | "modify" | "deny" | "escalate";
export type ComplianceStatus = "pass" | "fail" | "needs_review";
export type RiskSeverity = "low" | "medium" | "high";

export interface TradeIntent {
  symbol: string;
  side: Side;
  quantity: number;
  order_type: OrderType;
  limit_price?: number;
}

export interface TradeRecommendationRequest {
  request_id: string;
  actor: Actor;
  trade: TradeIntent;
  intent: string;
  constraints: Record<string, any>;
  as_of: string; // ISO 8601 datetime string
}

export interface RiskFlag {
  type: string;
  severity: RiskSeverity;
  evidence_ref: string;
}

export interface ComplianceResult {
  status: ComplianceStatus;
  policy_refs: string[];
  evidence_refs: string[];
}

export interface TradeRecommendationResponse {
  recommendation: Recommendation;
  modified_trade: TradeIntent | null;
  rationale: string;
  risk_flags: RiskFlag[];
  compliance: ComplianceResult;
  confidence: number; // 0.0 to 1.0
  next_steps: string[];
  audit_id: string;
}

// Risk MCP types
export interface RiskEvaluationRequest {
  trace_id: string;
  actor: Actor;
  trade: TradeIntent;
  as_of: string;
}

export interface RiskEvaluationResponse {
  result: "pass" | "reject";
  policy_id?: string;
  policy_version?: string;
  reason?: string;
}
