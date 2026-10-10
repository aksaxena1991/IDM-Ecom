"""Hosted IdP login HTML shell (no DB required)."""

from __future__ import annotations

from app.api.auth.hosted_pages import login_html


def test_login_page_matches_card_ui():
    body = login_html(redirect="/oauth2/authorize")
    assert "Welcome back" in body
    assert "Sign In" in body
    assert "Sign Up" not in body
    assert "Create Account" not in body
    assert 'name="email"' in body
    assert 'name="password"' in body
    assert "Continue with GitHub" not in body
