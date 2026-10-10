# SSO Backend — Database Schema Guide

This document describes every PostgreSQL table used by the SSO backend, what it stores, and how it is used at runtime.

Schema source of truth:

- ORM models: [`app/models/entities.py`](../app/models/entities.py)
- Migrations: [`alembic/versions/`](../alembic/versions/)

Most business tables are **tenant-scoped** (`tenant_id`). Queries should always filter by tenant.

---

## Entity relationship (high level)

```text
tenants
  ├── users
  │     ├── group_memberships ──► groups
  │     ├── user_roles ──► roles ──► role_permissions   (RBAC)
  │     ├── mfa_factors
  │     ├── user_attributes          (ABAC subject)
  │     ├── sessions
  │     │     └── refresh_tokens ──► applications
  │     └── (referenced by app_assignments as principal)
  ├── groups
  ├── roles
  │     └── role_permissions
  ├── applications
  │     ├── app_assignments
  │     ├── resource_attributes      (ABAC resource)
  │     └── refresh_tokens
  ├── access_policies                (PBAC over RBAC + ABAC)
  ├── signing_keys
  ├── audit_events
  ├── scim_tokens
  └── sync_cursors

auth_codes                 (OIDC codes; Redis is primary store)
saml_assertion_replays     (SAML anti-replay)
```

---

## Table catalog

### 1. `tenants`

**Purpose:** One row per customer / organization. Root of multi-tenancy.

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | Tenant identifier |
| `name` | string | Display name |
| `slug` | string (unique) | URL-friendly key (e.g. `demo`) |
| `created_at` | timestamptz | Created time |

**Used for:** Login/signup `tenant_slug`, SAML metadata paths, scoping all tenant data.

---

### 2. `users`

**Purpose:** People who can sign in (workforce users and admins).

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | Subject (`sub`) in tokens |
| `tenant_id` | UUID FK → tenants | Tenant scope |
| `external_id` | string? | Directory / SCIM external id |
| `email` | string | Unique per tenant |
| `name` | string? | Display name |
| `password_hash` | text? | Argon2id hash (null for federated-only users) |
| `status` | enum | `active` / `suspended` / `deprovisioned` |
| `is_admin` | bool | Can call `/v1` admin APIs |
| `created_at` / `updated_at` | timestamptz | Audit timestamps |

**Used for:** Login, signup, OIDC/SAML identity, SCIM Users, admin user list, access decisions (`subject.is_admin`, `subject.status`).

---

### 3. `groups`

**Purpose:** Named collections of users (manual or synced from a directory).

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `tenant_id` | UUID FK → tenants | |
| `name` | string | Unique per tenant |
| `external_id` | string? | SCIM / directory id |
| `source` | enum | `directory` or `manual` |
| `created_at` | timestamptz | |

**Used for:** Group claims in tokens, app assignments by group, SCIM Groups.

---

### 4. `group_memberships`

**Purpose:** Many-to-many link between users and groups.

| Column | Type | Notes |
|--------|------|--------|
| `group_id` | UUID PK/FK → groups | |
| `user_id` | UUID PK/FK → users | |

**Used for:** Resolving `groups` claim on ID/access tokens and userinfo.

---

### 5. `applications`

**Purpose:** Registered OIDC or SAML applications (relying parties / service providers).

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `tenant_id` | UUID FK → tenants | |
| `name` | string | Display name |
| `client_id` | string (unique) | OIDC client id / SAML client key |
| `client_secret_hash` | text? | Optional confidential client secret |
| `protocol` | enum | `oidc` or `saml` |
| `status` | enum | `active` or `disabled` |
| `config` | JSONB | Protocol config (redirect URIs, ACS, audience, etc.) |
| `created_at` / `updated_at` | timestamptz | |

**Typical `config` keys**

- OIDC: `redirect_uris` (exact match list; no wildcards)
- SAML: `acs_url`, `entity_id`, `audience`

**Used for:** Authorize/token validation, SAML SSO, admin Apps UI, access control resource context (`client_id`, protocol, status).

---

### 6. `app_assignments`

**Purpose:** Which users or groups are allowed to use an application (assignment catalog).

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `application_id` | UUID FK → applications | |
| `principal_type` | enum | `user` or `group` |
| `principal_id` | UUID | User or group id |

Unique on `(application_id, principal_type, principal_id)`.

**Used for:** Admin “assignments” API. (Runtime `app:access` today is driven primarily by PBAC policies + attributes; assignments are the entitlement registry.)

---

### 7. `user_attributes`

**Purpose:** ABAC **subject** attributes (custom key/value pairs on a user).

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `attr_key` | string | e.g. `department`, `clearance` |
| `attr_value` | JSONB | Scalar or list |
| `created_at` / `updated_at` | timestamptz | |

Unique on `(user_id, attr_key)`.

**Not stored here (built-ins):** `email`, `is_admin`, `status`, `groups` — derived from `users` / memberships at decision time.

