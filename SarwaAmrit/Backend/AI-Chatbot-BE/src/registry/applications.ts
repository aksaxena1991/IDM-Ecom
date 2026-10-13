import { and, desc, eq } from 'drizzle-orm'

import { ApplicationAccessDenied } from '../core/errors.js'
import type { RequestContext } from '../core/requestContext.js'
import { db } from '../persistence/db.js'
import { appConfigVersions, applications } from '../persistence/schema/index.js'

export type RegisteredApplication = {
  id: string
  tenantId: string
  slug: string
  name: string
  ssoClientId: string
  status: string
  activeConfig: Record<string, unknown>
}

export async function getEnabledApplicationBySlug(
  tenantId: string,
  slug: string,
): Promise<RegisteredApplication | null> {
  const rows = await db
    .select()
    .from(applications)
    .where(and(eq(applications.tenantId, tenantId), eq(applications.slug, slug)))
    .limit(1)

  const app = rows[0]
  if (!app || app.status !== 'active') return null

  const configs = await db
    .select()
    .from(appConfigVersions)
    .where(eq(appConfigVersions.applicationId, app.id))
    .orderBy(desc(appConfigVersions.version))
    .limit(1)

  return {
    id: app.id,
    tenantId: app.tenantId,
    slug: app.slug,
    name: app.name,
    ssoClientId: app.ssoClientId,
    status: app.status,
    activeConfig: (configs[0]?.configJson as Record<string, unknown>) ?? {},
  }
}

export function assertTokenMatchesApplication(
  tokenAudience: string,
  app: RegisteredApplication,
): void {
  if (tokenAudience !== app.ssoClientId) {
    throw new ApplicationAccessDenied(
      'Access token audience does not match the requested application',
    )
  }
}

export async function resolveApplicationForChat(
  ctx: Pick<RequestContext, 'tenantId' | 'tokenAudience'>,
  applicationSlug: string,
): Promise<RegisteredApplication> {
  const app = await getEnabledApplicationBySlug(ctx.tenantId, applicationSlug)
  if (!app) {
    throw new ApplicationAccessDenied('Application not found or disabled')
  }
  assertTokenMatchesApplication(ctx.tokenAudience, app)
  return app
}
