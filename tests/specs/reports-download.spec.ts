import { expect, test } from '../fixtures/authenticated'
import { ReportsPage } from '../pages/ReportsPage'

test.describe('Animal Reports Download', () => {
  test('Downloads Report Events file', async ({
    authenticatedPage,
  }, testInfo) => {
    const reportsPage = new ReportsPage(authenticatedPage)

    const download = await reportsPage.downloadEventsReport()

    const savePath = testInfo.outputPath(
      download.suggestedFilename() || 'report-events.pdf',
    )
    await download.saveAs(savePath)
    const downloadPath = await download.path()
    expect(downloadPath).not.toBeNull()
  })

  test('Downloads Report All Animals file', async ({
    authenticatedPage,
  }, testInfo) => {
    const reportsPage = new ReportsPage(authenticatedPage)

    const download = await reportsPage.downloadAllAnimalsReport()

    const savePath = testInfo.outputPath(
      download.suggestedFilename() || 'report-all-animals.pdf',
    )
    await download.saveAs(savePath)
    const downloadPath = await download.path()
    expect(downloadPath).not.toBeNull()
  })

  test('Downloads Report for Selected Animals', async ({
    authenticatedPage,
  }, testInfo) => {
    const reportsPage = new ReportsPage(authenticatedPage)

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
