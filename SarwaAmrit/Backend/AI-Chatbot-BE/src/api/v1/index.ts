import { Router } from 'express'

import { adminRouter } from './admin.routes.js'
import { applicationsRouter } from './applications.routes.js'
import { chatRouter } from './chat.routes.js'
import { conversationsRouter } from './conversations.routes.js'

export const v1Router = Router()

v1Router.use('/chat', chatRouter)
v1Router.use('/conversations', conversationsRouter)
v1Router.use('/applications', applicationsRouter)
v1Router.use('/admin', adminRouter)
