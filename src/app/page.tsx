/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import type { Metadata } from 'next'
import { SchedulingApp } from '@/components/scheduling/scheduling-app'

export const metadata: Metadata = {
  title: 'Phần mềm quản lý công việc',
}

export default function Page() {
  return <SchedulingApp />
}
