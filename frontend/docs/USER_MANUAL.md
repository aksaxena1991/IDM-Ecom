# SSO Portal — Frontend User Manual

How to use the **React SSO Portal** at http://localhost:3000.

For the full feature list see [docs/FEATURES.md](../../docs/FEATURES.md).  
For API / integration details see [CLIENT_INTEGRATION_GUIDE.md](../../backend/docs/CLIENT_INTEGRATION_GUIDE.md).

---

## 1. Getting started

### Prerequisites

1. Backend running on http://localhost:8000 (Postgres + Redis + seed).
2. Frontend:

```bash
cd frontend
npm install
npm run dev
```

3. Open http://localhost:3000

### Demo admin (from backend seed)

| Field | Value |
|-------|--------|
| Email | `aksaxena1991@gmail.com` |
| Password | `@Admin2026` |
| Tenant | `demo` |

After first login you should see **Admin** in the header and admin nav links.

### Environment (optional)

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_SSO_BASE_URL` | `http://localhost:8000` | SSO API |
| `VITE_OIDC_CLIENT_ID` | `demo-oidc-app` | Portal OIDC client |
| `VITE_OIDC_REDIRECT_URI` | `http://localhost:3000/callback` | Must match app config |
| `VITE_OIDC_SCOPE` | `openid profile email groups admin` | Include `admin` for console |

---

## 2. Sign in (`/login`)

You can sign in two ways:

### A. Continue with SSO

1. Click **Continue with SSO**.
2. Browser redirects to the SSO authorize page (hosted login if no session).
3. After success you return to `/callback`, then the **Dashboard**.

Use this when you already have (or will create) an SSO session on the backend host.

### B. Email and password

1. Enter tenant slug (default `demo`), email, and password.
2. Click **Sign in**.
3. If MFA is enrolled, enter the 6-digit authenticator code when prompted.
4. The portal creates a session cookie on the SSO host, then completes OIDC to obtain tokens for the SPA.

### Troubleshooting

| Symptom | What to do |
|---------|------------|
| Redirect loops / callback error | Confirm backend app redirect URI includes `http://localhost:3000/callback` |
| `access_denied` | Your user failed PBAC/RBAC/ABAC for `demo-oidc-app` — ask an admin or re-seed |
| MFA required | Enroll on **Security**, or enter code on login |
| CORS errors | Backend `CORS_ORIGINS` must include `http://localhost:3000` |

---

## 3. Register (`/register`)

1. Open **Create account** / `/register`.
2. Enter name, email, password (and confirm).
3. Submit — backend creates the user and assigns the default **`user`** role when seeded.
4. The portal continues OIDC so you land on the Dashboard signed in.

New users are **not** admins unless an admin assigns the `admin` role or sets `is_admin`.

---

## 4. Dashboard (`/dashboard`)

Shows your identity from `/oauth2/userinfo`:

| Section | Contents |
|---------|----------|
| **Profile** | Name, email, subject (`sub`), tenant, groups, console level |
| **RBAC** | Assigned **roles** and flattened **permissions** |
| **ABAC attributes** | Custom attributes (e.g. department, clearance) |
| **Session** | Token type, TTL, scopes |

Use this page to verify claims after role or attribute changes (re-login or wait for token refresh if claims look stale).

---

## 5. Security (`/security`)

Manage TOTP MFA and view session metadata.

### Enroll TOTP

1. Click **Enroll TOTP**.
2. Copy the secret or use the `otpauth://` URI in Google Authenticator / Authy / 1Password.
3. Enter a current 6-digit code and **Verify**.
4. Session shows MFA verified; admin step-up timestamp updates.

### Why step-up matters

Admin **writes** (create app, save roles, edit policies, …) require a fresh MFA verify within **15 minutes**. If a write returns step-up required, the portal opens a modal to enter a TOTP code and retries.

---

## 6. Sign out

Click **Sign out** in the header. This calls remote logout, clears stored tokens, and returns you to login.

---

## 7. Admin features

Visible only if your access token indicates admin (`is_admin`, role `admin`, or permission `admin:access`).

### 7.1 Apps (`/admin/apps`)

**Purpose:** Register and manage OIDC applications; set ABAC resource attributes.

| Task | Steps |
|------|--------|
| List apps | Page loads tenant apps automatically |
| Create OIDC app | Enter name + redirect URIs (one per line) → Create |
| Enable / disable | Use status controls on the app |
| Edit resource attributes | Select app → edit JSON attributes → Save |

Example attributes:

```json
{
  "sensitivity": "internal",
  "owner_department": "engineering"
}
```

