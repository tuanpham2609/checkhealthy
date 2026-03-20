/**
 * Tạo `public/assets/og-share.png` (1200×630) cho Messenger / Facebook / Zalo.
 * Chạy: node scripts/generate-og-share.mjs
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const logoPath = path.join(root, 'public/assets/ivf-heart-brand.png')
const outDir = path.join(root, 'public/assets')
const outPath = path.join(outDir, 'og-share.png')

const W = 1200
const H = 630

async function main() {
  await mkdir(outDir, { recursive: true })

  const resizedLogo = await sharp(logoPath).resize(400, 400, { fit: 'inside' }).png().toBuffer()

  const { width: lw = 1, height: lh = 1 } = await sharp(resizedLogo).metadata()

  await sharp({
    create: {
      width: W,
      height: H,
      channels: 3,
      background: '#15803d',
    },
  })
    .composite([
      {
        input: resizedLogo,
        left: Math.round((W - lw) / 2),
        top: Math.round((H - lh) / 2),
      },
    ])
    .png()
    .toFile(outPath)

  console.log('Wrote', outPath)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
