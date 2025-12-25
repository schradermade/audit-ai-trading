/**
 * API client for Audit MCP service
 */

import {
  AuditEvent,
  AuditWriteRequest,
  AuditWriteResponse,
} from "../types";

const BASE_URL = "/api/audit";

export const auditClient = {
  /**
   * Get health status of audit-mcp service
   */
  async getHealth() {
    const response = await fetch(`${BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Log an audit event
   */
  async logEvent(
    request: AuditWriteRequest
  ): Promise<AuditWriteResponse> {
    const response = await fetch(`${BASE_URL}/audit/log`, {
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

  /**
   * Get audit events by trace ID
   */
  async getEventsByTrace(traceId: string): Promise<AuditEvent[]> {
    const response = await fetch(
      `${BASE_URL}/audit/events?trace_id=${encodeURIComponent(traceId)}`
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.detail || `Request failed: ${response.statusText}`
      );
    }

    return response.json();
  },
};
