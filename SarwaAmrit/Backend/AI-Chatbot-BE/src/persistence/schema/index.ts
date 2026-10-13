import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  customType,
} from 'drizzle-orm/pg-core'

const vector1536 = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(1536)'
  },
})

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const applications = pgTable(
  'applications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    ssoClientId: text('sso_client_id').notNull(),
    status: text('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('applications_tenant_slug').on(t.tenantId, t.slug)],
)

export const appConfigVersions = pgTable(
  'app_config_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    applicationId: uuid('application_id').notNull(),
    version: integer('version').notNull(),
    configJson: jsonb('config_json').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('app_config_versions_app_version').on(t.applicationId, t.version)],
)

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    applicationId: uuid('application_id').notNull(),
    subjectId: text('subject_id').notNull(),
    status: text('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('ix_conversations_subject').on(t.tenantId, t.applicationId, t.subjectId),
  ],
)

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    applicationId: uuid('application_id').notNull(),
    conversationId: uuid('conversation_id').notNull(),
    role: text('role').notNull(),
    content: text('content').notNull(),
    metadataJson: jsonb('metadata_json').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('ix_messages_conversation_time').on(t.conversationId, t.createdAt)],
)

export const knowledgeSources = pgTable('knowledge_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  applicationId: uuid('application_id').notNull(),
  name: text('name').notNull(),
  sourceType: text('source_type').notNull(),
  configJson: jsonb('config_json').notNull().default({}),
  enabled: boolean('enabled').notNull().default(true),
})

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  applicationId: uuid('application_id').notNull(),
  sourceId: uuid('source_id').notNull(),
  externalId: text('external_id'),
  title: text('title').notNull(),
  contentHash: text('content_hash').notNull(),
  version: integer('version').notNull().default(1),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const documentChunks = pgTable(
  'document_chunks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    applicationId: uuid('application_id').notNull(),
    documentId: uuid('document_id').notNull(),
    chunkIndex: integer('chunk_index').notNull(),
    content: text('content').notNull(),
    metadataJson: jsonb('metadata_json').notNull().default({}),
    embedding: vector1536('embedding'),
  },
  (t) => [unique('document_chunks_doc_index').on(t.documentId, t.chunkIndex)],
)

export const toolDefinitions = pgTable(
  'tool_definitions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    applicationId: uuid('application_id').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    inputSchema: jsonb('input_schema').notNull().default({}),
    permissionKey: text('permission_key').notNull(),
    connectorId: text('connector_id').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    configJson: jsonb('config_json').notNull().default({}),
  },
  (t) => [unique('tool_definitions_app_name').on(t.applicationId, t.name)],
)

export const modelPolicies = pgTable(
  'model_policies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    applicationId: uuid('application_id').notNull(),
    purpose: text('purpose').notNull(),
    providerRoute: text('provider_route').notNull(),
    modelName: text('model_name').notNull(),
    fallbackRoute: text('fallback_route'),
    configJson: jsonb('config_json').notNull().default({}),
  },
  (t) => [unique('model_policies_app_purpose').on(t.applicationId, t.purpose)],
)

export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    applicationId: uuid('application_id'),
    actorId: text('actor_id').notNull(),
    eventType: text('event_type').notNull(),
    decision: text('decision'),
    correlationId: text('correlation_id').notNull(),
    payloadJson: jsonb('payload_json').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('ix_audit_correlation').on(t.correlationId),
    index('ix_audit_tenant_app_time').on(t.tenantId, t.applicationId, t.createdAt),
  ],
)
