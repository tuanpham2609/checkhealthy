/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import type { Metadata } from 'next'
import { SchedulingApp } from '@/components/scheduling/scheduling-app'

export const metadata: Metadata = {
  title: 'Phần mềm quản lý công việc',
  description:
    'Phần mềm quản lý công việc: sắp lịch thủ thuật, bác sĩ, máy, bệnh nhân — lưu phiên, xuất CSV, Supabase.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <SchedulingApp />
}
