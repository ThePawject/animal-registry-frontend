import { Buffer } from 'node:buffer'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { REPO_ROOT } from '../config/env.ts'
import type { Locator, Page } from '@playwright/test'

export const GUIDE_DIR = path.join(REPO_ROOT, 'src', 'guide')
export const GUIDE_FILE = path.join(GUIDE_DIR, 'guide.md')
export const GUIDE_IMAGE_DIR = path.join(GUIDE_DIR, 'img')
export const GUIDE_IMAGE_SIZES_FILE = path.join(GUIDE_DIR, 'image-sizes.json')

const HIGHLIGHT_ATTRIBUTE = 'data-guide-highlight'
const HIGHLIGHT_MARGIN = 6
const AREA_MARGIN = 24
const WEBP_QUALITY = 0.9

type Box = { x: number; y: number; width: number; height: number }

export type StepOptions = {
  highlight?: Locator | Array<Locator>
  area?: Locator | Array<Locator>
  fullPage?: boolean
}

type Step = {
  title: string
  text: string
  image: string
}

type Chapter = {
  title: string
  intro: string
  blocks: Array<{ step: Step } | { note: string }>
}

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const asArray = <T>(value: T | Array<T> | undefined) =>
  value === undefined ? [] : Array.isArray(value) ? value : [value]

// The app scrolls inside this container, not the window (src/lib/navigation.ts).
const APP_SCROLL_CONTAINER = '#app-scroll-container'

// A full-page shot only sees the document, so the container is let out to
// its content's height first, keeping the current scroll position.
function setAppScrollReleased(page: Page, released: boolean) {
  return page.evaluate(
    ({ selector, release }) => {
      const container = document.querySelector<HTMLElement>(selector)
      const layout = container?.parentElement
      if (!container || !layout) return
      if (release) {
        const scrollTop = container.scrollTop
        layout.style.height = 'auto'
        container.style.overflow = 'visible'
        window.scrollTo(0, scrollTop)
      } else {
        const scrollTop = window.scrollY
        layout.style.height = ''
        container.style.overflow = ''
        window.scrollTo(0, 0)
        container.scrollTop = scrollTop
      }
    },
    { selector: APP_SCROLL_CONTAINER, release: released },
  )
}

function documentBoxOf(locator: Locator): Promise<Box> {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return {
      x: rect.x + window.scrollX,
      y: rect.y + window.scrollY,
      width: rect.width,
      height: rect.height,
    }
  })
}

function surround(boxes: Array<Box>, margin: number, limit: Box): Box {
  const left = Math.max(
    limit.x,
    Math.min(...boxes.map((box) => box.x)) - margin,
  )
  const top = Math.max(limit.y, Math.min(...boxes.map((box) => box.y)) - margin)
  const right = Math.min(
    limit.x + limit.width,
    Math.max(...boxes.map((box) => box.x + box.width)) + margin,
  )
  const bottom = Math.min(
    limit.y + limit.height,
    Math.max(...boxes.map((box) => box.y + box.height)) + margin,
  )
  return { x: left, y: top, width: right - left, height: bottom - top }
}

async function toWebp(page: Page, png: Buffer) {
  const dataUrl = await page.evaluate(
    async ({ source, quality }) => {
      const image = new Image()
      image.src = source
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      canvas.getContext('2d')!.drawImage(image, 0, 0)
      return canvas.toDataURL('image/webp', quality)
    },
    {
      source: `data:image/png;base64,${png.toString('base64')}`,
      quality: WEBP_QUALITY,
    },
  )
  return Buffer.from(dataUrl.split(',')[1], 'base64')
}

export class GuideWriter {
  private readonly chapters: Array<Chapter> = []
  private readonly imageSizes: Record<
    string,
    { width: number; height: number }
  > = {}

  constructor(
    private readonly title: string,
    private readonly lead: string,
  ) {}

  static async clearOutput() {
    await rm(GUIDE_IMAGE_DIR, { recursive: true, force: true })
    await mkdir(GUIDE_IMAGE_DIR, { recursive: true })
  }

  chapter(title: string, intro: string) {
    this.chapters.push({ title, intro, blocks: [] })
  }

  note(text: string) {
    this.current.blocks.push({ note: text })
  }

