CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  sso_client_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug),
  UNIQUE (tenant_id, id)
);

CREATE TABLE app_config_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  application_id UUID NOT NULL,
  version INTEGER NOT NULL,
  config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, application_id) REFERENCES applications(tenant_id, id),
  UNIQUE (application_id, version)
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  application_id UUID NOT NULL,
  subject_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, application_id) REFERENCES applications(tenant_id, id),
  UNIQUE (tenant_id, application_id, id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  application_id UUID NOT NULL,
  conversation_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
  content TEXT NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, application_id, conversation_id)
    REFERENCES conversations(tenant_id, application_id, id)
);

CREATE INDEX ix_conversations_subject
  ON conversations (tenant_id, application_id, subject_id);

CREATE INDEX ix_messages_conversation_time
  ON messages (conversation_id, created_at);

CREATE TABLE knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  application_id UUID NOT NULL,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT true,
  FOREIGN KEY (tenant_id, application_id) REFERENCES applications(tenant_id, id)
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  application_id UUID NOT NULL,
  source_id UUID NOT NULL REFERENCES knowledge_sources(id),
  external_id TEXT,
  title TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  application_id UUID NOT NULL,
  document_id UUID NOT NULL REFERENCES documents(id),
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1536),
  UNIQUE (document_id, chunk_index)
);

CREATE INDEX ix_chunks_application
  ON document_chunks (tenant_id, application_id);

CREATE TABLE tool_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  application_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  input_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  permission_key TEXT NOT NULL,
  connector_id TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  FOREIGN KEY (tenant_id, application_id) REFERENCES applications(tenant_id, id),
  UNIQUE (application_id, name)
);

CREATE TABLE model_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  application_id UUID NOT NULL,
  purpose TEXT NOT NULL,
  provider_route TEXT NOT NULL,
  model_name TEXT NOT NULL,
  fallback_route TEXT,
  config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  FOREIGN KEY (tenant_id, application_id) REFERENCES applications(tenant_id, id),
  UNIQUE (application_id, purpose)
);

CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  application_id UUID,
  actor_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  decision TEXT,
  correlation_id TEXT NOT NULL,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_audit_correlation ON audit_events (correlation_id);
CREATE INDEX ix_audit_tenant_app_time ON audit_events (tenant_id, application_id, created_at);
