"""Hosted HTML login page (IdP UI)."""

from __future__ import annotations

from html import escape


def login_html(*, redirect: str = "/", error: str = "", brand: str = "IDM Portal") -> str:
    """Card-style hosted login: email + password (+ optional MFA)."""
    redirect_q = escape(redirect, quote=True)
    brand_safe = escape(brand)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>{brand_safe} · Log In</title>
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
    <h1>Welcome back</h1>
    <p class="lede">Sign in with your email and password.</p>
    <form class="stack" method="post" action="/login">
      <input type="hidden" name="redirect" value="{redirect_q}"/>
      <label class="field">
        <span>Email</span>
        <input name="email" type="email" required autocomplete="email" placeholder="name@example.com"/>
      </label>
      <label class="field">
        <span>Password</span>
        <input name="password" type="password" required minlength="8"
               autocomplete="current-password" placeholder="········"/>
      </label>
      <label class="field">
        <span>MFA code <span class="optional">(if enrolled)</span></span>
        <input name="mfa_code" type="text" inputmode="numeric" autocomplete="one-time-code" placeholder="123456"/>
      </label>
      <button class="btn btn-primary" type="submit">Sign In</button>
    </form>
    {error}
    <p class="legal">
      By signing in, you agree to our
      <a href="/legal/terms">Terms of Service</a>
      and
      <a href="/legal/privacy">Privacy Policy</a>.
    </p>
  </main>
</body>
</html>
"""


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
