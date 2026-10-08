# Integrating Your App with the Custom SSO Backend

This guide explains how to connect any client—**web**, **mobile**, **Electron**, or **Polymer**—to this SSO backend.

**Default SSO base URL (local):** `http://localhost:8000`

---

## 1. Choose the right protocol

| Client type | Recommended protocol | Why |
|-------------|----------------------|-----|
| Modern web SPA (React, Vue, Angular, Polymer) | **OIDC Authorization Code + PKCE** | Browser-safe; no client secret |
| Electron desktop app | **OIDC Authorization Code + PKCE** | Same as SPA; use system browser or in-app BrowserWindow |
| Native mobile (iOS / Android) | **OIDC Authorization Code + PKCE** | Standard AppAuth / ASWebAuthenticationSession |
| Legacy enterprise SaaS that only speaks SAML | **SAML 2.0** | SP-initiated or IdP-initiated |
| Backend / directory sync tools | **SCIM 2.0** | User/group provisioning (not end-user login) |

For almost all new apps, use **OIDC + PKCE**.

---

## 2. Prerequisites (SSO server)

1. Start the backend (from `backend/`):

```bash
source .venv/bin/activate
docker compose up -d
alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Confirm discovery works:

```bash
curl http://localhost:8000/.well-known/openid-configuration
```

3. Register your application in SSO (admin API or seed). You need:
   - `client_id` (e.g. `demo-oidc-app`)
   - Exact `redirect_uri` (wildcards are rejected)
   - Protocol: `oidc` or `saml`

**Demo OIDC app (from seed):**

| Field | Value |
|-------|-------|
| `client_id` | `demo-oidc-app` |
| Redirect URIs | `http://localhost:3000/callback`, `http://127.0.0.1:3000/callback` |

To register a new OIDC app via admin API (after logging in as admin and getting an access token with admin claims):

```http
POST /v1/apps
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "My Frontend",
  "protocol": "oidc",
  "redirect_uris": ["http://localhost:3000/callback"]
}
```

Save the returned `client_id`.

---

## 3. Core concepts

```
┌─────────────┐     1. Redirect to authorize (+ PKCE)
│  Your App   │ ──────────────────────────────────────►  SSO
│ (web/mobile │
│  /Electron) │ ◄──────────────────────────────────────  SSO
└─────────────┘     2. Redirect back with ?code=
        │
        │  3. POST /oauth2/token (code + code_verifier)
        ▼
   access_token + id_token + refresh_token
        │
        ▼
   Call your APIs / GET /oauth2/userinfo
```

Important rules enforced by this SSO:

1. **PKCE is required** — `code_challenge` + `code_challenge_method=S256` on authorize; `code_verifier` on token exchange.
2. **Redirect URI must match exactly** — no wildcards.
3. **Refresh tokens rotate** — each use returns a new refresh token; reusing an old one revokes the family.
4. **Sessions** use an HttpOnly cookie (`sso_session`) on the SSO domain after login/signup.
5. **Tokens:** ID token ~5 minutes, access token ~15 minutes (configurable).

---

## 4. Step-by-step: OIDC + PKCE (all modern clients)

### Step 1 — Read discovery (optional but recommended)

```
GET {SSO_BASE}/.well-known/openid-configuration
```

Use these endpoints from the response:

- `authorization_endpoint` → `/oauth2/authorize`
- `token_endpoint` → `/oauth2/token`
- `userinfo_endpoint` → `/oauth2/userinfo`
- `jwks_uri` → `/.well-known/jwks.json`

### Step 2 — Generate PKCE values

In your client (browser, Electron, or mobile):

```text
code_verifier  = high-entropy random string (43–128 chars, URL-safe)
code_challenge = BASE64URL( SHA256(code_verifier) )
```

Store `code_verifier` securely until the token exchange (memory, secure storage, or sessionStorage for SPAs).

**JavaScript example:**

