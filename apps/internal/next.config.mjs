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
    ],
  },
}

const sentryDsn       = process.env.NEXT_PUBLIC_SENTRY_DSN
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN
const sentryOrg       = process.env.SENTRY_ORG
const sentryProject   = process.env.SENTRY_PROJECT

export default sentryDsn
  ? withSentryConfig(nextConfig, {
      silent:       !process.env.CI,
      org:          sentryOrg,
      project:      sentryProject,
      authToken:    sentryAuthToken,
      sourcemaps:   sentryAuthToken && sentryOrg && sentryProject ? undefined : { disable: true },
      disableLogger: true,
    })
  : nextConfig
