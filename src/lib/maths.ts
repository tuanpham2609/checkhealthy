/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

function clamp(min: number, input: number, max: number): number {
  return Math.max(min, Math.min(input, max))
}

function mapRange(in_min: number, in_max: number, input: number, out_min: number, out_max: number): number {
  if (in_max === in_min) return out_min
  return ((input - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}

function lerp(x: number, y: number, t: number): number {
  t = clamp(0, t, 1)
  return (1 - t) * x + t * y
}

function truncate(value: number, decimals: number = 0): number {
  return parseFloat(value.toFixed(decimals))
}

const Maths = { lerp, clamp, mapRange, truncate }

export { lerp, clamp, mapRange, truncate }
export default Maths
