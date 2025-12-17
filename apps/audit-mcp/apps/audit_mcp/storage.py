from __future__ import annotations

import sqlite3
from pathlib import Path
from datetime import datetime
from typing import Optional
import json
import hashlib

from shared.schemas.audit import AuditEventType, AuditWriteRequest, AuditWriteResponse, AuditEvent

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS audit_events (
  audit_id TEXT PRIMARY KEY,
  trace_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  prev_hash TEXT,
  event_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_trace ON audit_events(trace_id);
"""

def _hash_event(trace_id: str, event_type: str, timestamp: str, payload_json: str, prev_hash: Optional[str]) -> str:
    m = hashlib.sha256()
    m.update(trace_id.encode("utf-8"))
    m.update(event_type.encode("utf-8"))
    m.update(timestamp.encode("utf-8"))
    m.update(payload_json.encode("utf-8"))
    if prev_hash:
        m.update(prev_hash.encode("utf-8"))
    return m.hexdigest()

class AuditStore:
    def __init__(self, db_path: str, hash_chain: bool = True):
        self.db_path = db_path
        self.hash_chain = hash_chain
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._conn() as conn:
            conn.executescript(SCHEMA_SQL)
            conn.commit()

    def _get_prev_hash(self, trace_id: str) -> Optional[str]:
        if not self.hash_chain:
            return None
        with self._conn() as conn:
            row = conn.execute(
                "SELECT event_hash FROM audit_events WHERE trace_id = ? ORDER BY timestamp DESC LIMIT 1",
                (trace_id,),
            ).fetchone()
            return row["event_hash"] if row else None

    def write(self, req: AuditWriteRequest) -> AuditWriteResponse:
        audit_id = f"AUD-{hashlib.md5((req.trace_id + req.timestamp.isoformat()).encode()).hexdigest()[:12]}"
        payload_json = json.dumps(req.payload, separators=(",", ":"), sort_keys=True)
        ts = req.timestamp.isoformat()

        prev_hash = self._get_prev_hash(req.trace_id)
        event_hash = _hash_event(req.trace_id, req.event_type.value, ts, payload_json, prev_hash)

        with self._conn() as conn:
            conn.execute(
                """
                INSERT INTO audit_events(audit_id, trace_id, event_type, timestamp, payload_json, prev_hash, event_hash)
                VALUES(?,?,?,?,?,?,?)
                """,
                (audit_id, req.trace_id, req.event_type.value, ts, payload_json, prev_hash, event_hash),
            )
            conn.commit()

        return AuditWriteResponse(audit_id=audit_id, event_hash=event_hash, prev_hash=prev_hash)

    def list_by_trace(self, trace_id: str) -> list[AuditEvent]:
        with self._conn() as conn:
            rows = conn.execute(
                "SELECT * FROM audit_events WHERE trace_id = ? ORDER BY timestamp ASC",
                (trace_id,),
            ).fetchall()

        events: list[AuditEvent] = []
        for r in rows:
            events.append(
                AuditEvent(
                    audit_id=r["audit_id"],
                    trace_id=r["trace_id"],
                    event_type=AuditEventType(r["event_type"]),
                    timestamp=datetime.fromisoformat(r["timestamp"]),
                    payload=json.loads(r["payload_json"]),
                    prev_hash=r["prev_hash"],
                    event_hash=r["event_hash"],
                )
            )
        return events
