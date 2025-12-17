/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { PropsWithChildren } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import DebugProvider from '@/providers/debug.provider'

export default function ProviderRegistry({ children }: Readonly<PropsWithChildren>) {
  return (
    <DebugProvider>
      <SidebarProvider defaultOpen={false}>{children}</SidebarProvider>
    </DebugProvider>
  )
}
