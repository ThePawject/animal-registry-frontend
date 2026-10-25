import { captureDownload, expectPdfDownload } from '../pages/components.ts'
import {
  DATE_RANGE_REPORT_ERRORS,
  EVENT_REPORT_ERRORS,
} from '../pages/report-cards.ts'
import { buildAnimal, buildAnimals, daysAgo, unique } from '../support/data.ts'
import {
  EVENT_TYPE,
  EVENT_TYPE_LABEL,
  GENERIC_ERROR_MESSAGE,
  SPECIES,
} from '../support/domain.ts'
import { expect, test } from '../support/fixtures.ts'
import {
  failBackendRequests,
  forbidBackendRequests,
  queryValues,
  waitForBackendRequest,
} from '../support/network.ts'

test.use({ shelter: 'isolated' })

const REPORT = {
  selected: { method: 'GET', pathname: '/reports/animals/selected' },
  events: { method: 'GET', pathname: '/reports/events' },
  dateRange: { method: 'GET', pathname: '/reports/animals/date-range' },
} as const

test.describe('Report of all animals', () => {
  test('downloads the full register as a PDF', async ({
    api,
    reportsPage,
    animalsReport,
    page,
    user,
  }) => {
    const [dog, cat] = await api.createAnimals([
      buildAnimal(),
      buildAnimal({ species: 'cat' }),
    ])
    await reportsPage.goto()

    const download = await captureDownload(page, () =>
      animalsReport.generateButton.click(),
    )

    const text = await expectPdfDownload(download)
    expect(text).toContain(user.shelterId)
    expect(text).toContain(dog.name)
    expect(text).toContain(cat.name)
    expect(text).toContain(dog.signature)
    await expect(animalsReport.generateButton).toBeEnabled()
  })
})

test.describe('Report of selected animals', () => {
  test('is only available once animals are selected', async ({
    api,
    reportsPage,
    selectedAnimalsReport,
  }) => {
    const [first, second] = await api.createAnimals([
      buildAnimal(),
      buildAnimal(),
    ])
    await reportsPage.goto()

    await expect(selectedAnimalsReport.generateButton).toBeDisabled()
    await expect(selectedAnimalsReport.summary).toHaveText(
      'Nie wybrano jeszcze żadnego zwierzęcia.',
    )

    await selectedAnimalsReport.choose([first.name!, second.name!])
    await expect(selectedAnimalsReport.generateButton).toBeEnabled()
    await expect(selectedAnimalsReport.summary).toHaveText(
      `Wybrano 2: ${first.name}, ${second.name}`,
    )

    await test.step('clearing the selection disables the report', async () => {
      await selectedAnimalsReport.chooseButton.click()
      await selectedAnimalsReport.clearButton.click()
      await expect(selectedAnimalsReport.selectedCount).toHaveText('Wybrano: 0')
      await selectedAnimalsReport.doneButton.click()
      await expect(selectedAnimalsReport.generateButton).toBeDisabled()
    })
  })

  test('covers exactly the selected animals', async ({
    api,
    reportsPage,
    selectedAnimalsReport,
    page,
  }) => {
    const [first, skipped, third] = await api.createAnimals([
      buildAnimal(),
      buildAnimal(),
      buildAnimal(),
    ])
    await reportsPage.goto()
    await selectedAnimalsReport.choose([first.name!, third.name!])

    const reportRequest = waitForBackendRequest(page, REPORT.selected)
    const download = await captureDownload(page, () =>
      selectedAnimalsReport.generateButton.click(),
    )

    const text = await expectPdfDownload(download)
    expect(text).toContain(first.name)
    expect(text).toContain(third.name)
    expect(text).not.toContain(skipped.name)
    expect(queryValues(await reportRequest, 'ids').sort()).toEqual(
      [first.id, third.id].sort(),
    )
  })

  test('keeps the selection across pages and searches', async ({
    api,
    reportsPage,
    selectedAnimalsReport,
  }) => {
    const animals = await api.createAnimals(buildAnimals(22, unique('Wybor')))
    const newest = animals.at(-1)!
    const oldest = animals[0]
    await reportsPage.goto()
    await selectedAnimalsReport.chooseButton.click()

    await selectedAnimalsReport.animalCheckbox(newest.name!).check()
    await selectedAnimalsReport.nextPageButton.click()
    await expect(selectedAnimalsReport.pageIndicator).toHaveText('Strona 2 z 2')
    await selectedAnimalsReport.animalCheckbox(oldest.name!).check()
    await expect(selectedAnimalsReport.selectedCount).toHaveText('Wybrano: 2')

    await selectedAnimalsReport.search(newest.name!)
    await expect(
      selectedAnimalsReport.animalCheckbox(newest.name!),
    ).toBeChecked()

    await test.step('the header checkbox selects the whole page', async () => {
      await selectedAnimalsReport.searchInput.fill('')
      await expect(selectedAnimalsReport.pageIndicator).toHaveText(
        'Strona 1 z 2',
      )
      await selectedAnimalsReport.selectPageCheckbox.check()
      await expect(selectedAnimalsReport.selectedCount).toHaveText(
        'Wybrano: 21',
      )
    })
  })

  test('is no longer offered on the animal list', async ({ api, panel }) => {
    await api.createAnimal(buildAnimal())
    await panel.goto()

    await expect(panel.table.getByRole('checkbox')).toHaveCount(0)
    await expect(
      panel.page.getByRole('button', { name: /Raport z wybranych/ }),
    ).toHaveCount(0)
  })
})

