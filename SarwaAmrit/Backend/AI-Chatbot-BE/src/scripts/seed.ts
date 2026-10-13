/**
 * Seeds demo tenant + IDM/IMS chat applications aligned with SSO seed client IDs.
 * Run after SSO seed so tenant UUID matches demo tenant (override via SEED_TENANT_ID).
 */
import { and, eq } from 'drizzle-orm'

import { env } from '../config/env.js'
import { closeDb, db } from '../persistence/db.js'
import { appConfigVersions, applications, tenants } from '../persistence/schema/index.js'

const DEMO_TENANT_ID = process.env.SEED_TENANT_ID

async function main() {
  let tenantId = DEMO_TENANT_ID

  if (!tenantId) {
    const existing = await db.select().from(tenants).where(eq(tenants.name, 'Demo Tenant')).limit(1)
    if (existing[0]) {
      tenantId = existing[0].id
    } else {
      const inserted = await db
        .insert(tenants)
        .values({ name: 'Demo Tenant', status: 'active' })
        .returning()
      tenantId = inserted[0]!.id
    }
  } else {
    const row = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1)
    if (!row[0]) {
      await db.insert(tenants).values({ id: tenantId, name: 'Demo Tenant', status: 'active' })
    }
  }

  const apps = [
    {
      slug: 'idm',
      name: 'Identity Management',
      ssoClientId: 'idm-oidc-app',
      config: {
        agent_config: {
          system_instructions: 'Answer only IDM-related questions.',
          allowed_tools: ['get_user', 'list_user_roles', 'list_access_requests'],
        },
        model_policy: { purpose: 'general_chat', route: 'mock', fallback_route: 'mock' },
      },
    },
    {
      slug: 'ims',
      name: 'Inventory Management',
      ssoClientId: 'ims-oidc-app',
      config: {
        agent_config: {
          system_instructions: 'Answer only IMS-related questions.',
          allowed_tools: [],
        },
        model_policy: { purpose: 'general_chat', route: 'mock', fallback_route: 'mock' },
      },
    },
  ] as const

  for (const spec of apps) {
    const found = await db
      .select()
      .from(applications)
      .where(and(eq(applications.tenantId, tenantId!), eq(applications.slug, spec.slug)))
      .limit(1)

    if (found[0]) {
      console.log(`Application ${spec.slug} already exists for tenant (${found[0].id})`)
      continue
    }

    const inserted = await db
      .insert(applications)
      .values({
        tenantId: tenantId!,
        slug: spec.slug,
        name: spec.name,
        ssoClientId: spec.ssoClientId,
        status: 'active',
      })
      .returning()

    const app = inserted[0]!
    await db.insert(appConfigVersions).values({
      tenantId: app.tenantId,
      applicationId: app.id,
      version: 1,
      configJson: spec.config,
    })
    console.log(`Registered chat application ${spec.slug} (${app.id})`)
  }

  console.log(`Seed complete. tenant_id=${tenantId}`)
  console.log(`DATABASE_URL=${env.DATABASE_URL}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await closeDb()
  })
