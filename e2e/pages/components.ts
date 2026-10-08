import { readFile } from 'node:fs/promises'
import { expect } from '@playwright/test'
import { TIMEOUTS } from '../config/env.ts'
import { PDF_MAGIC } from '../support/files.ts'
import type { Download, Locator, Page } from '@playwright/test'

/**
 * Building blocks shared by page objects. They encode how the app's UI kit
 * behaves (Radix selects render options in a portal, form fields pair a
 * label with a control and an error line, ...), so a markup change is fixed
 * here once instead of in every spec.
 */

/** Picks `option` in a Radix `<Select>` identified by its trigger. */
export async function chooseOption(trigger: Locator, option: string) {
  const page = trigger.page()
  await trigger.click()
  // Options live in a portal at the end of <body>, outside the trigger.
  await page.getByRole('option', { name: option, exact: true }).click()
  await expect(page.getByRole('listbox')).toBeHidden({ timeout: TIMEOUTS.ui })
}

/** Labels of the options a Radix `<Select>` offers, in display order. */
export async function listOptions(trigger: Locator) {
  const page = trigger.page()
  await trigger.click()
  const labels = await page.getByRole('option').allInnerTexts()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('listbox')).toBeHidden({ timeout: TIMEOUTS.ui })
  return labels.map((label) => label.trim())
}

/**
 * A labelled form field as rendered by the app's `FormField` component:
 *
 *   <div>              <- `root`
 *     <label>Gatunek</label>
 *     ...control...
 *     <p>error</p>     <- only while invalid
 *   </div>
 *
 * Fields are found by their visible label because several inputs in the app
 * carry ids that do not match their label (or repeat), which rules out
 * `getByLabel`.
 */
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

  /** Trigger of a Radix `<Select>` inside the field. */
  get select() {
    return this.root.getByRole('combobox')
  }

  /** Validation message shown under the control. */
  get error() {
    return this.root.locator('p.text-red-500')
  }
}

/**
 * Runs `trigger` and returns the file the browser downloads as a result.
 * Reports are generated server side, so this waits with the slow timeout.
 */
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

/** Asserts that a download is a real, non-empty PDF with the given name. */
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
