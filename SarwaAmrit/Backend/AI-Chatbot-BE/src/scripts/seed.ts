/**
 * Seeds demo tenant + IDM/IMS chat applications aligned with SSO seed client IDs.
 * Run after SSO seed so tenant UUID matches demo tenant (override via SEED_TENANT_ID).
 */
import { and, desc, eq } from 'drizzle-orm'

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
        model_policy: { purpose: 'general_chat', route: 'cloud', fallback_route: 'mock' },
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
        model_policy: { purpose: 'general_chat', route: 'cloud', fallback_route: 'mock' },
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
      const publishRoute = process.env.SEED_PUBLISH_MODEL_ROUTE
      if (publishRoute === 'cloud' || publishRoute === 'mock') {
        const app = found[0]
        const latest = await db
          .select()
          .from(appConfigVersions)
          .where(eq(appConfigVersions.applicationId, app.id))
          .orderBy(desc(appConfigVersions.version))
          .limit(1)
        const prev = (latest[0]?.configJson as Record<string, unknown>) ?? {}
        const policy = (prev.model_policy as Record<string, unknown>) ?? {}
        const nextConfig = {
          ...prev,
          model_policy: {
            ...policy,
            purpose: policy.purpose ?? 'general_chat',
            route: publishRoute,
            fallback_route: policy.fallback_route ?? 'mock',
          },
        }
        const nextVersion = (latest[0]?.version ?? 0) + 1
        await db.insert(appConfigVersions).values({
          tenantId: app.tenantId,
          applicationId: app.id,
          version: nextVersion,
          configJson: nextConfig,
        })
        console.log(`Published config v${nextVersion} for ${spec.slug} (model route=${publishRoute})`)
      }
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
