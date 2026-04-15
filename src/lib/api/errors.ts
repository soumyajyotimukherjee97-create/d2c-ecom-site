import { NextResponse } from 'next/server'

/**
 * Builds the standard error envelope defined in TDD.md §7.1.
 * Never return raw Postgres errors — always map to a code here.
 */
export function apiError(
  status: number,
  code: string,
  message: string,
  details?: unknown,
): NextResponse {
  return NextResponse.json(
    { error: { code, message, details: details ?? null } },
    { status },
  )
}

// ─── Reusable error factories ──────────────────────────────────────────────────

export const Errors = {
  validation: (details?: unknown) =>
    apiError(400, 'VALIDATION_ERROR', 'Request validation failed.', details),

  unauthorized: () =>
    apiError(401, 'UNAUTHORIZED', 'Authentication required.'),

  forbidden: () =>
    apiError(403, 'FORBIDDEN', 'You do not have permission to perform this action.'),

  notFound: (resource: string) =>
    apiError(404, `${resource.toUpperCase()}_NOT_FOUND`, `${resource} not found.`),

  conflict: (code: string, message: string, details?: unknown) =>
    apiError(409, code, message, details),

  internal: () =>
    apiError(500, 'INTERNAL_ERROR', 'An unexpected error occurred.'),
} as const
