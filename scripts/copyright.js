/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from TuanPham.
 */

'use strict'

const fs = require('fs')
const glob = require('glob')

const TUANPHAM_COPYRIGHT_COMMENT_BLOCK =
  `/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from TuanPham.
 */`.trim() + '\n\n'

const files = glob.sync('**/*.{js,ts,tsx,jsx,rs}', {
  ignore: ['**/dist/**', '**/node_modules/**', '**/tests/fixtures/**', '**/__tests__/fixtures/**'],
})

const updatedFiles = new Map()
let hasErrors = false
files.forEach((file) => {
  try {
    const result = processFile(file)
    if (result != null) {
      updatedFiles.set(file, result)
    }
  } catch (e) {
    console.error(e)
    hasErrors = true
  }
})
if (hasErrors) {
  console.error('❌ Update failed', '\n')
  process.exit(1)
} else {
  for (const [file, source] of updatedFiles) {
    fs.writeFileSync(file, source, 'utf8')
  }
  console.info('✅ Update complete', '\n')
}

function processFile(file) {
  if (fs.lstatSync(file).isDirectory()) {
    return
  }
  let source = fs.readFileSync(file, 'utf8')
  let shebang = ''

  if (source.startsWith('#!')) {
    const newlineIndex = source.indexOf('\n')
    if (newlineIndex === -1) {
      shebang = `${source}\n`
      source = ''
    } else {
      shebang = source.slice(0, newlineIndex + 1)
      source = source.slice(newlineIndex + 1)
    }
  }

  if (source.indexOf(TUANPHAM_COPYRIGHT_COMMENT_BLOCK) === 0) {
    return null
  }
  if (/^\/\*\*/.test(source)) {
    source = source.replace(/\/\*\*[^\/]+\/\s+/, TUANPHAM_COPYRIGHT_COMMENT_BLOCK)
  } else {
    source = `${TUANPHAM_COPYRIGHT_COMMENT_BLOCK}${source}`
  }

  if (shebang) {
    return `${shebang}${source}`
  }
  return source
}