**Used for:** Policy evaluation (`subject.*`), exposed on `/oauth2/userinfo` as `attributes`.

---

### 8. `resource_attributes`

**Purpose:** ABAC **resource** attributes on an application.

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `application_id` | UUID FK → applications | |
| `attr_key` | string | e.g. `sensitivity`, `owner_department` |
| `attr_value` | JSONB | |
| `created_at` / `updated_at` | timestamptz | |

**Used for:** Policy evaluation (`resource.*`) on OIDC authorize/token and SAML SSO.

---

### 9. `access_policies`

**Purpose:** PBAC rules (data-driven allow/deny). Evaluated with **deny-overrides**.

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `tenant_id` | UUID FK → tenants | |
| `name` | string | Unique per tenant |
| `description` | text? | Human description |
| `effect` | enum | `allow` or `deny` |
| `priority` | int | Higher wins within same effect set |
| `enabled` | bool | Soft disable |
| `actions` | JSONB list | e.g. `["app:access"]` |
| `resource_match` | JSONB object | Optional exact match filters (e.g. `client_id`) |
| `conditions` | JSONB object | Boolean tree (`all` / `any` + comparisons) |
| `created_at` / `updated_at` | timestamptz | |

**Used for:** Access decisions on `app:access`. If enabled policies exist for the action but none allow → deny with *No access policy allows this request*.

Demo seed policies typically include `allow-active-users`, `deny-restricted-without-clearance`, `allow-admin-or-owning-department`, `allow-app-operator-role`.

---

### 10. `roles`

**Purpose:** Tenant-scoped RBAC roles created by admins. Users may hold **multiple** roles.

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `tenant_id` | UUID FK → tenants | |
| `name` | string(64) | Unique per tenant; lowercase `a-z0-9_-` |
| `description` | text? | |
| `is_system` | bool | System roles (`admin`, `user`) cannot be deleted |
| `created_at` / `updated_at` | timestamptz | |

**Used for:** Admin console `/v1/roles`, subject claim `roles`, PBAC `subject.roles`.

---

### 11. `role_permissions`

**Purpose:** Permission strings attached to a role (e.g. `admin:access`, `apps:write`).

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `role_id` | UUID FK → roles | Cascade delete |
| `permission` | string(64) | Unique per role |
| `created_at` | timestamptz | |

**Used for:** Flattened into `subject.permissions` / token claims. Holding `admin:access` (or `admin:*`) grants admin API access even without `users.is_admin`.

---

### 12. `user_roles`

**Purpose:** Many-to-many assignment of roles to users.

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `role_id` | UUID FK → roles | |
| `assigned_at` | timestamptz | |

**Used for:** `PUT /v1/users/{id}/roles`, signup default `user` role, OIDC `roles` / `permissions` claims.

---

### 13. `mfa_factors`

**Purpose:** Registered MFA devices/factors for a user.

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `type` | enum | `totp` (live); `webauthn` / `push` reserved |
| `secret_ref` | text | Encrypted TOTP secret (not plaintext) |
| `label` | string? | Friendly name |
| `created_at` | timestamptz | |

**Used for:** Login MFA challenge, `/mfa/totp/enroll`, `/mfa/totp/verify`, admin step-up.

---

### 14. `sessions`

**Purpose:** System of record for SSO browser sessions (mirrored to Redis for fast lookup).

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | Value of `sso_session` cookie |
| `user_id` | UUID FK → users | |
| `tenant_id` | UUID | Denormalized tenant |
| `created_at` | timestamptz | Absolute start |
| `last_seen_at` | timestamptz | Activity timestamp |
| `expires_at` | timestamptz | Idle timeout deadline |
| `absolute_expires_at` | timestamptz | Hard max lifetime |
| `revoked_at` | timestamptz? | Logout / revoke |
| `mfa_verified_at` | timestamptz? | Last MFA success |
| `admin_step_up_at` | timestamptz? | Admin write step-up window |

**Used for:** Cookie auth, authorize login gate, logout, admin MFA step-up (writes require recent step-up).

---

### 15. `refresh_tokens`

**Purpose:** Rotating OIDC refresh tokens (hashed at rest).

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `token_hash` | string (unique) | SHA-256 of opaque token |
| `user_id` | UUID FK → users | |
| `application_id` | UUID FK → applications | Issuing client |
| `session_id` | UUID FK → sessions | Tied to SSO session |
| `family_id` | UUID | Rotation family |
| `expires_at` | timestamptz | |
| `revoked_at` | timestamptz? | |
| `replaced_by` | UUID? | Next token in rotation chain |
| `created_at` | timestamptz | |

**Used for:** `grant_type=refresh_token`. Reuse of a rotated token revokes the whole family.

---

### 16. `signing_keys`

**Purpose:** Metadata for JWT / SAML signing keys (private material referenced on disk / future KMS).

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `tenant_id` | UUID FK? | Optional tenant-scoped keys |
| `kid` | string (unique) | Key id in JWT header / JWKS |
| `algorithm` | string | `ES256` (OIDC default), `RS256` (SAML) |
| `public_key` | text | PEM public key |
| `private_key_ref` | string | Path or KMS reference (not the raw secret in DB ideal state) |
| `active_from` | timestamptz | |
| `retired_at` | timestamptz? | Rotation overlap |

