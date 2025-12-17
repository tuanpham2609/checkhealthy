/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { withContentlayer } from 'next-contentlayer2'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  pageExtensions: ['jsx', 'js', 'ts', 'tsx', 'mdx', 'md'],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    reactCompiler: true,
    scrollRestoration: true,
    swcPlugins: [['@lingui/swc-plugin', {}]],
    turbo: {
      rules: {
        '*.po': {
          loaders: ['@lingui/loader'],
          as: '*.js',
        },
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
        '*.glsl': {
          loaders: ['raw-loader', 'glslify-loader'],
          as: '*.js',
        },
        '*.vert': {
          loaders: ['raw-loader', 'glslify-loader'],
          as: '*.js',
        },
        '*.frag': {
          loaders: ['raw-loader', 'glslify-loader'],
          as: '*.js',
        },
      },
    },
  },
  webpack: (config, { dev, isServer, ...options }) => {
    if (process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
        })
      )
    }
    config.module.rules.push({
      test: /\.po$/,
      use: {
        loader: '@lingui/loader',
      },
    })
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader', 'glslify-loader'],
    })
    // MDX is handled by contentlayer, no need for manual loader

    return config
  },
}

export default withContentlayer(nextConfig)
