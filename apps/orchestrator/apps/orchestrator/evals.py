from __future__ import annotations

from typing import Any


REQUIRED_FIELDS: dict[str, type] = {
    "recommendation": str,
    "rationale": str,
    "risk_flags": list,
    "confidence": (int, float),
    "suggested_next_steps": list,
    "model": str,
    "model_version": str,
}

ALLOWED_RECOMMENDATIONS = {"proceed", "caution", "reject"}


def run_advisory_evals(advisory: dict[str, Any], risk_result: dict[str, Any]) -> dict[str, Any]:
    """
    Returns a structured eval report. Never raises.
    """
    checks: dict[str, dict[str, Any]] = {}

    try:
        checks["schema"] = _check_schema(advisory)
        checks["recommendation"] = _check_recommendation(advisory)
        checks["confidence"] = _check_confidence(advisory)
        checks["length_limits"] = _check_length_limits(advisory)
        checks["no_override"] = _check_no_policy_override(advisory, risk_result)
        checks["hallucination"] = _check_no_fabricated_policy_refs(advisory, risk_result)

        passed = all(v["status"] == "pass" for v in checks.values())

        return {
            "passed": passed,
            "checks": checks,
        }

    except Exception as e:
        # Fail safe: if eval code itself breaks, report it (do NOT crash request).
        return {
            "passed": False,
            "checks": checks,
            "error": f"eval_runner_exception: {type(e).__name__}: {e}",
        }


def _pass(details: dict[str, Any] | None = None) -> dict[str, Any]:
    return {"status": "pass", "details": details or {}}


def _fail(reason: str, details: dict[str, Any] | None = None) -> dict[str, Any]:
    return {"status": "fail", "reason": reason, "details": details or {}}


def _check_schema(advisory: dict[str, Any]) -> dict[str, Any]:
    missing = []
    type_errors = []

    for field, expected_type in REQUIRED_FIELDS.items():
        if field not in advisory:
            missing.append(field)
            continue

        val = advisory[field]
        if isinstance(expected_type, tuple):
            ok = isinstance(val, expected_type)
        else:
            ok = isinstance(val, expected_type)

        if not ok:
            type_errors.append({"field": field, "expected": str(expected_type), "actual": type(val).__name__})

    if missing:
        return _fail("missing_required_fields", {"missing": missing})

    if type_errors:
        return _fail("type_mismatch", {"errors": type_errors})

    # Ensure list fields contain strings (soft requirement but valuable)
    for lf in ("risk_flags", "suggested_next_steps"):
        if any(not isinstance(x, str) for x in advisory.get(lf, [])):
            return _fail("list_items_must_be_strings", {"field": lf})

    return _pass()


def _check_recommendation(advisory: dict[str, Any]) -> dict[str, Any]:
    rec = advisory.get("recommendation")
    if rec not in ALLOWED_RECOMMENDATIONS:
        return _fail("invalid_recommendation", {"allowed": sorted(ALLOWED_RECOMMENDATIONS), "got": rec})
    return _pass()


def _check_confidence(advisory: dict[str, Any]) -> dict[str, Any]:
    conf = advisory.get("confidence")
    try:
        conf_f = float(conf)
    except Exception:
        return _fail("confidence_not_numeric", {"got": conf})

    if not (0.0 <= conf_f <= 1.0):
        return _fail("confidence_out_of_range", {"got": conf_f})
    return _pass()


def _check_length_limits(advisory: dict[str, Any]) -> dict[str, Any]:
    rationale = advisory.get("rationale", "")
    if len(rationale) > 500:
        return _fail("rationale_too_long", {"max": 500, "got": len(rationale)})
    if len(advisory.get("risk_flags", [])) > 25:
        return _fail("too_many_risk_flags", {"max": 25, "got": len(advisory.get("risk_flags", []))})
    if len(advisory.get("suggested_next_steps", [])) > 25:
        return _fail("too_many_next_steps", {"max": 25, "got": len(advisory.get("suggested_next_steps", []))})
    return _pass()


def _check_no_policy_override(advisory: dict[str, Any], risk_result: dict[str, Any]) -> dict[str, Any]:
    """
    Claude/stub must never override policy authority.
    If Risk says reject, advisory cannot claim proceed.
    If Risk says pass, advisory can still say caution/reject (advisory is conservative).
    """
    risk = risk_result.get("result")
    rec = advisory.get("recommendation")

    if risk == "reject" and rec == "proceed":
        return _fail("advisory_conflicts_with_hard_reject", {"risk_result": risk, "recommendation": rec})

    return _pass()


def _check_no_fabricated_policy_refs(advisory: dict[str, Any], risk_result: dict[str, Any]) -> dict[str, Any]:
    """
    Very lightweight hallucination guard:
    If rationale mentions a policy id (e.g. 'RISK-...'), it must match risk_result policy_id (if present).
    """
    rationale = advisory.get("rationale", "")
    mentioned = []

    # Simple scan: look for tokens that start with 'RISK-'
    for token in rationale.replace(",", " ").replace(".", " ").split():
        if token.startswith("RISK-"):
            mentioned.append(token)

    if not mentioned:
        return _pass()

    allowed = set()
    if "policy_id" in risk_result and isinstance(risk_result["policy_id"], str):
        allowed.add(risk_result["policy_id"])

    bad = [m for m in mentioned if m not in allowed]
    if bad:
        return _fail("fabricated_or_unexpected_policy_refs", {"mentioned": mentioned, "allowed": sorted(allowed)})

    return _pass()