**Used for:** Signing ID/access tokens, publishing JWKS, signing SAML assertions.

---

### 17. `audit_events`

**Purpose:** Append-only security/admin audit log (365-day retention target).

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `tenant_id` | UUID | |
| `actor` | string | Who did it (email / id) |
| `action` | string | e.g. `login.success`, `app.create` |
| `target` | string? | What was affected |
| `occurred_at` | timestamptz | Indexed with tenant |
| `payload` | JSONB | Extra context |

**Used for:** Admin audit UI/API, CSV export. Application should not UPDATE/DELETE these rows.

---

### 18. `sync_cursors`

**Purpose:** Resume tokens for directory sync jobs (Entra / Google — worker stubbed for v1).

| Column | Type | Notes |
|--------|------|--------|
| `tenant_id` | UUID PK | Composite PK with source |
| `source` | string PK | e.g. `entra`, `google` |
| `last_token` | text? | Last acknowledged sync cursor |
| `updated_at` | timestamptz | |

**Used for:** Future incremental sync; admin `/v1/sync-cursors` endpoints.

---

### 19. `scim_tokens`

**Purpose:** Per-tenant bearer tokens for SCIM provisioning clients.

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `tenant_id` | UUID FK → tenants | |
| `token_hash` | string (unique) | Hash of bearer token |
| `label` | string? | Friendly name |
| `created_at` | timestamptz | |
| `revoked_at` | timestamptz? | Soft revoke |

**Used for:** Authenticating `/scim/v2/*` requests.

---

### 20. `auth_codes`

**Purpose:** Optional durable store for OIDC authorization codes (primary store in v1 is **Redis**).

| Column | Type | Notes |
|--------|------|--------|
| `code_hash` | string PK | Hash of one-time code |
| `client_id` | string | |
| `user_id` | UUID | |
| `session_id` | UUID | |
| `redirect_uri` | text | Must match on exchange |
| `code_challenge` | string | PKCE challenge |
| `code_challenge_method` | string | `S256` |
| `scope` | text | |
| `nonce` | string? | |
| `expires_at` | timestamptz | Short-lived |
| `used_at` | timestamptz? | Single use |

**Used for:** Fallback / future durability of authorize codes.

---

### 21. `saml_assertion_replays`

**Purpose:** Record assertion IDs already issued/consumed to reject replays (also backed by Redis in the live path).

| Column | Type | Notes |
|--------|------|--------|
| `assertion_id` | string PK | SAML Assertion `ID` |
| `expires_at` | timestamptz | After this, row is obsolete |

**Used for:** SAML single-use assertion enforcement.

---

## Enums (PostgreSQL)

| Enum name | Values |
|-----------|--------|
| `user_status` | `active`, `suspended`, `deprovisioned` |
| `group_source` | `directory`, `manual` |
| `app_protocol` | `saml`, `oidc` |
| `app_status` | `active`, `disabled` |
| `principal_type` | `user`, `group` |
| `mfa_type` | `totp`, `webauthn`, `push` |
| `policy_effect` | `allow`, `deny` |

---

## What is *not* only in Postgres

| Concern | Primary store | Postgres role |
|---------|---------------|---------------|
| Live session lookup | Redis (`sso:session:*`) | `sessions` is system of record |
| Auth codes | Redis | `auth_codes` optional |
| SAML replay cache | Redis | `saml_assertion_replays` optional/durable |
| Audit stream fan-out | Redis Streams | `audit_events` is durable log |
| Private signing keys | Files under `SIGNING_KEYS_DIR` (KMS later) | `signing_keys` holds public key + ref |

---

## How tables map to product features

| Feature | Main tables |
|---------|-------------|
| Multi-tenant org | `tenants` |
| Sign up / password login | `users`, `sessions` |
| MFA | `mfa_factors`, `sessions.mfa_verified_at` / `admin_step_up_at` |
| OIDC login for apps | `applications`, `sessions`, `auth_codes` (Redis), `refresh_tokens`, `signing_keys` |
| SAML login for apps | `applications`, `signing_keys`, `saml_assertion_replays` |
| Groups / claims | `groups`, `group_memberships` |
| App entitlement registry | `app_assignments` |
| RBAC roles | `roles`, `role_permissions`, `user_roles` |
| ABAC attributes | `user_attributes`, `resource_attributes` |
| PBAC policies | `access_policies` (conditions may reference roles + attributes) |
| Admin audit | `audit_events` |
| SCIM provisioning | `users`, `groups`, `group_memberships`, `scim_tokens` |
| Directory sync resume | `sync_cursors` |

---

## Applying schema changes

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

Forward-only migrations live under `alembic/versions/` (initial schema, ABAC/PBAC, RBAC roles).
