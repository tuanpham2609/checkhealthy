/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

/**
 * Formats FAQ answer text by adding line breaks before numbered steps
 *
 * Converts patterns like "1. Step one. 2. Step two." into:
 * "1. Step one.\n2. Step two."
 *
 * Also handles cases with introductory text:
 * "If a transaction fails: 1. Check... 2. Verify..." becomes:
 * "If a transaction fails:\n1. Check...\n2. Verify..."
 *
 * Supports multiple languages including Chinese:
 * "如果您遺失裝置：1. 在新裝置上... 2. 如果可能..." becomes:
 * "如果您遺失裝置：\n1. 在新裝置上...\n2. 如果可能..."
 *
 * @param text - The FAQ answer text to format
 * @returns Formatted text with line breaks before numbered steps
 *
 * @example
 * ```typescript
 * formatFAQAnswer("1. Step one. 2. Step two.")
 * // Returns: "1. Step one.\n2. Step two."
 *
 * formatFAQAnswer("If a transaction fails: 1. Check... 2. Verify...")
 * // Returns: "If a transaction fails:\n1. Check...\n2. Verify..."
 *
 * formatFAQAnswer("如果您遺失裝置：1. 在新裝置上... 2. 如果可能...")
 * // Returns: "如果您遺失裝置：\n1. 在新裝置上...\n2. 如果可能..."
 * ```
 */
export function formatFAQAnswer(text: string): string {
  if (!text) return text

  // Pattern to match numbered steps: "N. " or "N." (with or without space after period)
  // Supports both English period (.) and Chinese full stop (。)
  const stepPattern = /\d+[\.。]\s?/

  // Check if text contains numbered steps
  if (!stepPattern.test(text)) {
    return text
  }

  let formatted = text

  // Handle cases where step starts after colon (English ":" or Chinese "：")
  // Replace ": N. " or "：N. " with ":\nN. " or "：\nN. "
  formatted = formatted.replace(/([：:])\s*(\d+[\.。]\s?)/g, '$1\n$2')

  // Replace space or Chinese punctuation before numbered steps with newline
  // Pattern: any character (not newline) followed by optional space/punctuation and "N. " or "N。"
  // This handles cases like "text 1. Step" or "text。2. Step" or "text 1。Step"
  formatted = formatted.replace(/([^\n])(\s*)(\d+[\.。]\s?)/g, (match, before, spaces, step) => {
    // Don't add newline if the character before is already a period/full stop
    // But do add if it's clearly a step pattern (period/full stop followed by number)
    if (before === '.' || before === '。') {
      // Check if this looks like end of sentence before a step
      // If there's a period/full stop followed by space and number, it's likely a new step
      return `${before}\n${step}`
    }
    return `${before}\n${step}`
  })

  return formatted
}
