/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { EffectCallback, useEffect } from 'react'

const useEffectOnce = (effect: EffectCallback) => {
  useEffect(effect, [])
}

export default useEffectOnce
