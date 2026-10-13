import { Router } from 'express'

import { UnauthorizedError } from '../../core/errors.js'
import { getEnabledApplicationBySlug } from '../../registry/applications.js'
import { authenticate } from '../middleware/authenticate.js'

export const applicationsRouter = Router()

applicationsRouter.get('/:slug/capabilities', authenticate, async (req, res, next) => {
  try {
    const claims = req.authClaims
    if (!claims?.sub || !req.tokenAudience) throw new UnauthorizedError()
    const tenantId = String(claims.tenant_id ?? '')
    if (!tenantId) throw new UnauthorizedError('Access token missing tenant_id')

    const app = await getEnabledApplicationBySlug(tenantId, req.params.slug!)
    if (!app || app.ssoClientId !== req.tokenAudience) {
      res.status(403).json({
        error: 'application_access_denied',
        detail: 'Application not available for this token',
        request_id: req.requestId,
      })
      return
    }

    const agent = app.activeConfig.agent_config as { allowed_tools?: string[] } | undefined
    res.json({
      application_id: app.slug,
      name: app.name,
      features: {
        chat: true,
        streaming: false,
        tools: agent?.allowed_tools ?? [],
        knowledge: true,
      },
      request_id: req.requestId,
    })
  } catch (err) {
    next(err)
  }
})
