/**
 * API client for Orchestrator service
 */

import {
  TradeRecommendationRequest,
  TradeRecommendationResponse,
} from '../types';

const BASE_URL = '/api/orchestrator';

export const orchestratorClient = {
  /**
   * Get health status of orchestrator service
   */
  async getHealth() {
    const response = await fetch(`${BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Submit a trade recommendation request
   */
  async submitTradeRecommendation(
    request: TradeRecommendationRequest,
    traceId?: string
  ): Promise<TradeRecommendationResponse> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (traceId) {
      headers['X-Trace-Id'] = traceId;
    }

    const response = await fetch(`${BASE_URL}/trade/recommendation`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Request failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Submit a trade decision request (with Claude advisory)
   */
  async submitTradeDecision(data: {
    trace_id: string;
    actor: any;
    trade: any;
    as_of: string;
  }) {
    const response = await fetch(`${BASE_URL}/trade/decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Request failed: ${response.statusText}`);
    }

    return response.json();
  },
};
