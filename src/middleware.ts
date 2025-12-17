/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { type NextRequest, NextResponse } from 'next/server'

import Negotiator from 'negotiator'
import linguiConfig from '../lingui.config'

const { locales } = linguiConfig

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`)

  if (pathnameHasLocale) return

  // Redirect if there is no locale
  const locale = getRequestLocale(request.headers)
  request.nextUrl.pathname = `/${locale}${pathname}`
  // e.g. incoming request is /products
  // The new URL is now /en/products/

  return NextResponse.redirect(request.nextUrl)
}

function getRequestLocale(requestHeaders: Headers): string {
  const langHeader = requestHeaders.get('accept-language') || undefined
  const languages = new Negotiator({
    headers: { 'accept-language': langHeader },
  }).languages(locales.slice())

  return languages[0] || locales[0] || 'en'
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (manifest file)
     * - sitemap.xml (sitemap file)
     * - feeds/*.xml (RSS feed files)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * - audio - .wav
     * - video - .mp4
     * - data - .xml, .json
     * - 3D models - .gltf, .glb, .fbx, .obj, .usdz
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sitemap.xml|feeds/.*\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|wav|mp4|xml|json|gltf|glb|fbx)$).*)',
  ],
}
