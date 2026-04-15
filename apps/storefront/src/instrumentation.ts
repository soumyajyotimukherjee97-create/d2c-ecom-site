/**
 * Next.js instrumentation entry — @sentry/nextjs uses this to pick the right
 * init file for the runtime. Both branches are guarded on NEXT_PUBLIC_SENTRY_DSN
 * inside the config files themselves, so this stays cheap when DSN is unset.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}