  async step(
    page: Page,
    title: string,
    text: string,
    options: StepOptions = {},
  ) {
    const chapter = this.current
    const chapterNumber = this.chapters.length
    const stepNumber =
      chapter.blocks.filter((block) => 'step' in block).length + 1
    const image = `${String(chapterNumber).padStart(2, '0')}-${slug(chapter.title)}-${String(stepNumber).padStart(2, '0')}.webp`

    await this.screenshot(page, image, options)
    chapter.blocks.push({ step: { title, text, image } })
  }

  async write() {
    const lines = [`# ${this.title}`, '', this.lead, '']

    this.chapters.forEach((chapter, chapterIndex) => {
      lines.push(`## ${chapterIndex + 1}. ${chapter.title}`, '')
      lines.push(chapter.intro, '')

      let stepNumber = 0
      for (const block of chapter.blocks) {
        if ('note' in block) {
          lines.push(`> **Wskazówka:** ${block.note}`, '')
          continue
        }
        stepNumber += 1
        const { title, text, image } = block.step
        lines.push(`### Krok ${stepNumber}. ${title}`, '')
        lines.push(text, '')
        lines.push(`![${title}](./img/${image})`, '')
      }
    })

    await mkdir(GUIDE_DIR, { recursive: true })
    await writeFile(GUIDE_FILE, `${lines.join('\n').trimEnd()}\n`)
    await writeFile(
      GUIDE_IMAGE_SIZES_FILE,
      `${JSON.stringify(this.imageSizes, null, 2)}\n`,
    )
  }

  private get current() {
    const chapter = this.chapters.at(-1)
    if (!chapter) throw new Error('Start a chapter before adding steps')
    return chapter
  }

  private async screenshot(page: Page, image: string, options: StepOptions) {
    const highlights = asArray(options.highlight)
    const areas = asArray(options.area)
    const fullPage = options.fullPage ?? false

    if (fullPage) await setAppScrollReleased(page, true)
    try {
      await this.capture(page, image, highlights, areas, fullPage)
    } finally {
      if (fullPage) await setAppScrollReleased(page, false)
    }
  }

  private async capture(
    page: Page,
    image: string,
    highlights: Array<Locator>,
    areas: Array<Locator>,
    fullPage: boolean,
  ) {
    for (const locator of [...highlights, ...areas].slice(0, 1)) {
      await locator.scrollIntoViewIfNeeded()
    }
    await page.mouse.move(0, 0)

    const highlightBoxes = await Promise.all(highlights.map(documentBoxOf))
    const areaBoxes = await Promise.all(areas.map(documentBoxOf))

    await page.evaluate(
      ({ boxes, attribute, margin }) => {
        for (const box of boxes) {
          const outline = document.createElement('div')
          outline.setAttribute(attribute, '')
          Object.assign(outline.style, {
            position: 'absolute',
            left: `${box.x - margin}px`,
            top: `${box.y - margin}px`,
            width: `${box.width + margin * 2}px`,
            height: `${box.height + margin * 2}px`,
            border: '3px solid #e11d48',
            borderRadius: '10px',
            boxShadow: '0 0 0 4px rgba(225, 29, 72, 0.25)',
            pointerEvents: 'none',
            zIndex: '2147483647',
          })
          document.body.append(outline)
        }
      },
      {
        boxes: highlightBoxes,
        attribute: HIGHLIGHT_ATTRIBUTE,
        margin: HIGHLIGHT_MARGIN,
      },
    )

    try {
      const visible = await page.evaluate((whole) => {
        const root = document.documentElement
        return whole
          ? { x: 0, y: 0, width: root.scrollWidth, height: root.scrollHeight }
          : {
              x: window.scrollX,
              y: window.scrollY,
              width: root.clientWidth,
              height: root.clientHeight,
            }
      }, fullPage)

      const clip = areaBoxes.length
        ? surround([...areaBoxes, ...highlightBoxes], AREA_MARGIN, visible)
        : undefined
      if (clip && !fullPage) {
        clip.x -= visible.x
        clip.y -= visible.y
      }

      const png = await page.screenshot({
        animations: 'disabled',
        caret: 'hide',
        fullPage,
        clip,
      })
      this.imageSizes[image] = {
        width: png.readUInt32BE(16),
        height: png.readUInt32BE(20),
      }
      await writeFile(
        path.join(GUIDE_IMAGE_DIR, image),
        await toWebp(page, png),
      )
    } finally {
      await page.evaluate((attribute) => {
        document
          .querySelectorAll(`[${attribute}]`)
          .forEach((outline) => outline.remove())
      }, HIGHLIGHT_ATTRIBUTE)
    }
  }
}
