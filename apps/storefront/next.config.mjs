import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@d2c/email', '@d2c/schemas'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Local Supabase (supabase start) — dev only.
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port:     '54321',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

// Wrap with Sentry only when a DSN is configured. This keeps local dev and
// preview builds without Sentry entirely noise-free — no plugin, no upload.
const sentryDsn        = process.env.NEXT_PUBLIC_SENTRY_DSN
const sentryAuthToken  = process.env.SENTRY_AUTH_TOKEN
const sentryOrg        = process.env.SENTRY_ORG
const sentryProject    = process.env.SENTRY_PROJECT

export default sentryDsn
  ? withSentryConfig(nextConfig, {
      silent:       !process.env.CI,
      org:          sentryOrg,
      project:      sentryProject,
      authToken:    sentryAuthToken,
      // Source-map upload requires org + project + token; skip cleanly without them.
      sourcemaps:   sentryAuthToken && sentryOrg && sentryProject ? undefined : { disable: true },
      disableLogger: true,
    })
  : nextConfig
