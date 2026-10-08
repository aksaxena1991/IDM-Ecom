"""Policy decision point for PBAC over ABAC attributes.

Combining algorithm: deny-overrides. A matching deny wins over any allow.
If the tenant has policies for the requested action but none grant access,
the decision is deny. If no enabled policy targets the action, access is
allowed so existing tenants keep working until policies are configured.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

ATTR_KEY = re.compile(r"^[a-z][a-z0-9_]{0,63}$")
ACTION_NAME = re.compile(r"^[a-z*][a-z0-9_:*]{0,63}$")
PATH = re.compile(r"^(subject|resource|environment)\.[a-z][a-z0-9_]{0,63}$")
OPS = frozenset({"eq", "neq", "in", "not_in", "contains", "gte", "lte", "gt", "lt", "exists", "starts_with"})
MAX_DEPTH = 5
_MISSING = object()


@dataclass(frozen=True)
class PolicyRule:
    name: str
    effect: str
    priority: int
    actions: list[str]
    resource_match: dict[str, Any]
    conditions: dict[str, Any]
    enabled: bool = True


@dataclass(frozen=True)
class AccessDecision:
    allowed: bool
    reason: str
    message: str
    matched_policies: list[str] = field(default_factory=list)


class PolicyValidationError(ValueError):
    pass


def validate_attribute_map(attributes: dict[str, Any]) -> dict[str, Any]:
    if len(attributes) > 50:
        raise PolicyValidationError("At most 50 attributes are allowed")
    cleaned: dict[str, Any] = {}
    for key, value in attributes.items():
        if not isinstance(key, str) or not ATTR_KEY.match(key):
            raise PolicyValidationError(f"Invalid attribute key: {key!r}")
        cleaned[key] = _json_scalar_or_list(value, f"attribute {key}")
    return cleaned


def validate_policy(
    *,
    actions: list[str],
    resource_match: dict[str, Any],
    conditions: dict[str, Any],
) -> None:
    if not actions:
        raise PolicyValidationError("A policy must list at least one action")
    for action in actions:
        if not isinstance(action, str) or not ACTION_NAME.match(action):
            raise PolicyValidationError(f"Invalid action: {action!r}")
    if not isinstance(resource_match, dict):
        raise PolicyValidationError("resource_match must be an object")
    for key, value in resource_match.items():
        if not isinstance(key, str) or not ATTR_KEY.match(key):
            raise PolicyValidationError(f"Invalid resource match key: {key!r}")
        _json_scalar_or_list(value, f"resource_match.{key}")
    _validate_conditions(conditions, depth=0)


def evaluate(
    policies: list[PolicyRule],
    *,
    action: str,
    subject: dict[str, Any],
    resource: dict[str, Any],
    environment: dict[str, Any],
) -> AccessDecision:
    targeted = [
        policy
        for policy in policies
        if policy.enabled and _action_matches(policy.actions, action)
    ]
    if not targeted:
        return AccessDecision(
            allowed=True,
            reason="no_policy_for_action",
            message="No access policy is configured for this action",
        )

    applicable: list[PolicyRule] = []
    for policy in targeted:
        if not _resource_matches(policy.resource_match, resource):
            continue
        if not _conditions_match(policy.conditions, subject, resource, environment, depth=0):
            continue
        applicable.append(policy)

    denies = [policy for policy in applicable if policy.effect == "deny"]
    if denies:
        winner = max(denies, key=lambda policy: policy.priority)
        names = [policy.name for policy in denies]
        return AccessDecision(
            allowed=False,
            reason="denied_by",
            message=f"Denied by policy '{winner.name}'",
            matched_policies=names,
        )

    allows = [policy for policy in applicable if policy.effect == "allow"]
    if allows:
        winner = max(allows, key=lambda policy: policy.priority)
        names = [policy.name for policy in allows]
        return AccessDecision(
            allowed=True,
            reason="allowed_by",
            message=f"Allowed by policy '{winner.name}'",
            matched_policies=names,
        )

    return AccessDecision(
        allowed=False,
        reason="default_deny",
        message="No access policy allows this request",
    )


def _action_matches(actions: list[str], action: str) -> bool:
    return "*" in actions or action in actions


def _resource_matches(match: dict[str, Any], resource: dict[str, Any]) -> bool:
    for key, expected in match.items():
        if resource.get(key) != expected:
            return False
    return True


def _conditions_match(
    node: dict[str, Any],
    subject: dict[str, Any],
    resource: dict[str, Any],
    environment: dict[str, Any],
    *,
    depth: int,
) -> bool:
    if depth > MAX_DEPTH or not isinstance(node, dict):
        return False
    if not node:
        return True
    if "all" in node or "any" in node:
        if "all" in node:
            items = node["all"]
            if not isinstance(items, list) or not all(
                _match_item(item, subject, resource, environment, depth=depth + 1) for item in items
            ):
                return False
        if "any" in node:
            items = node["any"]
            if not isinstance(items, list) or not any(
                _match_item(item, subject, resource, environment, depth=depth + 1) for item in items
            ):
                return False
        return True
    return _condition_match(node, subject, resource, environment)


def _match_item(
    item: Any,
    subject: dict[str, Any],
    resource: dict[str, Any],
    environment: dict[str, Any],
    *,
    depth: int,
) -> bool:
    if not isinstance(item, dict):
        return False
    if "all" in item or "any" in item:
        return _conditions_match(item, subject, resource, environment, depth=depth)
    return _condition_match(item, subject, resource, environment)


def _condition_match(
    condition: dict[str, Any],
    subject: dict[str, Any],
    resource: dict[str, Any],
    environment: dict[str, Any],
) -> bool:
    attr = condition.get("attr")
    op = condition.get("op")
    if not isinstance(attr, str) or not isinstance(op, str) or op not in OPS:
        return False
    left = _resolve(attr, subject, resource, environment)
    if op == "exists":
        return left is not _MISSING and left is not None

    if "value_from" in condition and condition["value_from"] is not None:
        right = _resolve(str(condition["value_from"]), subject, resource, environment)
        if right is _MISSING:
            return False
    else:
        right = condition.get("value")

    if left is _MISSING:
        return False
    return _compare(op, left, right)


def _compare(op: str, left: Any, right: Any) -> bool:
    if op == "eq":
        return left == right
    if op == "neq":
        return left != right
    if op == "in":
        return isinstance(right, list) and left in right
    if op == "not_in":
        return isinstance(right, list) and left not in right
    if op == "contains":
        if isinstance(left, list):
            return right in left
        if isinstance(left, str) and isinstance(right, str):
            return right in left
        return False
    if op == "starts_with":
        return isinstance(left, str) and isinstance(right, str) and left.startswith(right)
    if op in {"gte", "lte", "gt", "lt"}:
        if isinstance(left, bool) or isinstance(right, bool):
            return False
        if not isinstance(left, (int, float)) or not isinstance(right, (int, float)):
            return False
        if op == "gte":
            return left >= right
        if op == "lte":
            return left <= right
        if op == "gt":
            return left > right
        return left < right
    return False


def _resolve(
    path: str,
    subject: dict[str, Any],
    resource: dict[str, Any],
    environment: dict[str, Any],
) -> Any:
    if not PATH.match(path):
        return _MISSING
    root, key = path.split(".", 1)
    bag = {"subject": subject, "resource": resource, "environment": environment}[root]
    if key not in bag:
        return _MISSING
    return bag[key]


def _validate_conditions(node: Any, *, depth: int) -> None:
    if depth > MAX_DEPTH:
        raise PolicyValidationError("Policy conditions are nested too deeply")
    if not isinstance(node, dict):
        raise PolicyValidationError("Policy conditions must be an object")
    if not node:
        return
    if "all" in node or "any" in node:
        extra = set(node) - {"all", "any"}
        if extra:
            raise PolicyValidationError(f"Unexpected condition keys: {sorted(extra)}")
        for field_name in ("all", "any"):
            if field_name not in node:
                continue
            items = node[field_name]
            if not isinstance(items, list) or not items:
                raise PolicyValidationError(f"'{field_name}' must be a non-empty list")
            for item in items:
                if not isinstance(item, dict):
                    raise PolicyValidationError("Each condition must be an object")
                if "all" in item or "any" in item:
                    _validate_conditions(item, depth=depth + 1)
                else:
                    _validate_leaf(item)
        return
    _validate_leaf(node)


def _validate_leaf(condition: dict[str, Any]) -> None:
    attr = condition.get("attr")
    op = condition.get("op")
    if not isinstance(attr, str) or not PATH.match(attr):
        raise PolicyValidationError(f"Invalid attribute path: {attr!r}")
    if not isinstance(op, str) or op not in OPS:
        raise PolicyValidationError(f"Invalid operator: {op!r}")
    allowed = {"attr", "op", "value", "value_from"}
    extra = set(condition) - allowed
    if extra:
        raise PolicyValidationError(f"Unexpected condition keys: {sorted(extra)}")
    if op == "exists":
        return
    has_value = "value" in condition
    has_from = condition.get("value_from") is not None
    if has_value == has_from:
        raise PolicyValidationError("A condition needs exactly one of 'value' or 'value_from'")
    if has_from:
        if not isinstance(condition["value_from"], str) or not PATH.match(condition["value_from"]):
            raise PolicyValidationError(f"Invalid value_from path: {condition['value_from']!r}")
        return
    _json_scalar_or_list(condition.get("value"), "condition value")
    if op in {"in", "not_in"} and not isinstance(condition.get("value"), list):
        raise PolicyValidationError(f"Operator '{op}' requires a list value")


def _json_scalar_or_list(value: Any, label: str) -> Any:
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    if isinstance(value, list) and all(isinstance(item, (str, int, float, bool)) or item is None for item in value):
        return value
    raise PolicyValidationError(f"{label} must be a string, number, boolean, null, or list of those")
