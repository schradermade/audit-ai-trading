/**
 * Health check response types
 */

export interface HealthResponse {
  service: string;
  version: string;
  status: string;
  env: string;
  hash_chain?: boolean; // Only for audit-mcp
}

export interface ServiceHealthStatus {
  orchestrator: HealthResponse | null;
  auditMcp: HealthResponse | null;
  riskMcp: HealthResponse | null;
  lastChecked: string;
}
