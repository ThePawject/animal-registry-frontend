import { URLS } from '../config/env.ts'
import { captureDownload, expectPdfDownload } from '../pages/components.ts'
import {
  DATE_RANGE_REPORT_ERRORS,
  EVENT_REPORT_ERRORS,
} from '../pages/report-dialogs.ts'
import { buildAnimal, buildAnimals, daysAgo } from '../support/data.ts'
import {
  EVENT_TYPE,
  GENERIC_ERROR_MESSAGE,
  SPECIES,
} from '../support/domain.ts'
import { expect, test } from '../support/fixtures.ts'
import type { Page, Request } from '@playwright/test'

/**
 * PDF reports available from the register: the full dump, the report for
 * selected animals, the event report and the date-range report.
 *
 * Each test checks two things: that the app asks the backend for the right
 * report (the request parameters) and that the user ends up with a real PDF.
 */

test.use({ shelter: 'isolated' })

/** Resolves with the first request the app sends to a report endpoint. */
function waitForReportRequest(page: Page, endpoint: string) {
  return page.waitForRequest(
    (request) => new URL(request.url()).pathname === `/reports/${endpoint}`,
  )
}

/** Values of a query parameter, whether sent as `key=` or `key[]=`. */
function queryValues(request: Request, key: string) {
  const params = new URL(request.url()).searchParams
  return [...params.getAll(key), ...params.getAll(`${key}[]`)]
}

/** Makes a report endpoint fail, as it would during a backend outage. */
async function failReport(page: Page, endpoint: string) {
  await page.route(`${URLS.backend}/reports/${endpoint}*`, (route) =>
    route.fulfill({
      status: 500,
      headers: { 'Access-Control-Allow-Origin': URLS.frontend },
      body: 'boom',
    }),
  )
}

test.describe('Report of all animals', () => {
  test('downloads the full register as a PDF', async ({ api, panel, page }) => {
    await api.createAnimals([buildAnimal(), buildAnimal({ species: 'cat' })])
    await panel.goto()

    const download = await captureDownload(page, () =>
      panel.allAnimalsReportButton.click(),
    )

    await expectPdfDownload(download)
    await expect(panel.allAnimalsReportButton).toBeEnabled()
    await expect(panel.allAnimalsReportButton).toHaveText(
      'Raport wszystkie zwierzeta',
    )
  })
})

test.describe('Report of selected animals', () => {
  test('is only available once animals are selected', async ({
    api,
    panel,
  }) => {
    const [first, second] = await api.createAnimals([
      buildAnimal(),
      buildAnimal(),
    ])
    await panel.goto()

    await expect(panel.selectedAnimalsReportButton).toBeDisabled()
    await expect(panel.selectedAnimalsReportButton).toHaveText(
      'Raport z wybranych zwierzat',
    )
    await expect(panel.selectAllCheckbox).toBeHidden()

    await panel.row(first.name!).checkbox.check()
    await expect(panel.selectedAnimalsReportButton).toBeEnabled()
    await expect(panel.selectedAnimalsReportButton).toHaveText(
      'Raport z wybranych zwierzat (1)',
    )

    await panel.row(second.name!).checkbox.check()
    await expect(panel.selectedAnimalsReportButton).toHaveText(
      'Raport z wybranych zwierzat (2)',
    )

    await test.step('unchecking a row removes it from the selection', async () => {
      await panel.row(first.name!).checkbox.uncheck()
      await expect(panel.selectedAnimalsReportButton).toHaveText(
        'Raport z wybranych zwierzat (1)',
      )
    })

    await test.step('the header checkbox clears the whole selection', async () => {
      await panel.selectAllCheckbox.click()
      await expect(panel.selectedAnimalsReportButton).toBeDisabled()
      await expect(panel.row(second.name!).checkbox).not.toBeChecked()
    })
  })

  test('covers exactly the selected animals', async ({ api, panel, page }) => {
    const [first, , third] = await api.createAnimals([
      buildAnimal(),
      buildAnimal(),
      buildAnimal(),
    ])
    await panel.goto()
    await panel.row(first.name!).checkbox.check()
    await panel.row(third.name!).checkbox.check()

    const reportRequest = waitForReportRequest(page, 'animals/selected')
    const download = await captureDownload(page, () =>
      panel.selectedAnimalsReportButton.click(),
    )

    await expectPdfDownload(download)
    expect(queryValues(await reportRequest, 'ids').sort()).toEqual(
      [first.id, third.id].sort(),
    )
  })

  test('remembers the selection while paging through the register', async ({
    api,
    panel,
    page,
  }) => {
    const animals = await api.createAnimals(buildAnimals(12, 'Wybor'))
    // The register is ordered by signature, newest first.
    const onFirstPage = animals.at(-1)!
    const onSecondPage = animals[0]

    await panel.goto({ pageSize: 10 })
    await panel.row(onFirstPage.name!).checkbox.check()
    await panel.nextPageButton.click()
    await panel.expectPage(2, 2)
    await panel.row(onSecondPage.name!).checkbox.check()

    await expect(panel.selectedAnimalsReportButton).toHaveText(
      'Raport z wybranych zwierzat (2)',
    )

    const reportRequest = waitForReportRequest(page, 'animals/selected')
    const download = await captureDownload(page, () =>
      panel.selectedAnimalsReportButton.click(),
    )
    await expectPdfDownload(download)
    expect(queryValues(await reportRequest, 'ids').sort()).toEqual(
      [onFirstPage.id, onSecondPage.id].sort(),
    )
  })
})

