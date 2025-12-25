/**
 * Common types matching shared/schemas/common.py
 */

export type ActorRole = "trader" | "risk_manager" | "compliance" | "ops";

export interface Actor {
  user_id: string;
  desk: string;
  role: ActorRole;
}
