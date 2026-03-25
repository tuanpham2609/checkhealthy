/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function supabaseStorageHost(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!raw) return undefined
  try {
    return new URL(raw).hostname
  } catch {
    return undefined
  }
}

const supabaseHost = supabaseStorageHost()

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: 'https' as const,
              hostname: supabaseHost,
              pathname: '/storage/v1/object/public/**',
            },
          ]
        : []),
    ],
  },
  experimental: {
    // Tắt React Compiler: một số bản build + React 19 có thể gây lỗi commitDeletion/removeChild khi đổi route.
    // Bật lại khi nâng Next/React và đã xác nhận ổn định.
    reactCompiler: false,
    scrollRestoration: true,
  },
}

export default nextConfig