test.describe('Reports page', () => {
  test.use({ admin: true })

  test('groups the reports in tabs and remembers the open one', async ({
    reportsPage,
    animalsReport,
    eventReport,
    page,
  }) => {
    await reportsPage.goto()

    await expect(reportsPage.tabs).toHaveText(['Zwierzęta', 'Zdarzenia'])
    await expect(animalsReport.root).toBeVisible()
    await expect(eventReport.root).toBeHidden()

    await reportsPage.open('events')
    await expect(eventReport.root).toBeVisible()
    await expect(animalsReport.root).toBeHidden()
    await expect(page).toHaveURL(/[?&]tab=zdarzenia/)

    await page.reload()
    await expect(reportsPage.tab('events')).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  test('shows addon tabs only when the addons are on', async ({
    api,
    reportsPage,
  }) => {
    await api.setFeature('animal-vaccinations', true)
    await api.setFeature('animal-origin', true)
    await reportsPage.goto()

    await expect(reportsPage.tabs).toHaveText([
      'Zwierzęta',
      'Zdarzenia',
      'Szczepienia',
      'Pochodzenie',
    ])
  })
})

test.describe('Event report', () => {
  test.beforeEach(async ({ api, reportsPage }) => {
    const [dog, cat] = await api.createAnimals([
      buildAnimal(),
      buildAnimal({ species: 'cat' }),
    ])
    await api.addEvent(dog.id, {
      type: 'walk',
      occurredOn: daysAgo(2),
      description: 'Spacer do raportu',
    })
    await api.addEvent(cat.id, {
      type: 'weighing',
      occurredOn: daysAgo(20),
      description: 'Wazenie do raportu',
    })
    await reportsPage.goto('events')
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

    const reportRequest = waitForBackendRequest(page, REPORT.events)
    const download = await captureDownload(page, () =>
      eventReport.generateButton.click(),
    )

    const text = await expectPdfDownload(download)
    expect(text).toContain(`${EVENT_TYPE_LABEL.walk} 1`)
    expect(text).toContain(`${EVENT_TYPE_LABEL.weighing} 1`)
    expect(queryValues(await reportRequest, 'periods')).toEqual([
      'Week',
      'Month',
      'Quarter',
    ])
  })

  test('can be limited to a single period', async ({ eventReport, page }) => {
    await eventReport.setPeriods(['Ostatni tydzień'])

    const reportRequest = waitForBackendRequest(page, REPORT.events)
    const download = await captureDownload(page, () =>
      eventReport.generateButton.click(),
    )

    const text = await expectPdfDownload(download)
    expect(text).toContain(`${EVENT_TYPE_LABEL.walk} 1`)
    expect(text).not.toContain(EVENT_TYPE_LABEL.weighing)
    expect(queryValues(await reportRequest, 'periods')).toEqual(['Week'])
  })

  test('supports a custom date range', async ({ eventReport, page }) => {
    await eventReport.setPeriods(['Własny zakres dat'])
    await expect(eventReport.customStartDate).toBeVisible()
    await eventReport.customStartDate.fill(daysAgo(25))
    await eventReport.customEndDate.fill(daysAgo(10))

    const reportRequest = waitForBackendRequest(page, REPORT.events)
    const download = await captureDownload(page, () =>
      eventReport.generateButton.click(),
    )

    const text = await expectPdfDownload(download)
    expect(text).toContain(`${EVENT_TYPE_LABEL.weighing} 1`)
    expect(text).not.toContain(EVENT_TYPE_LABEL.walk)
    const request = await reportRequest
    expect(queryValues(request, 'periods')).toEqual(['Custom'])
    expect(queryValues(request, 'customStartDate')).toEqual([daysAgo(25)])
    expect(queryValues(request, 'customEndDate')).toEqual([daysAgo(10)])
  })

  test('validates the chosen periods before asking the server', async ({
    eventReport,
    page,
  }) => {
    const backend = await forbidBackendRequests(page, REPORT.events)

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
      await expect(eventReport.error).toBeHidden()
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

    await backend.expectNoneSent()
    await expect(eventReport.root).toBeVisible()
  })

  test('forgets a custom range when it is unticked', async ({
    eventReport,
  }) => {
    await eventReport.period('Własny zakres dat').check()
    await eventReport.customStartDate.fill(daysAgo(10))
    await eventReport.customEndDate.fill(daysAgo(1))

    await eventReport.period('Własny zakres dat').uncheck()
    await expect(eventReport.customStartDate).toBeHidden()
    await eventReport.period('Własny zakres dat').check()
    await expect(eventReport.customStartDate).toHaveValue('')
    await expect(eventReport.customEndDate).toHaveValue('')
  })

  test('reports a server failure and can be tried again', async ({
    eventReport,
    page,
  }) => {
    await failBackendRequests(page, REPORT.events)

    await eventReport.generateButton.click()

    await expect(eventReport.error).toHaveText(GENERIC_ERROR_MESSAGE)
    await expect(eventReport.generateButton).toBeEnabled()
  })
})

test.describe('Date range report', () => {
  const walkedDog = buildAnimal({ species: 'dog' })
  const adoptedCat = buildAnimal({ species: 'cat' })
  const weighedCat = buildAnimal({ species: 'cat' })

  test.beforeEach(async ({ api, reportsPage }) => {
    const [dog, adopted, weighed] = await api.createAnimals([
      walkedDog,
      adoptedCat,
      weighedCat,
    ])
    await api.addEvent(dog.id, {
      type: 'walk',
      occurredOn: daysAgo(4),
      description: 'Spacer w zakresie',
    })
    await api.addEvent(adopted.id, {
      type: 'adoption',
      occurredOn: daysAgo(3),
      description: 'Adopcja w zakresie',
    })
    await api.addEvent(weighed.id, {
      type: 'weighing',
      occurredOn: daysAgo(2),
      description: 'Wazenie w zakresie',
    })
    await reportsPage.goto('events')
  })

  test('requires a start and an end date, in that order', async ({
    dateRangeReport,
    page,
  }) => {
    const backend = await forbidBackendRequests(page, REPORT.dateRange)
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

    await backend.expectNoneSent()
    await expect(dateRangeReport.root).toBeVisible()
  })

  test('covers all species and event types unless narrowed down', async ({
    dateRangeReport,
    page,
  }) => {
    await dateRangeReport.setRange(daysAgo(30), daysAgo(0))

    const reportRequest = waitForBackendRequest(page, REPORT.dateRange)
    const download = await captureDownload(page, () =>
      dateRangeReport.generateButton.click(),
    )

    const text = await expectPdfDownload(download)
    for (const animal of [walkedDog, adoptedCat, weighedCat]) {
      expect(text).toContain(animal.name)
    }
    expect(text).toContain('Spacer w zakresie')
    const request = await reportRequest
    expect(queryValues(request, 'startDate')).toEqual([daysAgo(30)])
    expect(queryValues(request, 'endDate')).toEqual([daysAgo(0)])
    expect(queryValues(request, 'species')).toEqual([
      String(SPECIES.dog),
      String(SPECIES.cat),
    ])
    expect(queryValues(request, 'eventTypes')).toEqual([])
  })

  test('leaves out events outside the chosen dates', async ({
    dateRangeReport,
    page,
  }) => {
    await dateRangeReport.setRange(daysAgo(30), daysAgo(10))

    const download = await captureDownload(page, () =>
      dateRangeReport.generateButton.click(),
    )

    const text = await expectPdfDownload(download)
    expect(text).not.toContain('Spacer w zakresie')
    expect(text).not.toContain('Adopcja w zakresie')
  })

  test('can be narrowed to a species', async ({ dateRangeReport, page }) => {
    await dateRangeReport.setRange(daysAgo(30), daysAgo(0))
    await dateRangeReport.pick(dateRangeReport.speciesField, ['Koty'])
    await expect(
      dateRangeReport.chips(dateRangeReport.speciesField),
    ).toHaveText(['Koty'])

    const reportRequest = waitForBackendRequest(page, REPORT.dateRange)
    const download = await captureDownload(page, () =>
      dateRangeReport.generateButton.click(),
    )

    const text = await expectPdfDownload(download)
    expect(text).toContain(adoptedCat.name)
    expect(text).toContain(weighedCat.name)
    expect(text).not.toContain(walkedDog.name)
    expect(queryValues(await reportRequest, 'species')).toEqual([
      String(SPECIES.cat),
    ])
  })

  test('can be narrowed to chosen event types', async ({
    dateRangeReport,
    page,
  }) => {
    await dateRangeReport.setRange(daysAgo(30), daysAgo(0))
    await dateRangeReport.pick(dateRangeReport.eventTypeField, [
      'Adopcja',
      'Spacer',
    ])
    await expect(
      dateRangeReport.chips(dateRangeReport.eventTypeField),
    ).toHaveText(['Adopcja', 'Spacer'])

    const reportRequest = waitForBackendRequest(page, REPORT.dateRange)
    const download = await captureDownload(page, () =>
      dateRangeReport.generateButton.click(),
    )

    const text = await expectPdfDownload(download)
    expect(text).toContain('Spacer w zakresie')
    expect(text).toContain('Adopcja w zakresie')
    expect(text).not.toContain('Wazenie w zakresie')
    expect(queryValues(await reportRequest, 'eventTypes')).toEqual([
      String(EVENT_TYPE.adoption),
      String(EVENT_TYPE.walk),
    ])
  })

  test('clears the filters once the report is downloaded', async ({
    dateRangeReport,
    page,
  }) => {
    await dateRangeReport.setRange(daysAgo(30), daysAgo(0))
    await dateRangeReport.pick(dateRangeReport.speciesField, ['Psy'])

    const download = await captureDownload(page, () =>
      dateRangeReport.generateButton.click(),
    )

    await expectPdfDownload(download)
    await expect(dateRangeReport.startDateField.input).toHaveValue('')
    await expect(dateRangeReport.endDateField.input).toHaveValue('')
    await expect(
      dateRangeReport.chips(dateRangeReport.speciesField),
    ).toHaveCount(0)
  })

  test('reports a server failure and can be tried again', async ({
    dateRangeReport,
    page,
  }) => {
    await failBackendRequests(page, REPORT.dateRange)
    await dateRangeReport.setRange(daysAgo(30), daysAgo(0))

    await dateRangeReport.generateButton.click()

    await expect(
      dateRangeReport.root.getByText(GENERIC_ERROR_MESSAGE),
    ).toBeVisible()
    await expect(dateRangeReport.generateButton).toBeEnabled()
  })
})
