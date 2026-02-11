/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { PropsWithChildren } from 'react'

/**
 * Layout cho các trang /tool/*: không header/footer, full viewport.
 * AppShell đã ẩn header/footer khi pathname.startsWith('/tool').
 */
export default function ToolLayout({ children }: Readonly<PropsWithChildren>) {
  return <>{children}</>
}