test.describe('Event report', () => {
  test.beforeEach(async ({ api, panel }) => {
    const animal = await api.createAnimal(buildAnimal())
    await api.addEvent(animal.id, {
      type: 'walk',
      occurredOn: daysAgo(2),
      description: 'Spacer do raportu',
    })
    await panel.goto()
    await panel.eventReportButton.click()
  })

  test('covers the last week, month and quarter by default', async ({
    eventReport,
    page,
  }) => {
    await expect(eventReport.root).toBeVisible()
    await expect(eventReport.period('Ostatni tydzień')).toBeChecked()
    await expect(eventReport.period('Ostatni miesiąc')).toBeChecked()
    await expect(eventReport.period('Ostatni kwartał')).toBeChecked()
    await expect(eventReport.period('Własny zakres dat')).not.toBeChecked()
    await expect(eventReport.customStartDate).toBeHidden()

    const reportRequest = waitForReportRequest(page, 'events')
    const download = await captureDownload(page, () =>
      eventReport.generateButton.click(),
    )

    await expectPdfDownload(download)
    expect(queryValues(await reportRequest, 'periods')).toEqual([
      'Week',
      'Month',
      'Quarter',
    ])
    await eventReport.expectClosed()
  })

  test('can be limited to a single period', async ({ eventReport, page }) => {
    await eventReport.setPeriods(['Ostatni miesiąc'])

    const reportRequest = waitForReportRequest(page, 'events')
    const download = await captureDownload(page, () =>
      eventReport.generateButton.click(),
    )

    await expectPdfDownload(download)
    expect(queryValues(await reportRequest, 'periods')).toEqual(['Month'])
  })

  test('supports a custom date range', async ({ eventReport, page }) => {
    await eventReport.setPeriods(['Własny zakres dat'])
    await expect(eventReport.customStartDate).toBeVisible()
    await eventReport.customStartDate.fill(daysAgo(10))
    await eventReport.customEndDate.fill(daysAgo(1))

    const reportRequest = waitForReportRequest(page, 'events')
    const download = await captureDownload(page, () =>
      eventReport.generateButton.click(),
    )

    await expectPdfDownload(download)
    const request = await reportRequest
    expect(queryValues(request, 'periods')).toEqual(['Custom'])
    expect(queryValues(request, 'customStartDate')).toEqual([daysAgo(10)])
    expect(queryValues(request, 'customEndDate')).toEqual([daysAgo(1)])
  })

  test('validates the chosen periods before asking the server', async ({
    eventReport,
    page,
  }) => {
    let requests = 0
    page.on('request', (request) => {
      if (request.url().includes('/reports/events')) requests++
    })

    await test.step('at least one period is required', async () => {
      await eventReport.setPeriods([])
      await eventReport.generateButton.click()
      await expect(eventReport.error).toHaveText(EVENT_REPORT_ERRORS.noPeriod)
    })

    await test.step('choosing a period clears the error', async () => {
      await eventReport.period('Własny zakres dat').check()
      await expect(eventReport.error).toBeHidden()
    })

    await test.step('a custom range needs both dates', async () => {
      await eventReport.generateButton.click()
      await expect(eventReport.error).toHaveText(
        EVENT_REPORT_ERRORS.customRangeIncomplete,
      )
      await eventReport.customStartDate.fill(daysAgo(1))
      await eventReport.generateButton.click()
      await expect(eventReport.error).toHaveText(
        EVENT_REPORT_ERRORS.customRangeIncomplete,
      )
    })

    await test.step('the range cannot end before it starts', async () => {
      await eventReport.customEndDate.fill(daysAgo(5))
      await eventReport.generateButton.click()
      await expect(eventReport.error).toHaveText(
        EVENT_REPORT_ERRORS.customRangeInverted,
      )
    })

    expect(requests).toBe(0)
    await expect(eventReport.root).toBeVisible()
  })

  test('forgets a custom range when it is unticked or the dialog is cancelled', async ({
    eventReport,
    panel,
  }) => {
    await eventReport.period('Własny zakres dat').check()
    await eventReport.customStartDate.fill(daysAgo(10))
    await eventReport.customEndDate.fill(daysAgo(1))

    await test.step('unticking hides and clears the dates', async () => {
      await eventReport.period('Własny zakres dat').uncheck()
      await expect(eventReport.customStartDate).toBeHidden()
      await eventReport.period('Własny zakres dat').check()
      await expect(eventReport.customStartDate).toHaveValue('')
      await expect(eventReport.customEndDate).toHaveValue('')
    })

    await test.step('cancelling restores the defaults', async () => {
      await eventReport.setPeriods(['Własny zakres dat'])
      await eventReport.cancelButton.click()
      await eventReport.expectClosed()

      await panel.eventReportButton.click()
      await expect(eventReport.period('Ostatni tydzień')).toBeChecked()
      await expect(eventReport.period('Ostatni miesiąc')).toBeChecked()
      await expect(eventReport.period('Ostatni kwartał')).toBeChecked()
      await expect(eventReport.period('Własny zakres dat')).not.toBeChecked()
    })
  })

  test('reports a server failure and stays open for another try', async ({
    eventReport,
    page,
  }) => {
    await failReport(page, 'events')

    await eventReport.generateButton.click()

    await expect(eventReport.error).toHaveText(GENERIC_ERROR_MESSAGE)
    await expect(eventReport.root).toBeVisible()
    await expect(eventReport.generateButton).toBeEnabled()
  })
})

