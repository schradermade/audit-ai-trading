/**
 * API client for Risk MCP service
 */

import {
  RiskEvaluationRequest,
  RiskEvaluationResponse,
} from "../types";

const BASE_URL = "/api/risk";

export const riskClient = {
  /**
   * Get health status of risk-mcp service
   */
  async getHealth() {
    const response = await fetch(`${BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Evaluate a trade against risk policies
   */
  async evaluateTrade(
    request: RiskEvaluationRequest
  ): Promise<RiskEvaluationResponse> {
    const response = await fetch(`${BASE_URL}/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.detail || `Request failed: ${response.statusText}`
      );
    }

    return response.json();
  },
};
