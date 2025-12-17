/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

declare module '*.glb' {
  import { Mesh, Material } from 'three'
  export interface GLTFResult {
    nodes: Record<string, Mesh>
    materials: Record<string, Material>
  }
  export const useGLTF: (path: string) => GLTFResult
}