test.describe('Date range report', () => {
  test.beforeEach(async ({ api, panel }) => {
    const animal = await api.createAnimal(buildAnimal({ species: 'cat' }))
    await api.addEvent(animal.id, {
      type: 'adoption',
      occurredOn: daysAgo(3),
      description: 'Adopcja do raportu',
    })
    await panel.goto()
    await panel.dateRangeReportButton.click()
  })

  test('requires a start and an end date, in that order', async ({
    dateRangeReport,
    page,
  }) => {
    let requests = 0
    page.on('request', (request) => {
      if (request.url().includes('/reports/animals/date-range')) requests++
    })
    await expect(dateRangeReport.root).toBeVisible()

    await dateRangeReport.generateButton.click()
    await expect(dateRangeReport.startDateField.error).toHaveText(
      DATE_RANGE_REPORT_ERRORS.startRequired,
    )
    await expect(dateRangeReport.endDateField.error).toHaveText(
      DATE_RANGE_REPORT_ERRORS.endRequired,
    )

    await test.step('the end must be later than the start', async () => {
      await dateRangeReport.setRange(daysAgo(5), daysAgo(10))
      await expect(dateRangeReport.endDateField.error).toHaveText(
        DATE_RANGE_REPORT_ERRORS.endNotAfterStart,
      )
      await dateRangeReport.setRange(daysAgo(5), daysAgo(5))
      await expect(dateRangeReport.endDateField.error).toHaveText(
        DATE_RANGE_REPORT_ERRORS.endNotAfterStart,
      )
      await dateRangeReport.generateButton.click()
    })

    expect(requests).toBe(0)
    await expect(dateRangeReport.root).toBeVisible()
  })

  test('covers all species and event types unless narrowed down', async ({
    dateRangeReport,
    page,
  }) => {
    await dateRangeReport.setRange(daysAgo(30), daysAgo(0))

    const reportRequest = waitForReportRequest(page, 'animals/date-range')
    const download = await captureDownload(page, () =>
      dateRangeReport.generateButton.click(),
    )

    await expectPdfDownload(download)
    const request = await reportRequest
    expect(queryValues(request, 'startDate')).toEqual([daysAgo(30)])
    expect(queryValues(request, 'endDate')).toEqual([daysAgo(0)])
    expect(queryValues(request, 'species')).toEqual([
      String(SPECIES.dog),
      String(SPECIES.cat),
    ])
    expect(queryValues(request, 'eventTypes')).toEqual([])
    await dateRangeReport.expectClosed()
  })

  test('can be narrowed to chosen species and event types', async ({
    dateRangeReport,
    page,
  }) => {
    await dateRangeReport.setRange(daysAgo(30), daysAgo(0))
    await dateRangeReport.pick(dateRangeReport.eventTypeField, [
      'Adopcja',
      'Spacer',
    ])
    await dateRangeReport.pick(dateRangeReport.speciesField, ['Koty'])

    await expect(
      dateRangeReport.chips(dateRangeReport.eventTypeField),
    ).toHaveText(['Adopcja', 'Spacer'])
    await expect(
      dateRangeReport.chips(dateRangeReport.speciesField),
    ).toHaveText(['Koty'])

    const reportRequest = waitForReportRequest(page, 'animals/date-range')
    const download = await captureDownload(page, () =>
      dateRangeReport.generateButton.click(),
    )

    await expectPdfDownload(download)
    const request = await reportRequest
    expect(queryValues(request, 'species')).toEqual([String(SPECIES.cat)])
    expect(queryValues(request, 'eventTypes')).toEqual([
      String(EVENT_TYPE.adoption),
      String(EVENT_TYPE.walk),
    ])
  })

  test('cancelling discards the filters', async ({
    dateRangeReport,
    panel,
  }) => {
    await dateRangeReport.setRange(daysAgo(30), daysAgo(0))
    await dateRangeReport.pick(dateRangeReport.speciesField, ['Psy'])

    await dateRangeReport.cancelButton.click()
    await dateRangeReport.expectClosed()

    await panel.dateRangeReportButton.click()
    await expect(dateRangeReport.startDateField.input).toHaveValue('')
    await expect(dateRangeReport.endDateField.input).toHaveValue('')
    await expect(
      dateRangeReport.chips(dateRangeReport.speciesField),
    ).toHaveCount(0)
  })

  test('reports a server failure and stays open for another try', async ({
    dateRangeReport,
    page,
  }) => {
    await failReport(page, 'animals/date-range')
    await dateRangeReport.setRange(daysAgo(30), daysAgo(0))

    await dateRangeReport.generateButton.click()

    await expect(
      dateRangeReport.root.getByText(GENERIC_ERROR_MESSAGE),
    ).toBeVisible()
    await expect(dateRangeReport.root).toBeVisible()
    await expect(dateRangeReport.generateButton).toBeEnabled()
  })
})