```javascript
function randomVerifier(length = 64) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

async function s256Challenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
```

### Step 3 — Send the user to authorize

Build this URL and open it (full redirect or system browser):

```
{SSO_BASE}/oauth2/authorize
  ?client_id=YOUR_CLIENT_ID
  &redirect_uri=YOUR_EXACT_REDIRECT_URI
  &response_type=code
  &scope=openid%20profile%20email%20groups
  &state=RANDOM_CSRF_TOKEN
  &nonce=RANDOM_NONCE
  &code_challenge=CODE_CHALLENGE
  &code_challenge_method=S256
```

| Param | Required | Notes |
|-------|----------|--------|
| `client_id` | Yes | Registered app id |
| `redirect_uri` | Yes | Must match registration exactly |
| `response_type` | Yes | Always `code` |
| `scope` | Yes | At least `openid` |
| `code_challenge` | Yes | S256 challenge |
| `code_challenge_method` | Yes | Must be `S256` |
| `state` | Recommended | CSRF protection; verify on return |
| `nonce` | Recommended | Bound into ID token |

If the user is not logged into SSO, they are redirected to `/login` (or can use `/signup`), then returned to authorize to complete the flow.

### Step 4 — Handle the callback

SSO redirects to:

```
YOUR_REDIRECT_URI?code=AUTH_CODE&state=...
```

Your app must:

1. Verify `state` matches what you stored.
2. Exchange `code` for tokens (next step).
3. Never put tokens in the URL hash for this flow (code is one-time; tokens stay in app storage).

### Step 5 — Exchange code for tokens

```http
POST {SSO_BASE}/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTH_CODE
&redirect_uri=YOUR_EXACT_REDIRECT_URI
&client_id=YOUR_CLIENT_ID
&code_verifier=CODE_VERIFIER
```

**Success response:**

```json
{
  "access_token": "...",
  "id_token": "...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_in": 900,
  "scope": "openid profile email groups"
}
```

Store:

- `access_token` — call APIs / userinfo
- `refresh_token` — get new tokens when access expires (keep secret)
- `id_token` — identity claims (optional to display user info)

### Step 6 — Call userinfo (or decode ID token)

```http
GET {SSO_BASE}/oauth2/userinfo
Authorization: Bearer <access_token>
```

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "groups": ["Admins"],
  "tenant_id": "tenant-uuid"
}
```

Supported claims in v1: `sub`, `email`, `name`, `groups`, `tenant_id`.

### Step 7 — Refresh tokens

```http
POST {SSO_BASE}/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token=CURRENT_REFRESH_TOKEN
&client_id=YOUR_CLIENT_ID
```

Always **replace** the stored refresh token with the new one from the response. Do not reuse the old refresh token.

### Step 8 — Logout

```http
POST {SSO_BASE}/session/logout
```

This revokes the SSO session cookie and associated refresh tokens (cookie must be sent if same-site / credentialed). Also clear local tokens in your app.

---

## 5. Platform-specific guides

### A. Web SPA (React / Vue / Angular / plain JS)

1. Register redirect URI, e.g. `http://localhost:3000/callback`.
2. On “Login”, generate PKCE + `state`, save verifier/state, redirect to authorize.
3. On `/callback` route, exchange code → tokens.
4. Keep `access_token` in memory (preferred) or sessionStorage; keep `refresh_token` in the most secure storage you can use in a SPA.
5. Attach `Authorization: Bearer <access_token>` to your own backend APIs (or call SSO userinfo).

**Minimal redirect start:**

```javascript
const SSO = "http://localhost:8000";
const CLIENT_ID = "demo-oidc-app";
const REDIRECT_URI = "http://localhost:3000/callback";

async function login() {
  const verifier = randomVerifier();
  const challenge = await s256Challenge(verifier);
  const state = crypto.randomUUID();
  sessionStorage.setItem("pkce_verifier", verifier);
  sessionStorage.setItem("oauth_state", state);

  const url = new URL(`${SSO}/oauth2/authorize`);
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile email groups");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  window.location.href = url.toString();
}
```

