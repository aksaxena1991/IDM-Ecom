# SSO Backend — Database Tables Guide

This document lists **every PostgreSQL table** created by the SSO backend migrations, what each one stores, and how it is used at runtime.

| | |
|---|---|
| **ORM models** | [`app/models/entities.py`](../app/models/entities.py) |
| **Migrations** | [`alembic/versions/`](../alembic/versions/) (`001` core, `002` ABAC/PBAC, `003` RBAC) |
| **Column-level detail** | Also see [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) |

Most business data is **tenant-scoped**. Always filter by `tenant_id` when querying.

---

## Quick map (by feature)

| Feature area | Tables |
|--------------|--------|
| Multi-tenancy | `tenants` |
| Identity & directory | `users`, `groups`, `group_memberships` |
| Applications & entitlements | `applications`, `app_assignments` |
| RBAC | `roles`, `role_permissions`, `user_roles` |
| ABAC | `user_attributes`, `resource_attributes` |
| PBAC | `access_policies` |
| Sessions & OIDC tokens | `sessions`, `refresh_tokens`, `auth_codes` |
| MFA | `mfa_factors` |
| Cryptography | `signing_keys` |
| SAML | `saml_assertion_replays` (+ `applications.config`) |
| SCIM / sync | `scim_tokens`, `sync_cursors` |
| Audit | `audit_events` |

---

## Entity relationship (high level)

```text
tenants
  ├── users
  │     ├── group_memberships ──────────────► groups
  │     ├── user_roles ──► roles ──► role_permissions
  │     ├── mfa_factors
  │     ├── user_attributes                 (ABAC subject)
  │     ├── sessions
  │     │     └── refresh_tokens ──────────► applications
  │     └── (may appear in app_assignments)
  ├── groups
  ├── roles ──► role_permissions
  ├── applications
  │     ├── app_assignments
  │     ├── resource_attributes             (ABAC resource)
  │     └── refresh_tokens
  ├── access_policies                       (PBAC)
  ├── signing_keys
  ├── audit_events
  ├── scim_tokens
  └── sync_cursors

auth_codes                  (OIDC auth codes; Redis is primary)
saml_assertion_replays      (SAML anti-replay durable; Redis is primary)
```

---

## 1. Core identity & tenancy

### `tenants`

**What it is:** One row per customer / organization.

**Use:** Root of multi-tenancy. Users, apps, roles, and policies all hang off a tenant. Signup and login use `slug` (e.g. `demo`) to pick the org.

| Key fields | Meaning |
|------------|---------|
| `id` | Tenant UUID |
| `name` | Display name |
| `slug` | Unique short id used in APIs / signup |

---

### `users`

**What it is:** People (identities) in a tenant.

**Use:** Password login, OIDC/SAML subject (`sub`), admin console actors, SCIM Users. `is_admin` is a legacy/admin flag; RBAC permission `admin:access` can also grant console access.

| Key fields | Meaning |
|------------|---------|
| `tenant_id` | Owning tenant |
| `email` | Unique per tenant |
| `password_hash` | Argon2id hash (null if SSO-only / SCIM) |
| `status` | `active` / `suspended` / `deprovisioned` |
| `is_admin` | Tenant operator flag |
| `external_id` | Directory / SCIM external id |

---

### `groups`

**What it is:** Named collections of users (directory or manual).

**Use:** Group membership appears in OIDC claims as `groups`. Can be used in PBAC via `subject.groups`. SCIM Groups sync into this table.

| Key fields | Meaning |
|------------|---------|
| `name` | Unique per tenant |
| `source` | `manual` or `directory` |
| `external_id` | External directory id |

---

### `group_memberships`

**What it is:** Many-to-many link between users and groups.

**Use:** Builds the `groups` claim and `subject.groups` for policy evaluation.

| Key fields | Meaning |
|------------|---------|
| `group_id` + `user_id` | Composite membership |

---

## 2. Applications & entitlements

### `applications`

**What it is:** Client apps that use this SSO (OIDC or SAML).

**Use:** OIDC authorize/token (`client_id`), SAML SSO (`acs_url` / entity id in `config`), resource side of ABAC (`resource_attributes`).

