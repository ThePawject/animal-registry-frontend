import { expect, test } from '@playwright/test'
import { ReportsPage } from '../pages/ReportsPage'

test.describe('Animal Reports Download', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')
  })

  test('Downloads Report Events file', async ({
    page,
  }, testInfo) => {
    const reportsPage = new ReportsPage(page)

    const download = await reportsPage.downloadEventsReport()

    const savePath = testInfo.outputPath(
      download.suggestedFilename() || 'report-events.pdf',
    )
    await download.saveAs(savePath)
    const downloadPath = await download.path()
    expect(downloadPath).not.toBeNull()
  })

  test('Downloads Report All Animals file', async ({
    page,
  }, testInfo) => {
    const reportsPage = new ReportsPage(page)

    const download = await reportsPage.downloadAllAnimalsReport()

    const savePath = testInfo.outputPath(
      download.suggestedFilename() || 'report-all-animals.pdf',
    )
    await download.saveAs(savePath)
    const downloadPath = await download.path()
    expect(downloadPath).not.toBeNull()
  })

  test('Downloads Report for Selected Animals', async ({
    page,
  }, testInfo) => {
    const reportsPage = new ReportsPage(page)

    await reportsPage.selectFirstAnimal()
    const download = await reportsPage.downloadSelectedAnimalsReport()

    const savePath = testInfo.outputPath(
      download.suggestedFilename() || 'report-selected-animals.pdf',
    )
    await download.saveAs(savePath)
    const downloadPath = await download.path()
    expect(downloadPath).not.toBeNull()
  })
})
