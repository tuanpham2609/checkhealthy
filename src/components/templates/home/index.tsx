/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { useIsTablet } from '@/hooks/use-tablet'
import HomeTemplateMobile from '@/components/templates/home/mobile'
import HomeTemplateDesktop from '@/components/templates/home/desktop'

const HomeTemplate: React.FC<any> = () => {
  const isTablet = useIsTablet()
  if (isTablet) {
    return <HomeTemplateMobile />
  }
  return <HomeTemplateDesktop />
}

export default HomeTemplate