| Key fields | Meaning |
|------------|---------|
| `client_id` | Public app identifier |
| `protocol` | `oidc` or `saml` |
| `status` | `active` / `disabled` |
| `config` | JSON: redirect URIs, ACS URL, audience, etc. |

---

### `app_assignments`

**What it is:** Entitlement registry — which users or groups are assigned to an app.

**Use:** Admin “assignments” API. Runtime `app:access` is driven primarily by **PBAC + RBAC + ABAC**; assignments are the planned entitlement catalog.

| Key fields | Meaning |
|------------|---------|
| `application_id` | Target app |
| `principal_type` | `user` or `group` |
| `principal_id` | User or group UUID |

---

## 3. RBAC (roles)

### `roles`

**What it is:** Tenant-scoped RBAC roles that admins create (e.g. `admin`, `user`, `app_operator`, `finance_ops`).

**Use:** Users can hold **multiple** roles. Role names are exposed as `subject.roles` / token claim `roles` for PBAC conditions (`contains`).

| Key fields | Meaning |
|------------|---------|
| `name` | Unique per tenant |
| `is_system` | System roles (`admin`, `user`) cannot be deleted |
| `description` | Human-readable purpose |

---

### `role_permissions`

**What it is:** Permission strings attached to a role (e.g. `admin:access`, `apps:write`).

**Use:** Flattened into `subject.permissions` and token `permissions`. Holding `admin:access` (or `admin:*`) grants admin API access even without `users.is_admin`.

| Key fields | Meaning |
|------------|---------|
| `role_id` | Parent role |
| `permission` | Permission string |

---

### `user_roles`

**What it is:** Many-to-many assignment of roles to users.

**Use:** `PUT /v1/users/{id}/roles`. Signup assigns the default `user` role when it exists. Seed assigns `admin` + `user` to the demo admin.

| Key fields | Meaning |
|------------|---------|
| `user_id` + `role_id` | Assignment |
| `assigned_at` | When it was granted |

---

## 4. ABAC (attributes)

### `user_attributes`

**What it is:** Custom key/value attributes on a **user** (the subject).

**Use:** ABAC inputs such as `department`, `clearance`. Returned on `/oauth2/userinfo` as `attributes`. Available in policies as `subject.<key>`.

Built-ins (`email`, `is_admin`, `groups`, `roles`, `permissions`, `status`) are **not** stored here — they are computed at evaluation time.

---

### `resource_attributes`

**What it is:** Custom key/value attributes on an **application** (the resource).

**Use:** ABAC inputs such as `sensitivity`, `owner_department`. Available in policies as `resource.<key>`.

---

## 5. PBAC (policies)

### `access_policies`

**What it is:** Data-driven allow/deny rules evaluated by the policy engine.

**Use:** On every `app:access` check (OIDC authorize/token, SAML SSO). Algorithm is **deny-overrides**:

1. No enabled policy for the action → allow (backward compatible)
2. Matching deny wins
3. Else matching allow grants
4. Else deny (“No access policy allows this request”)

Conditions may reference RBAC (`subject.roles`, `subject.permissions`), ABAC attributes, and environment (`environment.hour`, `environment.weekday`).

| Key fields | Meaning |
|------------|---------|
| `effect` | `allow` or `deny` |
| `priority` | Higher wins within the same effect set |
| `actions` | e.g. `["app:access"]` |
| `resource_match` | Optional exact filters (e.g. `client_id`) |
| `conditions` | Boolean tree (`all` / `any` + ops) |
| `enabled` | Soft on/off |

---

## 6. Sessions, MFA & tokens

### `sessions`

**What it is:** Server-side SSO sessions (Postgres is system of record; Redis is a write-through cache).

**Use:** Cookie session after login; OIDC `sid` claim; logout; MFA / admin step-up timestamps.

| Key fields | Meaning |
|------------|---------|
| `user_id` / `tenant_id` | Session owner |
| `expires_at` | Idle timeout |
| `absolute_expires_at` | Hard max lifetime |
| `revoked_at` | Soft revoke on logout / deactivate |
| `mfa_verified_at` | Login MFA completed |
| `admin_step_up_at` | Recent MFA for admin writes (15 min window) |

---

### `mfa_factors`

**What it is:** Registered MFA devices for a user.

**Use:** TOTP enroll/verify, login MFA challenge, admin step-up. `webauthn` / `push` are reserved enum values.