**Callback exchange:**

```javascript
async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("state") !== sessionStorage.getItem("oauth_state")) {
    throw new Error("Invalid state");
  }
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.get("code"),
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: sessionStorage.getItem("pkce_verifier"),
  });
  const res = await fetch(`${SSO}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const tokens = await res.json();
  // persist tokens, then navigate into the app
  return tokens;
}
```

Libraries you can use instead of hand-rolling: `oidc-client-ts`, `oauth4webapi`.

---

### B. Polymer (web components)

Polymer apps are still browser SPAs. Use the **same OIDC + PKCE flow** as section A.

Suggested structure:

1. Create an `<sso-auth>` element that owns login/logout and token refresh.
2. On `connectedCallback`, check for `?code=` on the callback path.
3. Expose methods: `login()`, `logout()`, `getAccessToken()`.
4. Other elements request the token via events or a shared service.

Example sketch:

```javascript
class SsoAuth extends PolymerElement {
  static get properties() {
    return {
      accessToken: { type: String, notify: true },
      user: { type: Object, notify: true },
    };
  }

  login() { /* same as SPA login() above */ }

  async ready() {
    super.ready();
    if (location.pathname === "/callback" && location.search.includes("code=")) {
      const tokens = await handleCallback();
      this.accessToken = tokens.access_token;
      const ui = await fetch(`${SSO}/oauth2/userinfo`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      this.user = await ui.json();
      history.replaceState({}, "", "/");
    }
  }
}
customElements.define("sso-auth", SsoAuth);
```

Register a dedicated redirect URI for your Polymer app origin, e.g. `http://localhost:8081/callback`.

---

### C. Electron (desktop)

Prefer opening the **system browser** or a dedicated `BrowserWindow` for authorize, then deep-link back into the app.

#### Recommended pattern

1. Register a custom redirect URI, e.g.:
   - Loopback: `http://127.0.0.1:53100/callback` (start a tiny local HTTP server in Electron), or
   - Custom protocol: `myapp://auth/callback` (register protocol in Electron)
2. Generate PKCE in the main process (more secure than renderer).
3. Open authorize URL with `shell.openExternal()` or `BrowserWindow`.
4. Capture `code` on callback.
5. Exchange for tokens in the main process.
6. Store tokens with Electron `safeStorage` / OS keychain; never in plain localStorage if avoidable.

**Register custom protocol (main process):**

```javascript
const { app, shell } = require("electron");

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("myapp", process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient("myapp");
}

// Redirect URI registered in SSO: myapp://auth/callback
```

**Important:** Whatever redirect URI you use in Electron must be added exactly in the SSO app config (`POST /v1/apps` or seed).

For local development, loopback HTTP is often easier than custom protocols on all OSes.

---

### D. Mobile (iOS / Android)

Use the platform’s official browser-based auth:

| Platform | Recommended API |
|----------|-----------------|
| iOS | `ASWebAuthenticationSession` / AppAuth |
| Android | AppAuth for Android / Chrome Custom Tabs |

Flow is identical to OIDC + PKCE:

1. Register redirect URI, e.g. `com.example.myapp:/oauth2redirect` or HTTPS app link.
2. Start authorize in the system browser session.
3. App receives `code` via redirect.
4. Exchange code in the app with `code_verifier`.
5. Store tokens in Keychain (iOS) / EncryptedSharedPreferences or Keystore (Android).

Do **not** embed a username/password form inside a WebView that talks to SSO with a password grant — this backend does not expose a resource-owner password grant for apps. Users authenticate on SSO’s `/login` page during the authorize redirect.

---

## 6. Optional: direct signup / login JSON (same origin or trusted first-party UI)

If your UI is first-party and can call SSO APIs directly (CORS/cookies configured as needed):

### Sign up

```http
POST /signup/json
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass1!",
  "name": "User Name",
  "tenant_slug": "demo"
}
```

Returns `201` + sets `sso_session` cookie; body includes `session_id`, `user_id`, `email`.

### Login

```http
POST /login/json
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass1!",
  "tenant_slug": "demo",
  "mfa_code": "123456"
}
```

These endpoints are useful for a custom branded login screen hosted with SSO. For third-party or Electron/mobile apps, prefer the **authorize redirect** so the password never enters your app process.

After session cookie exists, continue with `/oauth2/authorize` (PKCE) to obtain tokens for your `client_id`.

---

## 7. SAML apps (enterprise)

Use SAML when the application only supports SAML assertions.

1. Register app with `protocol: "saml"` and config:
   - `acs_url` — Assertion Consumer Service URL of your app
   - `entity_id` / `audience` — your SP entity ID
2. IdP metadata: `GET {SSO_BASE}/saml/metadata/{tenant_slug}`
3. SSO endpoint: `GET|POST {SSO_BASE}/saml/sso`
   - **SP-initiated:** POST/Redirect `SAMLRequest` (+ optional `RelayState`)
   - **IdP-initiated:** `GET /saml/sso?client_id=demo-saml-app`

Your app receives a form POST to `acs_url` with `SAMLResponse` (Base64). Validate signature, audience, recipient, and freshness (assertions are short-lived and single-use on the IdP side).

---

## 8. Checklist for a new client

1. [ ] Decide OIDC (default) vs SAML  
2. [ ] Register app in SSO with exact redirect / ACS URLs  
3. [ ] Implement PKCE authorize → callback → token  
4. [ ] Verify `state` (and optionally `nonce`)  
5. [ ] Store tokens securely; refresh with rotation  
6. [ ] Call `/oauth2/userinfo` or trust validated ID token claims  
7. [ ] Implement logout (local clear + `/session/logout`)  
8. [ ] Test failure cases: missing PKCE, wrong redirect, reused refresh token  

---

## 9. Common errors

| Symptom | Cause | Fix |
|---------|--------|-----|
| `400` on authorize: PKCE required | Missing `code_challenge` / not `S256` | Always send S256 PKCE |
| `redirect_uri mismatch` | URI not exact | Register and use identical string |
| `invalid_grant` on token | Bad/expired code or wrong verifier | Complete exchange quickly; match PKCE |
| `invalid_grant` on refresh | Reused rotated refresh token | Use only the latest refresh token |
| Login page instead of code | No SSO session | User must sign in/sign up first |
| CORS errors from SPA | Browser cross-origin | Prefer full-page redirect for authorize; token call may need CORS or a BFF |

---

## 10. Quick reference — endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/.well-known/openid-configuration` | OIDC discovery |
| GET | `/.well-known/jwks.json` | Token verification keys |
| GET | `/oauth2/authorize` | Start login / consent (PKCE) |
| POST | `/oauth2/token` | Code exchange / refresh |
| GET | `/oauth2/userinfo` | Current user claims |
| GET/POST | `/login`, `/login/json` | Interactive / API login |
| GET/POST | `/signup`, `/signup/json` | Interactive / API signup |
| POST | `/session/logout` | Single logout |
| GET | `/session/me` | Current session (cookie) |
| GET/POST | `/saml/sso` | SAML sign-on |
| GET | `/saml/metadata/{tenant}` | SAML IdP metadata |

Interactive API explorer: `{SSO_BASE}/docs`

---

## 11. End-to-end smoke test (demo OIDC app)

1. Start SSO on port `8000`.  
2. Point a simple page at `http://localhost:3000` with callback `/callback`.  
3. Use `client_id=demo-oidc-app` and redirect `http://localhost:3000/callback`.  
4. Run PKCE authorize → login as seeded admin → receive code → token → userinfo.  
5. Confirm `email` from userinfo matches the signed-in user.

That confirms your client integration path before you wire production redirect URIs and branding.
