from app.services.policy_engine import PolicyRule, PolicyValidationError, evaluate, validate_policy


def _allow(**overrides) -> PolicyRule:
    data = {
        "name": "allow-eng",
        "effect": "allow",
        "priority": 10,
        "actions": ["app:access"],
        "resource_match": {},
        "conditions": {"all": [{"attr": "subject.department", "op": "eq", "value": "engineering"}]},
    }
    data.update(overrides)
    return PolicyRule(**data)


def test_no_policy_for_action_denies():
    decision = evaluate(
        [_allow(actions=["admin:write"])],
        action="app:access",
        subject={"department": "sales"},
        resource={},
        environment={"hour": 9, "weekday": 0},
    )
    assert decision.allowed is False
    assert decision.reason == "no_policy_for_action"


def test_attribute_match_allows():
    decision = evaluate(
        [_allow()],
        action="app:access",
        subject={"department": "engineering"},
        resource={},
        environment={},
    )
    assert decision.allowed is True
    assert decision.reason == "allowed_by"
    assert decision.matched_policies == ["allow-eng"]


def test_unmatched_attribute_defaults_to_deny():
    decision = evaluate(
        [_allow()],
        action="app:access",
        subject={"department": "sales"},
        resource={},
        environment={},
    )
    assert decision.allowed is False
    assert decision.reason == "default_deny"


def test_deny_overrides_allow():
    deny = PolicyRule(
        name="restricted",
        effect="deny",
        priority=100,
        actions=["app:access"],
        resource_match={},
        conditions={
            "all": [
                {"attr": "resource.sensitivity", "op": "eq", "value": "restricted"},
                {"attr": "subject.clearance", "op": "lt", "value": 3},
            ]
        },
    )
    decision = evaluate(
        [_allow(conditions={"all": [{"attr": "subject.is_admin", "op": "eq", "value": True}]}), deny],
        action="app:access",
        subject={"is_admin": True, "clearance": 1},
        resource={"sensitivity": "restricted"},
        environment={},
    )
    assert decision.allowed is False
    assert decision.matched_policies == ["restricted"]


def test_value_from_compares_subject_to_resource():
    rule = _allow(
        conditions={
            "all": [{"attr": "subject.department", "op": "eq", "value_from": "resource.owner_department"}]
        }
    )
    allowed = evaluate(
        [rule],
        action="app:access",
        subject={"department": "engineering"},
        resource={"owner_department": "engineering"},
        environment={},
    )
    denied = evaluate(
        [rule],
        action="app:access",
        subject={"department": "engineering"},
        resource={"owner_department": "finance"},
        environment={},
    )
    assert allowed.allowed is True
    assert denied.allowed is False


def test_group_contains_and_resource_match():
    rule = PolicyRule(
        name="admins-on-demo",
        effect="allow",
        priority=1,
        actions=["app:access"],
        resource_match={"client_id": "idm-oidc-app"},
        conditions={"all": [{"attr": "subject.groups", "op": "contains", "value": "Platform-Admins"}]},
    )
    hit = evaluate(
        [rule],
        action="app:access",
        subject={"groups": ["Platform-Admins"]},
        resource={"client_id": "idm-oidc-app"},
        environment={},
    )
    miss = evaluate(
        [rule],
        action="app:access",
        subject={"groups": ["Platform-Admins"]},
        resource={"client_id": "other"},
        environment={},
    )
    assert hit.allowed is True
    assert miss.reason == "default_deny"


def test_resource_match_client_id_list():
    rule = _allow(
        resource_match={"client_id": ["idm-oidc-app", "ims-oidc-app"]},
        conditions={},
    )
    idm = evaluate(
        [rule],
        action="app:access",
        subject={},
        resource={"client_id": "idm-oidc-app"},
        environment={},
    )
    other = evaluate(
        [rule],
        action="app:access",
        subject={},
        resource={"client_id": "other-app"},
        environment={},
    )
    assert idm.allowed is True
    assert other.reason == "default_deny"


def test_environment_hour_window():
    rule = _allow(
        conditions={
            "all": [
                {"attr": "environment.hour", "op": "gte", "value": 9},
                {"attr": "environment.hour", "op": "lt", "value": 17},
            ]
        }
    )
    open_hours = evaluate([rule], action="app:access", subject={}, resource={}, environment={"hour": 10})
    closed = evaluate([rule], action="app:access", subject={}, resource={}, environment={"hour": 22})
    assert open_hours.allowed is True
    assert closed.allowed is False


def test_invalid_policy_rejected():
    try:
        validate_policy(
            actions=["app:access"],
            resource_match={},
            conditions={"all": [{"attr": "subject.department", "op": "eq"}]},
        )
    except PolicyValidationError as exc:
        assert "value" in str(exc)
    else:
        raise AssertionError("expected validation error")