| Key fields | Meaning |
|------------|---------|
| `type` | `totp` (live) |
| `secret_ref` | Encrypted TOTP secret |

---

### `refresh_tokens`

**What it is:** Persisted OIDC refresh tokens (hashed), with rotation family tracking.

**Use:** `grant_type=refresh_token`. Reuse of an already-rotated token revokes the whole family.

| Key fields | Meaning |
|------------|---------|
| `token_hash` | Hash of the opaque refresh token |
| `family_id` | Rotation family |
| `replaced_by` | Next token in the chain |
| `session_id` / `application_id` | Binding |

---

### `auth_codes`

**What it is:** Optional Postgres fallback for OIDC authorization codes.

**Use:** Primary store is **Redis**. This table is a model/fallback; short-lived codes bind user, client, PKCE challenge, and redirect URI.

---

## 7. Cryptography & federation

### `signing_keys`

**What it is:** JWT signing key metadata (ES256 / RS256). Private key material is referenced by path, not stored as plaintext in the row.

**Use:** Sign ID/access tokens; serve JWKS at `/.well-known/jwks.json`; SAML assertion signing when applicable.

| Key fields | Meaning |
|------------|---------|
| `kid` | Key id in JWTs / JWKS |
| `algorithm` | e.g. `ES256`, `RS256` |
| `public_key` | PEM public key |
| `private_key_ref` | Path / reference to private key |
| `retired_at` | Key rotation off-ramp |

---

### `saml_assertion_replays`

**What it is:** Seen SAML assertion IDs until they expire.

**Use:** Anti-replay protection for SAML SSO — reject reused `AssertionID` values.

---

## 8. Provisioning, sync & audit

### `scim_tokens`

**What it is:** Hashed bearer tokens for SCIM clients.

**Use:** Authenticate `/scim/v2/*` requests. Deactivating a user via SCIM should revoke their sessions.

---

### `sync_cursors`

**What it is:** Resume tokens for directory / HR sync jobs (stub for incremental sync).

**Use:** Admin `GET/PUT /v1/sync-cursors` — stores `last_token` per `(tenant_id, source)`.

---

### `audit_events`

**What it is:** Append-only audit trail of security-relevant actions.

**Use:** Admin audit UI / CSV export. Records signup, login, role changes, policy writes, attribute updates, etc.

| Key fields | Meaning |
|------------|---------|
| `actor` | Who did it (email or id) |
| `action` | e.g. `role.create`, `user.roles.set` |
| `target` | Affected object id |
| `payload` | Extra JSON context |
| `occurred_at` | When |

---

## How access control uses these tables together

On `app:access` (OIDC authorize / token / SAML SSO):

1. Load **user** + status (`users`)
2. Load **RBAC**: role names + permissions (`user_roles` → `roles` → `role_permissions`)
3. Load **ABAC subject** attrs (`user_attributes`) + built-ins (email, groups, `is_admin`, …)
4. Load **ABAC resource** attrs (`resource_attributes` + app fields)
5. Load enabled **PBAC** rules (`access_policies`)
6. Evaluate with **deny-overrides**

Admin console access checks `users.is_admin` **or** permission `admin:access` from RBAC.

---

## Applying / refreshing schema

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
python scripts/seed.py   # demo tenant, roles, sample policies
```

| Migration | Adds |
|-----------|------|
| `001_initial_schema` | Tenants, users, groups, apps, sessions, tokens, MFA, audit, SCIM, SAML replay, signing keys |
| `002_abac_pbac` | `user_attributes`, `resource_attributes`, `access_policies` |
| `003_rbac_roles` | `roles`, `role_permissions`, `user_roles` |

---

## Demo seed (typical rows)

After `python scripts/seed.py` you typically have:

| Area | Example data |
|------|----------------|
| Tenant | slug `demo` |
| Admin user | `aksaxena1991@gmail.com` (`is_admin=true`) |
| Roles | `admin`, `user`, `app_operator` |
| Apps | `demo-oidc-app`, `demo-saml-app` |
| Policies | `allow-active-users`, deny/allow ABAC + role examples |
| Attributes | Admin: `department=engineering`, `clearance=5`; apps: `sensitivity=internal` |
