import { readFile } from 'node:fs/promises'
import { expect } from '@playwright/test'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { TIMEOUTS } from '../config/env.ts'
import { PDF_MAGIC } from '../support/files.ts'
import type { Download, Locator, Page } from '@playwright/test'

export async function chooseOption(trigger: Locator, option: string) {
  const page = trigger.page()
  await trigger.click()
  await page.getByRole('option', { name: option, exact: true }).click()
  await expect(page.getByRole('listbox')).toBeHidden({ timeout: TIMEOUTS.ui })
}

export async function expectOptions(trigger: Locator, labels: Array<string>) {
  const page = trigger.page()
  await trigger.click()
  await expect(page.getByRole('option')).toHaveText(labels)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('listbox')).toBeHidden({ timeout: TIMEOUTS.ui })
}

export class FormFieldLocator {
  readonly root: Locator

  constructor(scope: Page | Locator, label: string) {
    this.root = scope
      .locator('label')
      .filter({ hasText: new RegExp(`^${escapeRegExp(label)}$`) })
      .locator('xpath=..')
  }

  get input() {
    return this.root.locator('input:not([type="file"]), textarea').first()
  }

  get select() {
    return this.root.getByRole('combobox')
  }

  get error() {
    return this.root.getByRole('alert')
  }
}

export async function captureDownload(
  page: Page,
  trigger: () => Promise<unknown>,
) {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: TIMEOUTS.slow }),
    trigger(),
  ])
  return download
}

export async function expectImageLoaded(image: Locator) {
  await expect
    .poll(() =>
      image.evaluate(
        (element: HTMLImageElement) =>
          element.complete && element.naturalWidth > 0,
      ),
    )
    .toBe(true)
}

export async function readPdfText(content: Uint8Array) {
  const document = await getDocument({ data: new Uint8Array(content) }).promise
  const pages: Array<string> = []
  for (let number = 1; number <= document.numPages; number++) {
    const page = await document.getPage(number)
    const { items } = await page.getTextContent()
    pages.push(items.map((item) => ('str' in item ? item.str : '')).join(' '))
  }
  return pages.join('\n').replace(/\s+/g, ' ')
}

export async function expectPdfDownload(
  download: Download,
  fileName: RegExp = /\.pdf$/i,
) {
  expect(download.suggestedFilename()).toMatch(fileName)
  const content = await readFile(await download.path())
  expect(content.subarray(0, PDF_MAGIC.length).toString('latin1')).toBe(
    PDF_MAGIC,
  )
  return readPdfText(content)
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
