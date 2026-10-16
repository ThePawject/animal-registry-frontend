import type { Browser } from '@playwright/test'
import type { UploadFile } from '../support/files.ts'

export type Illustration = {
  kind: 'dog' | 'cat'
  fur: string
  accent: string
  background: string
}

const WIDTH = 800
const HEIGHT = 600

const face = `
  <circle cx="170" cy="140" r="9" fill="#1f2937" />
  <circle cx="230" cy="140" r="9" fill="#1f2937" />
  <circle cx="173" cy="137" r="3" fill="#fff" />
  <circle cx="233" cy="137" r="3" fill="#fff" />`

function dog({ fur, accent }: Illustration) {
  return `
  <ellipse cx="118" cy="150" rx="30" ry="62" fill="${accent}" transform="rotate(14 118 150)" />
  <ellipse cx="282" cy="150" rx="30" ry="62" fill="${accent}" transform="rotate(-14 282 150)" />
  <circle cx="200" cy="155" r="88" fill="${fur}" />
  <ellipse cx="200" cy="192" rx="46" ry="36" fill="#fff7ed" />
  ${face}
  <ellipse cx="200" cy="174" rx="15" ry="10" fill="#1f2937" />
  <path d="M200 184 v14 M200 198 q-14 12 -26 2 M200 198 q14 12 26 2" fill="none" stroke="#1f2937" stroke-width="4" stroke-linecap="round" />`
}

function cat({ fur, accent }: Illustration) {
  return `
  <path d="M122 118 L132 42 L190 92 Z" fill="${fur}" />
  <path d="M278 118 L268 42 L210 92 Z" fill="${fur}" />
  <path d="M136 100 L140 62 L170 90 Z" fill="${accent}" />
  <path d="M264 100 L260 62 L230 90 Z" fill="${accent}" />
  <ellipse cx="200" cy="160" rx="92" ry="80" fill="${fur}" />
  ${face}
  <path d="M190 170 h20 l-10 11 z" fill="#f472b6" />
  <path d="M200 181 v8 M200 189 q-10 9 -20 2 M200 189 q10 9 20 2" fill="none" stroke="#1f2937" stroke-width="3.5" stroke-linecap="round" />
  <path d="M150 178 h-48 M150 188 l-46 12 M250 178 h48 M250 188 l46 12" stroke="#1f2937" stroke-width="2.5" stroke-linecap="round" />`
}

function svg(illustration: Illustration) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="${illustration.background}" />
  ${illustration.kind === 'dog' ? dog(illustration) : cat(illustration)}
</svg>`
}

export async function drawIllustrations(
  browser: Browser,
  illustrations: Record<string, Illustration>,
) {
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
  })
  try {
    const page = await context.newPage()
    const files: Record<string, UploadFile> = {}
    for (const [name, illustration] of Object.entries(illustrations)) {
      await page.setContent(
        `<body style="margin:0">${svg(illustration)}</body>`,
      )
      files[name] = {
        name: `${name}.png`,
        mimeType: 'image/png',
        buffer: await page.locator('svg').screenshot(),
      }
    }
    return files
  } finally {
    await context.close()
  }
}
