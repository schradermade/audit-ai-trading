/**
 * Audit types matching shared/schemas/audit.py
 */

export enum AuditEventType {
  REQUEST_RECEIVED = "request_received",
  DECISION_MADE = "decision_made",
  DECISION_FORWARDED = "decision_forwarded",
  ADVISORY_GENERATED = "advisory_generated",
  ADVISORY_FAILED = "advisory_failed",
  ERROR = "error",
}

export interface AuditEvent {
  audit_id: string;
  trace_id: string;
  event_type: AuditEventType;
  timestamp: string; // ISO 8601 datetime string
  payload: Record<string, any>;
  prev_hash?: string;
  event_hash?: string;
}

export interface AuditWriteRequest {
  trace_id: string;
  event_type: AuditEventType;
  timestamp: string;
  payload: Record<string, any>;
}

export interface AuditWriteResponse {
  audit_id: string;
  event_hash: string;
  prev_hash?: string;
}
