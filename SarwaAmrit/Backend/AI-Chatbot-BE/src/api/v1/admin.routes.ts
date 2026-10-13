import { Router } from 'express'
import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'

import { AppError } from '../../core/errors.js'
import { recordAuditEvent } from '../../observability/audit.js'
import { db } from '../../persistence/db.js'
import { appConfigVersions, applications, tenants } from '../../persistence/schema/index.js'
import { authenticate } from '../middleware/authenticate.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const registerAppSchema = z.object({
  tenant_id: z.string().uuid(),
  slug: z.string().min(1).max(64),
  name: z.string().min(1).max(256),
  sso_client_id: z.string().min(1).max(128),
  config: z.record(z.unknown()).optional(),
})

const publishConfigSchema = z.object({
  config: z.record(z.unknown()),
})

export const adminRouter = Router()

adminRouter.use(authenticate, requireAdmin)

adminRouter.post('/applications', async (req, res, next) => {
  try {
    const body = registerAppSchema.parse(req.body)
    const claims = req.authClaims!
    const tenantRows = await db.select().from(tenants).where(eq(tenants.id, body.tenant_id)).limit(1)
    if (!tenantRows[0]) {
      throw new AppError(404, 'not_found', 'Tenant not found')
    }

    const inserted = await db
      .insert(applications)
      .values({
        tenantId: body.tenant_id,
        slug: body.slug,
        name: body.name,
        ssoClientId: body.sso_client_id,
        status: 'active',
      })
      .returning()

    const app = inserted[0]!
    const configJson = body.config ?? {
      agent_config: {
        system_instructions: `Answer only ${body.name}-related questions.`,
        allowed_tools: [],
      },
      model_policy: { purpose: 'general_chat', route: 'cloud', fallback_route: 'mock' },
    }

    await db.insert(appConfigVersions).values({
      tenantId: app.tenantId,
      applicationId: app.id,
      version: 1,
      configJson,
    })

    await recordAuditEvent({
      tenantId: app.tenantId,
      applicationId: app.id,
      actorId: claims.sub!,
      eventType: 'admin.application.registered',
      decision: 'allow',
      correlationId: req.requestId,
      payload: { slug: app.slug, sso_client_id: app.ssoClientId },
    })

    res.status(201).json({
      id: app.id,
      slug: app.slug,
      name: app.name,
      sso_client_id: app.ssoClientId,
      config_version: 1,
      request_id: req.requestId,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, 'validation_error', 'Invalid body', err.flatten()))
      return
    }
    next(err)
  }
})

adminRouter.put('/applications/:id/config', async (req, res, next) => {
  try {
    const body = publishConfigSchema.parse(req.body)
    const claims = req.authClaims!
    const appId = req.params.id!

    const appRows = await db.select().from(applications).where(eq(applications.id, appId)).limit(1)
    const app = appRows[0]
    if (!app) throw new AppError(404, 'not_found', 'Application not found')

    const latest = await db
      .select()
      .from(appConfigVersions)
      .where(eq(appConfigVersions.applicationId, appId))
      .orderBy(desc(appConfigVersions.version))
      .limit(1)

    const nextVersion = (latest[0]?.version ?? 0) + 1
    await db.insert(appConfigVersions).values({
      tenantId: app.tenantId,
      applicationId: app.id,
      version: nextVersion,
      configJson: body.config,
    })

    await recordAuditEvent({
      tenantId: app.tenantId,
      applicationId: app.id,
      actorId: claims.sub!,
      eventType: 'admin.application.config_published',
      decision: 'allow',
      correlationId: req.requestId,
      payload: { version: nextVersion },
    })

    res.json({ application_id: app.id, version: nextVersion, request_id: req.requestId })
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, 'validation_error', 'Invalid body', err.flatten()))
      return
    }
    next(err)
  }
})

adminRouter.get('/applications', async (req, res, next) => {
  try {
    const tenantId = typeof req.query.tenant_id === 'string' ? req.query.tenant_id : undefined
    const rows = tenantId
      ? await db.select().from(applications).where(eq(applications.tenantId, tenantId))
      : await db.select().from(applications)
    res.json({
      applications: rows.map((a) => ({
        id: a.id,
        tenant_id: a.tenantId,
        slug: a.slug,
        name: a.name,
        sso_client_id: a.ssoClientId,
        status: a.status,
      })),
      request_id: req.requestId,
    })
  } catch (err) {
    next(err)
  }
})

adminRouter.patch('/applications/:id/status', async (req, res, next) => {
  try {
    const status = z.enum(['active', 'disabled']).parse(req.body?.status)
    const appId = req.params.id!
    const updated = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, appId))
      .returning()
    if (!updated[0]) throw new AppError(404, 'not_found', 'Application not found')
    res.json({ id: updated[0].id, status: updated[0].status, request_id: req.requestId })
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError(400, 'validation_error', 'Invalid body', err.flatten()))
      return
    }
    next(err)
  }
})
