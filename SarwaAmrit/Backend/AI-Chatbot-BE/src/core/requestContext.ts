/** Built only after SSO JWT validation and application access checks. */
export type RequestContext = {
  readonly tenantId: string
  readonly applicationId: string
  readonly applicationSlug: string
  readonly subjectId: string
  readonly correlationId: string
  readonly tokenAudience: string
  readonly email?: string
  readonly permissions: readonly string[]
}

export function createRequestContext(input: {
  tenantId: string
  applicationId: string
  applicationSlug: string
  subjectId: string
  correlationId: string
  tokenAudience: string
  email?: string
  permissions?: string[]
}): RequestContext {
  return Object.freeze({
    ...input,
    permissions: Object.freeze([...(input.permissions ?? [])]),
  })
}