### 7.2 Users (`/admin/users`)

**Purpose:** Search directory, edit ABAC subject attributes, assign **multiple** RBAC roles.

| Task | Steps |
|------|--------|
| Search | Type email fragment → Search |
| Edit attributes | **Attributes** → edit JSON → Save attributes |
| Assign roles | **Roles** → check/uncheck roles → Save roles |

Example attributes:

```json
{
  "department": "finance",
  "clearance": 3,
  "title": "analyst"
}
```

Role changes affect the next token issue / userinfo refresh and all PBAC checks that use `subject.roles` / `subject.permissions`.

### 7.3 Roles (`/admin/roles`)

**Purpose:** Create and maintain RBAC roles and their permissions.

| Task | Steps |
|------|--------|
| Create role | Name (e.g. `finance_ops`), description, permissions (one per line) → Create |
| Edit | Select role → change description/permissions → Save |
| Delete | Non-system roles only → Delete |

Common permissions:

| Permission | Typical meaning |
|------------|-----------------|
| `admin:access` | Use admin APIs / console |
| `apps:write` / `apps:read` | App management capability (claim; policies may also use it) |
| `portal:access` | Default end-user portal permission |

System roles (`admin`, `user`) cannot be deleted.

### 7.4 Policies (`/admin/policies`)

**Purpose:** PBAC rules for `app:access` (deny-overrides).

| Task | Steps |
|------|--------|
| Create | Name, effect (allow/deny), priority, optional `client_id` match, conditions JSON → Create |
| List / review | See existing tenant policies |
| Disable / patch / delete | Via API or UI controls where available |

Example condition (role **or** department):

```json
{
  "any": [
    { "attr": "subject.roles", "op": "contains", "value": "app_operator" },
    { "attr": "subject.department", "op": "eq", "value": "engineering" }
  ]
}
```

Tips:

- Higher **priority** wins within the same effect (deny still beats allow).
- If any enabled policy targets `app:access` and none allow the user → access denied.
- Seed includes `allow-active-users` so normal signups can log in.

### 7.5 Evaluate (`/admin/access`)

**Purpose:** Dry-run an access decision without logging the user in.

1. Pick or paste a **user id** and **client id** (e.g. `demo-oidc-app`).
2. Run evaluate.
3. Read `allowed`, `reason`, `message`, and `matched_policies`.

Use this after changing roles, attributes, or policies.

### 7.6 Audit (`/admin/audit`)

**Purpose:** Review security-relevant events (role create, attribute set, policy change, signup, …).

- Browse recent events in the list.
- Export CSV when offered by the UI / API (`format=csv`).

---

## 8. Typical admin workflows

### Grant a user app access by role

1. **Roles** → create `app_operator` (or use seed role) with needed permissions.
2. **Users** → select user → **Roles** → check `app_operator` → Save.
3. **Policies** → ensure an allow rule uses `subject.roles` `contains` `app_operator` (seed includes `allow-app-operator-role`).
4. **Evaluate** → confirm `allowed: true`.
5. Ask the user to sign in again (or refresh tokens).

### Restrict a sensitive app by clearance

1. **Apps** → set resource attribute `"sensitivity": "restricted"`.
2. **Users** → set `"clearance": 1` (or higher).
3. Seed deny policy `deny-restricted-without-clearance` blocks clearance &lt; 3.
4. **Evaluate** to verify.

### Promote a console admin via RBAC

1. Assign the system **`admin`** role (includes `admin:access`), **or** create a role with permission `admin:access`.
2. User re-authenticates; Admin nav appears.

---

## 9. Screen map

```text
/login          Sign in (SSO or password + MFA)
/register       Create account
/callback       OIDC code exchange (automatic)
/dashboard      Profile, RBAC, ABAC, session
/security       TOTP enroll / verify
/admin/apps     Applications + resource attributes
/admin/users    Directory + attributes + role assignment
/admin/roles    Role & permission CRUD
/admin/policies PBAC policy CRUD
/admin/access   Access decision dry-run
/admin/audit    Audit log
```

---

## 10. Related docs

| Doc | Location |
|-----|----------|
| Feature catalog | [docs/FEATURES.md](../../docs/FEATURES.md) |
| Backend operator manual | [backend/docs/USER_MANUAL.md](../../backend/docs/USER_MANUAL.md) |
| Client integration | [CLIENT_INTEGRATION_GUIDE.md](../../backend/docs/CLIENT_INTEGRATION_GUIDE.md) |
| Database tables | [DATABASE_TABLES.md](../../backend/docs/DATABASE_TABLES.md) |
| Frontend README | [../README.md](../README.md) |
