"""Hosted HTML login / signup pages (IdP UI)."""

from __future__ import annotations

from html import escape


def _auth_shell(
    *,
    mode: str,
    redirect: str = "/",
    error: str = "",
    brand: str = "SSO Portal",
) -> str:
    """Firecrawl-style card: Log In / Sign Up toggle, email+password, social buttons."""
    is_signup = mode == "signup"
    redirect_q = escape(redirect, quote=True)
    brand_safe = escape(brand)
    active_login = "" if is_signup else "is-active"
    active_signup = "is-active" if is_signup else ""
    title = "Create your account" if is_signup else "Welcome back"
    subtitle = (
        "Create an account with your email and password."
        if is_signup
        else "Sign in with your email and password."
    )
    form_action = "/signup" if is_signup else "/login"
    cta = "Create Account" if is_signup else "Sign In"
    legal = (
        'By signing up, you agree to our <a href="/legal/terms">Terms of Service</a> '
        'and <a href="/legal/privacy">Privacy Policy</a>.'
        if is_signup
        else 'By signing in, you agree to our <a href="/legal/terms">Terms of Service</a> '
        'and <a href="/legal/privacy">Privacy Policy</a>.'
    )
    mfa_block = ""
    if not is_signup:
        mfa_block = """
        <label class="field">
          <span>MFA code <span class="optional">(if enrolled)</span></span>
          <input name="mfa_code" type="text" inputmode="numeric" autocomplete="one-time-code" placeholder="123456"/>
        </label>
        """
    confirm_block = ""
    if is_signup:
        confirm_block = """
        <input type="hidden" name="tenant_slug" value="demo"/>
        <input type="hidden" name="confirm_password" id="confirm_password"/>
        """

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>{brand_safe} · {"Sign Up" if is_signup else "Log In"}</title>
  <style>
    :root {{
      --bg: #f4f5f7;
      --card: #ffffff;
      --ink: #111827;
      --muted: #6b7280;
      --line: #e5e7eb;
      --accent: #f97316;
      --accent-hover: #ea580c;
      --accent-ink: #ffffff;
      --danger: #dc2626;
      --shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
      --radius: 16px;
      --font: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
    }}
    * {{ box-sizing: border-box; }}
    html, body {{ min-height: 100%; }}
    body {{
      margin: 0;
      font-family: var(--font);
      color: var(--ink);
      background-color: var(--bg);
      background-image:
        linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
      background-size: 28px 28px;
      display: grid;
      place-items: center;
      padding: 2rem 1rem;
    }}
    .card {{
      width: min(100%, 420px);
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 1.75rem 1.5rem 1.5rem;
    }}
    .brand {{
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.55rem;
      margin: 0 0 1.25rem;
      font-size: 1.35rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }}
    .brand-mark {{
      width: 1.55rem;
      height: 1.55rem;
      border-radius: 0.45rem;
      background: linear-gradient(145deg, #fb923c, #ea580c);
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.25);
      position: relative;
    }}
    .brand-mark::after {{
      content: "";
      position: absolute;
      inset: 0.28rem 0.42rem 0.22rem;
      border-radius: 40% 40% 45% 45%;
      background: rgba(255,255,255,0.85);
      clip-path: polygon(50% 8%, 82% 78%, 18% 78%);
    }}
    .tabs {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.25rem;
      padding: 0.25rem;
      background: #f3f4f6;
      border-radius: 999px;
      margin-bottom: 1.35rem;
    }}
    .tabs a {{
      text-align: center;
      text-decoration: none;
      color: var(--muted);
      font-weight: 600;
      font-size: 0.92rem;
      padding: 0.55rem 0.75rem;
      border-radius: 999px;
    }}
    .tabs a.is-active {{
      background: #fff;
      color: var(--ink);
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
    }}
    h1 {{
      margin: 0 0 0.35rem;
      font-size: 1.35rem;
      letter-spacing: -0.02em;
      text-align: center;
    }}
    .lede {{
      margin: 0 0 1.25rem;
      color: var(--muted);
      font-size: 0.92rem;
      text-align: center;
      line-height: 1.45;
    }}
    form.stack {{ display: grid; gap: 0.85rem; }}
    .field {{ display: grid; gap: 0.35rem; font-size: 0.88rem; font-weight: 600; }}
    .field .optional {{ font-weight: 500; color: var(--muted); }}
    input[type="email"],
    input[type="password"],
    input[type="text"] {{
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 0.72rem 0.85rem;
      font: inherit;
      font-weight: 500;
      background: #fff;
      color: var(--ink);
    }}
    input::placeholder {{ color: #9ca3af; font-weight: 400; }}
    input:focus {{
      outline: 2px solid rgba(249, 115, 22, 0.35);
      border-color: #fdba74;
    }}
    .btn {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.55rem;
      width: 100%;
      border: 0;
      border-radius: 10px;
      padding: 0.8rem 1rem;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
    }}
    .btn-primary {{
      background: var(--accent);
      color: var(--accent-ink);
      margin-top: 0.15rem;
    }}
    .btn-primary:hover {{ background: var(--accent-hover); }}
    .error {{
      margin: 0.75rem 0 0;
      color: var(--danger);
      font-size: 0.9rem;
      text-align: center;
    }}
    .legal {{
      margin: 1.15rem 0 0;
      color: var(--muted);
      font-size: 0.78rem;
      text-align: center;
      line-height: 1.45;
    }}
    .legal a {{ color: inherit; }}
  </style>
</head>
<body>
  <main class="card">
    <div class="brand"><span class="brand-mark" aria-hidden="true"></span>{brand_safe}</div>
    <nav class="tabs" aria-label="Auth mode">
      <a class="{active_login}" href="/login?redirect={redirect_q}">Log In</a>
      <a class="{active_signup}" href="/signup?redirect={redirect_q}">Sign Up</a>
    </nav>
    <h1>{title}</h1>
    <p class="lede">{subtitle}</p>
    <form class="stack" method="post" action="{form_action}" id="auth-form">
      <input type="hidden" name="redirect" value="{redirect_q}"/>
      {confirm_block}
      <label class="field">
        <span>Email</span>
        <input name="email" type="email" required autocomplete="email" placeholder="name@example.com"/>
      </label>
      <label class="field">
        <span>Password</span>
        <input name="password" type="password" required minlength="8"
               autocomplete="{"new-password" if is_signup else "current-password"}"
               placeholder="········" id="password"/>
      </label>
      {mfa_block}
      <button class="btn btn-primary" type="submit">{cta}</button>
    </form>
    {error}
    <p class="legal">{legal}</p>
  </main>
  <script>
    (function () {{
      var form = document.getElementById("auth-form");
      var password = document.getElementById("password");
      var confirm = document.getElementById("confirm_password");
      if (form && password && confirm) {{
        form.addEventListener("submit", function () {{
          confirm.value = password.value;
        }});
      }}
    }})();
  </script>
</body>
</html>
"""


def login_html(*, redirect: str = "/", error: str = "", brand: str = "SSO Portal") -> str:
    return _auth_shell(mode="login", redirect=redirect, error=error, brand=brand)


def signup_html(*, redirect: str = "/", error: str = "", brand: str = "SSO Portal") -> str:
    return _auth_shell(mode="signup", redirect=redirect, error=error, brand=brand)


def legal_page_html(*, title: str, body: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>{escape(title)}</title>
<style>
  body{{margin:0;font-family:system-ui,sans-serif;background:#f4f5f7;color:#111827}}
  main{{max-width:720px;margin:3rem auto;padding:0 1.25rem}}
  a{{color:#ea580c}}
</style></head>
<body><main>
  <p><a href="/login">← Back</a></p>
  <h1>{escape(title)}</h1>
  <p>{escape(body)}</p>
</main></body></html>"""
