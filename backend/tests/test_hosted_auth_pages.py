"""Hosted IdP login/signup HTML shell (no DB required)."""

from __future__ import annotations

from app.api.auth.hosted_pages import login_html, signup_html


def test_login_page_matches_card_ui():
    body = login_html(redirect="/oauth2/authorize")
    assert "Log In" in body
    assert "Sign Up" in body
    assert "Continue with GitHub" not in body
    assert "Continue with Google" not in body
    assert 'name="email"' in body
    assert 'name="password"' in body
    assert "Sign In" in body
    assert 'href="/signup?redirect=' in body


def test_signup_page_card_ui():
    body = signup_html(redirect="/")
    assert "Create Account" in body
    assert "Terms of Service" in body
    assert "Privacy Policy" in body
    assert 'action="/signup"' in body
    assert "Continue with GitHub" not in body
