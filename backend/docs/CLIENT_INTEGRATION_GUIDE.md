# Integrate Your App with This Custom SSO Backend

Step-by-step guide for connecting **web**, **mobile**, **Electron**, or **Polymer** clients to the SSO API.

| | |
|---|---|
| **SSO base URL (local)** | `http://localhost:8000` |
| **API docs** | `http://localhost:8000/docs` |
| **OIDC discovery** | `GET /.well-known/openid-configuration` |
| **Reference SPA** | [`frontend/`](../../frontend/) (React + TypeScript) |

---

## Contents

1. [Choose a protocol](#1-choose-a-protocol)
2. [Start and configure SSO](#2-start-and-configure-sso)
3. [Register your application](#3-register-your-application)
4. [OIDC + PKCE (recommended for all modern clients)](#4-oidc--pkce-recommended-for-all-modern-clients)
5. [Platform guides](#5-platform-guides)
6. [Optional first-party login / signup JSON](#6-optional-first-party-login--signup-json)
7. [MFA (TOTP)](#7-mfa-totp)
8. [Using tokens in your app](#8-using-tokens-in-your-app)
9. [Access control (ABAC / PBAC)](#9-access-control-abac--pbac)
10. [Admin API (tenant operators)](#10-admin-api-tenant-operators)
11. [SAML (enterprise apps)](#11-saml-enterprise-apps)
12. [SCIM (provisioning)](#12-scim-provisioning)
13. [Checklist and common errors](#13-checklist-and-common-errors)
14. [Endpoint quick reference](#14-endpoint-quick-reference)

---

## 1. Choose a protocol

| Client | Use | Why |
|--------|-----|-----|
| Web SPA (React, Vue, Angular, Polymer) | **OIDC Authorization Code + PKCE** | No client secret in the browser |
| Electron desktop | **OIDC + PKCE** | Same flow; open system browser or `BrowserWindow` |
| Native mobile (iOS / Android) | **OIDC + PKCE** | AppAuth / `ASWebAuthenticationSession` |
| Legacy SaaS that only supports SAML | **SAML 2.0** | SP- or IdP-initiated |
| HR / IdM sync tools | **SCIM 2.0** | User/group provisioning (not end-user login) |

**Default for new work: OIDC + PKCE.**

---

## 2. Start and configure SSO

From `backend/`:

```bash
source .venv/bin/activate
docker compose up -d          # Postgres :5433, Redis :6379
alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify:

```bash
curl -s http://localhost:8000/healthz
curl -s http://localhost:8000/.well-known/openid-configuration | head
```

### Demo values (after seed)

| Item | Value |
|------|-------|
| Admin email | See [README.md](../README.md) (seeded admin) |
| OIDC `client_id` | `demo-oidc-app` |
| Redirect URIs | `http://localhost:3000/callback`, `http://127.0.0.1:3000/callback` |
| Session cookie | `sso_session` (HttpOnly) |
| CORS (SPA) | `http://localhost:3000` (configure via `CORS_ORIGINS`) |

Set `BASE_URL` in `.env` to the public URL of SSO in each environment (used as OIDC `issuer`).

---

## 3. Register your application

Every client needs an **application** record with:

- `client_id` (returned on create, or use seed `demo-oidc-app`)
- Protocol: `oidc` or `saml`
- **Exact** redirect URI(s) — wildcards are rejected

### Create via Admin API

1. Sign in as an admin and obtain an access token with `is_admin` / `admin` scope (see §4).
2. Call:

```http
POST /v1/apps
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "My App",
  "protocol": "oidc",
  "redirect_uris": [
    "http://localhost:3000/callback",
    "myapp://auth/callback"
  ]
}
```

3. Store the returned `client_id` in your client config.

**Admin writes** may require MFA step-up (`POST /mfa/totp/verify`) if the session’s step-up is older than 15 minutes. Response: `401` with `"challenge": "mfa_step_up"`.

---

## 4. OIDC + PKCE (recommended for all modern clients)

### Flow overview

```
Your app                    SSO
   |                         |
   |-- GET /oauth2/authorize (+ PKCE) -->
   |                         |  (login / MFA if needed)
   |                         |  (ABAC/PBAC app:access check)
   |<-- 302 ?code=&state= ---|
   |                         |
   |-- POST /oauth2/token (code + verifier) -->
   |<-- access_token, id_token, refresh_token --|
   |                         |
   |-- GET /oauth2/userinfo (Bearer) --------->
   |<-- sub, email, name, groups, attributes --|
```

### Rules enforced by this server

1. **PKCE required** — `code_challenge` + `code_challenge_method=S256` on authorize; `code_verifier` on token exchange.
2. **Exact redirect URI** — must match registration character-for-character.
3. **Refresh tokens rotate** — each refresh returns a new refresh token; reusing an old one revokes the family.
4. **Access may be denied by policy** — even after login, authorize/token can return `access_denied` if PBAC/ABAC denies `app:access`.
5. **Token lifetimes (defaults)** — ID ~5 min, access ~15 min (configurable).

### Step A — Discovery (optional)

```http
GET {SSO}/.well-known/openid-configuration
```

Use `authorization_endpoint`, `token_endpoint`, `userinfo_endpoint`, `jwks_uri`.

### Step B — Generate PKCE

```text
code_verifier  = URL-safe random string (43–128 chars)
code_challenge = BASE64URL( SHA-256(code_verifier) )
```

Store `code_verifier` and a random `state` until the callback.

**Browser / Electron renderer example:**

```javascript
function randomVerifier(length = 64) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

async function s256Challenge(verifier) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
```

### Step C — Redirect to authorize

```
{SSO}/oauth2/authorize
  ?client_id=YOUR_CLIENT_ID
  &redirect_uri=YOUR_EXACT_REDIRECT_URI
  &response_type=code
  &scope=openid%20profile%20email%20groups
  &state=RANDOM
  &nonce=RANDOM
  &code_challenge=CHALLENGE
  &code_challenge_method=S256
```

| Param | Required | Notes |
|-------|----------|--------|
| `client_id` | Yes | Registered app |
| `redirect_uri` | Yes | Exact match |
| `response_type` | Yes | `code` only |
| `scope` | Yes | At least `openid`; add `admin` for admin APIs |
| `code_challenge` / `code_challenge_method` | Yes | `S256` |
| `state` | Recommended | CSRF; verify on return |
| `nonce` | Recommended | Bound into ID token |

If the user has no SSO session, they are sent to `/login` (or `/signup`), then back to authorize.

### Step D — Handle callback

SSO redirects to:

```
YOUR_REDIRECT_URI?code=...&state=...
```

1. Verify `state`.
2. Exchange `code` (next step).
3. Do not put tokens in the URL.

### Step E — Exchange code for tokens

```http
POST {SSO}/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTH_CODE
&redirect_uri=YOUR_EXACT_REDIRECT_URI
&client_id=YOUR_CLIENT_ID
&code_verifier=CODE_VERIFIER
```

**Success:**

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

### Step F — Userinfo

```http
GET {SSO}/oauth2/userinfo
Authorization: Bearer <access_token>
```

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "groups": ["Admins"],
  "attributes": { "department": "engineering", "clearance": 5 },
  "tenant_id": "tenant-uuid"
}
```

`attributes` are ABAC subject attributes.

### Step G — Refresh

```http
POST {SSO}/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token=CURRENT_REFRESH_TOKEN
&client_id=YOUR_CLIENT_ID
```

Always replace the stored refresh token with the new one.

### Step H — Logout

```http
POST {SSO}/session/logout
```

Clears the SSO session cookie and revokes refresh tokens tied to that session. Also clear local tokens in your app. Use `credentials: "include"` when calling from a browser if you rely on the cookie.

---

## 5. Platform guides

### A. Web SPA (React, Vue, Angular, plain JS)

1. Register redirect URI, e.g. `http://localhost:3000/callback`.
2. On Login: generate PKCE + `state` → full-page redirect to authorize.
3. On `/callback`: exchange code → store tokens (memory or `sessionStorage`).
4. Call your APIs with `Authorization: Bearer <access_token>`, or call SSO userinfo.
5. Enable CORS on SSO (`CORS_ORIGINS`) for your SPA origin if you call SSO with `fetch` from the browser.

Minimal start:

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

Libraries: `oidc-client-ts`, `oauth4webapi`.  
Working reference: the repo’s [`frontend/`](../../frontend/) React app.

---

### B. Polymer (web components)

Polymer apps are browser SPAs — use the **same OIDC + PKCE** flow as §5A.

Suggested pattern:

1. Create an `<sso-auth>` element that owns login/logout and token storage.
2. On `ready` / `connectedCallback`, if the path is your callback and `code` is present, exchange tokens.
3. Expose `login()`, `logout()`, `getAccessToken()`, `getUser()`.
4. Other elements consume tokens via events or a shared service.

Register a dedicated redirect URI for the Polymer origin (e.g. `http://localhost:8081/callback`).

---

### C. Electron

Prefer the **system browser** or a dedicated auth window, then return via loopback or custom protocol.

1. Register one of:
   - Loopback: `http://127.0.0.1:53100/callback` (tiny local HTTP server in main process), or
   - Custom protocol: `myapp://auth/callback` (`app.setAsDefaultProtocolClient`)
2. Generate PKCE in the **main** process when possible.
3. Open authorize with `shell.openExternal()` or `BrowserWindow`.
4. Capture `code` → exchange in main → store tokens with `safeStorage` / OS keychain.
5. Pass only what the renderer needs (or use a privileged preload API).

Do **not** embed a password form that talks to SSO with a password grant — this server does not expose ROPC for third-party apps. Users authenticate on SSO’s hosted login during authorize.

---

### D. Mobile (iOS / Android)

| Platform | Recommended |
|----------|-------------|
| iOS | `ASWebAuthenticationSession` / AppAuth |
| Android | AppAuth + Chrome Custom Tabs |

1. Register a redirect URI (app link or custom scheme), e.g. `com.example.app:/oauth2redirect`.
2. Start authorize in the system browser session.
3. Receive `code` → exchange with `code_verifier`.
4. Store tokens in Keychain / EncryptedSharedPreferences.

Same OIDC steps as §4.

---

## 6. Optional first-party login / signup JSON

Use these only for a **first-party** UI that can call SSO with cookies (`credentials: "include"`) and correct CORS.

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

`201` + sets `sso_session` cookie.

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

If MFA is enrolled and code is missing/wrong: `401` with `"mfa_required": true`.

After cookie login/signup, still run **OIDC authorize + PKCE** (full-page redirect to `{SSO}/oauth2/authorize`) so your app receives access/refresh tokens for your `client_id`. The session cookie is sent on that navigation to the SSO host.

For third-party, Electron, and mobile clients, prefer pure authorize redirect (hosted `/login`) so passwords never enter your process.

---

## 7. MFA (TOTP)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/mfa/totp/enroll` | Session cookie | Returns `{ factor_id, secret, otpauth_uri }` |
| `POST` | `/mfa/totp/verify` | Session cookie | Body `{ "code" }` → `{ "verified": true }`; refreshes admin step-up |

Enrollment is bound to the SSO session cookie. After enroll, show `otpauth_uri` / secret in an authenticator app, then verify.

Admin API **writes** need a recent MFA step-up (within 15 minutes). If stale:

```json
{
  "title": "Step-up required",
  "status": 401,
  "detail": "MFA step-up required for admin writes",
  "challenge": "mfa_step_up"
}
```

Prompt for a TOTP code → `POST /mfa/totp/verify` → retry the admin call.

---

## 8. Using tokens in your app

1. Attach `Authorization: Bearer <access_token>` to your own APIs, or to SSO userinfo/admin endpoints.
2. Decode the access token (JWT) only for UX hints (`email`, `is_admin`, `groups`). **Always validate** on a backend with JWKS if you enforce authorization server-side:

```http
GET {SSO}/.well-known/jwks.json
```

3. On `401` / expiry, use refresh rotation; on refresh failure, send the user through authorize again.
4. Claims of interest: `sub`, `email`, `name`, `groups`, `tenant_id`, `is_admin`, `scope`, `sid`.

---

## 9. Access control (ABAC / PBAC)

On `app:access` (OIDC authorize, token issue, SAML SSO), SSO evaluates enabled policies with **deny-overrides**:

- No enabled policy for the action → allow (backward compatible).
- Matching **deny** wins.
- Else matching **allow** grants.
- Else deny if policies exist for the action.

**Subject attributes** (user): e.g. `department`, `clearance` — returned in userinfo as `attributes`.  
**Resource attributes** (app): e.g. `sensitivity`, `owner_department`.  
Built-ins also available in policies: `subject.email`, `subject.is_admin`, `subject.groups`, `env.hour`, etc.

Dry-run (admin):

```http
POST /v1/access/evaluate
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "user_id": "<uuid>",
  "client_id": "demo-oidc-app",
  "action": "app:access"
}
```

If your user’s authorize fails with `access_denied`, check policies and attributes — not only credentials.

---

## 10. Admin API (tenant operators)

Requires Bearer access token for a user with `is_admin` and typically `admin` in scope. Request scope:

```text
openid profile email groups admin
```

| Area | Endpoints |
|------|-----------|
| Apps | `GET/POST /v1/apps`, `PATCH /v1/apps/{id}`, `PUT /v1/apps/{id}/assignments` |
| Users | `GET /v1/users` (cursor pagination) |
| Attributes | `GET/PUT /v1/users/{id}/attributes`, `GET/PUT /v1/apps/{id}/attributes` |
| Policies | `GET/POST /v1/policies`, `PATCH/DELETE /v1/policies/{id}` |
| Evaluate | `POST /v1/access/evaluate` |
| Audit | `GET /v1/audit-events` (`format=csv` for export) |
| Sync stubs | `GET/PUT /v1/sync-cursors` |

Writes require MFA step-up when the session’s `admin_step_up_at` is missing or older than 15 minutes (§7).

---

## 11. SAML (enterprise apps)

1. Register app with `protocol: "saml"` and config: `acs_url`, `entity_id`, `audience`.
2. IdP metadata: `GET {SSO}/saml/metadata/{tenant_slug}`
3. SSO: `GET|POST {SSO}/saml/sso`
   - **SP-initiated:** `SAMLRequest` (+ optional `RelayState`)
   - **IdP-initiated:** `GET /saml/sso?client_id=your-saml-client-id`
4. Your ACS receives `SAMLResponse` (Base64). Validate signature, audience, recipient, and time window. Assertions are short-lived and single-use on the IdP.

PBAC/ABAC `app:access` applies to SAML SSO as well.

---

## 12. SCIM (provisioning)

Machine clients use a per-tenant SCIM bearer (seed prints a demo token).

| Path | Notes |
|------|--------|
| `/scim/v2/Users` | Create/read/PUT/PATCH/delete; filter `userName` / `externalId` |
| `/scim/v2/Groups` | List/create/get |
| Bulk | Returns `501` in v1 |

Deactivating a user revokes sessions. Idempotent create on `externalId`.

---

## 13. Checklist and common errors

### New client checklist

1. [ ] Choose OIDC (default) or SAML  
2. [ ] Register app with exact redirect / ACS URLs  
3. [ ] Implement PKCE authorize → callback → token  
4. [ ] Verify `state` (and optionally `nonce`)  
5. [ ] Store tokens securely; handle refresh rotation  
6. [ ] Call `/oauth2/userinfo` (includes `attributes`)  
7. [ ] Implement logout (local clear + `/session/logout`)  
8. [ ] Handle `access_denied` from authorize/token (policies)  
9. [ ] If admin UI: request `admin` scope + MFA step-up UX  
10. [ ] Test missing PKCE, wrong redirect, reused refresh token  

### Common errors

| Symptom | Cause | Fix |
|---------|--------|-----|
| Authorize `400` PKCE required | Missing / non-S256 challenge | Always send S256 PKCE |
| `redirect_uri mismatch` | URI not exact | Register and use identical string |
| Token `invalid_grant` | Bad/expired code or wrong verifier | Exchange quickly; match PKCE |
| Refresh `invalid_grant` | Reused rotated refresh | Keep only the latest refresh token |
| `access_denied` | PBAC/ABAC denied `app:access` | Adjust policies/attributes or evaluate dry-run |
| Login page instead of code | No SSO session | User must sign in / sign up |
| Admin write `401` + `mfa_step_up` | Stale step-up | `POST /mfa/totp/verify` then retry |
| CORS errors from SPA | Cross-origin `fetch` | Set `CORS_ORIGINS`; prefer full-page authorize redirect |

---

## 14. Endpoint quick reference

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/.well-known/openid-configuration` | OIDC discovery |
| `GET` | `/.well-known/jwks.json` | Signing keys |
| `GET` | `/oauth2/authorize` | Start login (PKCE) |
| `POST` | `/oauth2/token` | Code exchange / refresh |
| `GET` | `/oauth2/userinfo` | Identity + ABAC attributes |
| `GET`/`POST` | `/login`, `/login/json` | Hosted / API login |
| `GET`/`POST` | `/signup`, `/signup/json` | Hosted / API signup |
| `POST` | `/session/logout` | Single logout |
| `GET` | `/session/me` | Session metadata (cookie) |
| `POST` | `/mfa/totp/enroll` | Enroll TOTP |
| `POST` | `/mfa/totp/verify` | Verify / step-up |
| `GET`/`POST` | `/saml/sso` | SAML sign-on |
| `GET` | `/saml/metadata/{tenant}` | SAML IdP metadata |
| `*` | `/v1/*` | Admin + access control APIs |
| `*` | `/scim/v2/*` | Provisioning |

Interactive explorer: `{SSO}/docs`.

---

## Smoke test (demo OIDC app)

1. Start SSO on port `8000`.  
2. Point a client at redirect `http://localhost:3000/callback` with `client_id=demo-oidc-app`.  
3. Run PKCE authorize → sign in → receive `code` → token → userinfo.  
4. Confirm `email` / `attributes` from userinfo.  
5. Optionally open the reference SPA: `cd frontend && npm run dev`.

That validates the integration path before you wire production redirect URIs and branding.
