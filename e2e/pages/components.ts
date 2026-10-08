import { readFile } from 'node:fs/promises'
import { expect } from '@playwright/test'
import { TIMEOUTS } from '../config/env.ts'
import { PDF_MAGIC } from '../support/files.ts'
import type { Download, Locator, Page } from '@playwright/test'

export async function chooseOption(trigger: Locator, option: string) {
  const page = trigger.page()
  await trigger.click()
  await page.getByRole('option', { name: option, exact: true }).click()
  await expect(page.getByRole('listbox')).toBeHidden({ timeout: TIMEOUTS.ui })
}

export async function listOptions(trigger: Locator) {
  const page = trigger.page()
  await trigger.click()
  const labels = await page.getByRole('option').allInnerTexts()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('listbox')).toBeHidden({ timeout: TIMEOUTS.ui })
  return labels.map((label) => label.trim())
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
    return this.root.locator('p.text-red-500')
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

export async function expectPdfDownload(
  download: Download,
  fileName: RegExp = /\.pdf$/i,
) {
  expect(download.suggestedFilename()).toMatch(fileName)
  const content = await readFile(await download.path())
  expect(content.subarray(0, PDF_MAGIC.length).toString('latin1')).toBe(
    PDF_MAGIC,
  )
  expect(content.length).toBeGreaterThan(500)
  return content
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
