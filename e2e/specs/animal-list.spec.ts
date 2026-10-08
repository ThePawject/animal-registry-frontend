import { URLS } from '../config/env.ts'
import { AnimalFormPage } from '../pages/animal-form.page.ts'
import { expectImageLoaded } from '../pages/components.ts'
import { ANIMAL_TABLE_COLUMNS, PanelPage } from '../pages/panel.page.ts'
import { mainPhotoOf } from '../support/api-client.ts'
import { SEARCH_INFO_DISMISSED_KEY } from '../support/auth-session.ts'
import {
  asRegisterDate,
  buildAnimal,
  buildAnimals,
  daysAgo,
  unique,
} from '../support/data.ts'
import {
  EMPTY_VALUE,
  SEX_LABEL,
  SHELTER_STATUS_LABEL,
  SPECIES_LABEL,
} from '../support/domain.ts'
import { COLORS, pngImage } from '../support/files.ts'
import { expect, test } from '../support/fixtures.ts'

test.use({ shelter: 'isolated' })

test.describe('Animal register', () => {
  test('a new shelter starts with an empty register', async ({
    panel,
    auth,
    user,
  }) => {
    await panel.goto()

    await auth.expectSignedInTo(user)
    await panel.expectEmpty()
    await expect(panel.addAnimalLink).toBeVisible()

    await test.step('paging shows a single page with nowhere to go', async () => {
      await panel.expectPage(1, 1)
      for (const button of [
        panel.firstPageButton,
        panel.previousPageButton,
        panel.nextPageButton,
        panel.lastPageButton,
      ]) {
        await expect(button).toBeDisabled()
      }
    })
  })

  test('lists every animal with its data, newest signature first', async ({
    api,
    panel,
  }) => {
    const [complete, minimal] = await api.createAnimals([
      buildAnimal({
        species: 'cat',
        sex: 'female',
        breed: 'Perski',
        color: 'Biały',
        distinguishingMarks: 'Czarny nos',
        birthDate: daysAgo(800),
        photos: [pngImage('portrait.png')],
      }),
      { species: 'cat' },
    ])

    await panel.goto()

    await expect(panel.table.locator('th')).toHaveText([
      '',
      ...ANIMAL_TABLE_COLUMNS,
    ])
    await panel.expectColumn('Oznaczenie', [
      minimal.signature,
      complete.signature,
    ])

    await test.step('an animal with complete data', async () => {
      const row = panel.row(complete.name!)
      await expect(row.cell('Oznaczenie')).toHaveText(complete.signature)
      await expect(row.cell('Imię')).toHaveText(complete.name!)
      await expect(row.cell('Rasa')).toHaveText('Perski')
      await expect(row.cell('Znaki szczególne')).toHaveText('Czarny nos')
      await expect(row.cell('Gatunek')).toHaveText(SPECIES_LABEL.cat)
      await expect(row.cell('Płeć')).toHaveText(SEX_LABEL.female)
      await expect(row.cell('Umaszczenie')).toHaveText('Biały')
      await expect(row.cell('Wiek')).toHaveText(/^2 lat/)
      await expect(row.cell('Status')).toHaveText(
        SHELTER_STATUS_LABEL.inShelter,
      )
      await expect(row.photo).toHaveAttribute('alt', complete.name!)
      await expectImageLoaded(row.photo)
    })

    await test.step('an animal with only the required data', async () => {
      const row = panel.row(minimal.signature)
      await expect(row.cell('Zdjęcie')).toHaveText('Brak')
      await expect(row.cell('Imię')).toHaveText(EMPTY_VALUE.table)
      await expect(row.cell('Rasa')).toHaveText(EMPTY_VALUE.table)
      await expect(row.cell('Znaki szczególne')).toHaveText(EMPTY_VALUE.table)
      await expect(row.cell('Gatunek')).toHaveText(SPECIES_LABEL.cat)
      await expect(row.cell('Płeć')).toHaveText(SEX_LABEL.unknown)
      await expect(row.cell('Umaszczenie')).toHaveText(EMPTY_VALUE.table)
      await expect(row.cell('Wiek')).toHaveText('Brak danych')
    })
  })

  test('prints the age in the most fitting unit', async ({ api, panel }) => {
    const cases = [
      { born: daysAgo(2), age: /^Mniej niż tydzień$/ },
      { born: daysAgo(14), age: /^2 tyg\.$/ },
      { born: daysAgo(100), age: /^3 mies\. 1 tyg\.$/ },
      { born: daysAgo(800), age: /^2 lat 2 mies\.$/ },
    ]
    const animals = await api.createAnimals(
      cases.map(({ born }) => buildAnimal({ birthDate: born })),
    )

    await panel.goto()

    for (const [index, { age }] of cases.entries()) {
      await expect(panel.row(animals[index].name!).cell('Wiek')).toHaveText(age)
    }
  })

  test('shows when each animal was added', async ({ api, panel }) => {
    const animal = await api.createAnimal(buildAnimal())

    await panel.goto()

    await expect(panel.row(animal.name!).cell('Data dodania')).toHaveText(
      asRegisterDate(daysAgo(0)),
    )
  })

  test('shows placeholder rows while the register is loading', async ({
    api,
    panel,
    page,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    let release: () => void = () => undefined
    const held = new Promise<void>((resolve) => (release = resolve))
    await page.route(
      `${URLS.backend}/animals?*keyWordSearch=*`,
      async (route) => {
        await held
        await route.fallback()
      },
    )

    await page.goto(
      `${PanelPage.path}?query=${encodeURIComponent(animal.name!)}`,
    )

    await expect(
      panel.table.locator('[data-slot="skeleton"]').first(),
    ).toBeVisible()
    await expect(panel.rows).toHaveCount(0)

    release()
    await panel.expectAnimals([animal.name!])
  })

  test('ignores nonsense in the address and falls back to defaults', async ({
    api,
    panel,
    page,
  }) => {
    const animal = await api.createAnimal(buildAnimal())

    await page.goto(
      `${PanelPage.path}?page=-3&pageSize=7&species=9&isInShelter=maybe`,
    )

    await panel.expectAnimals([animal.name!])
    await panel.expectPage(1, 1)
    await expect(panel.pageSizeSelect).toHaveText('20')
    await expect(panel.speciesFilter).toHaveText('Wszystkie gatunki')
    await expect(panel.statusFilter).toHaveText('Wszystkie statusy')
  })

  test('the row action opens the animal card', async ({
    api,
    panel,
    animalDetails,
  }) => {
    const animal = await api.createAnimal(buildAnimal())
    await panel.goto()

    await panel.openDetails(animal.name!)

    await animalDetails.expectOpen(animal.id)
    await expect(animalDetails.heading).toHaveText(animal.name!)
  })

  test('"Dodaj zwierzę" opens the create form, breadcrumbs lead back', async ({
    panel,
    animalForm,
    breadcrumbs,
    page,
  }) => {
    await panel.goto()
    await expect(breadcrumbs.root).toBeHidden()

    await panel.addAnimalLink.click()

    await expect(page).toHaveURL(new RegExp(`${AnimalFormPage.createPath}/?$`))
    await expect(animalForm.createButton).toBeVisible()
    await breadcrumbs.expectTrail(['Lista Zwierząt', 'Dodaj zwierzę'])

    await breadcrumbs.link('Lista Zwierząt').click()
    await expect(page).toHaveURL(new RegExp(`${PanelPage.path}`))
    await panel.expectLoaded()
  })
})

test.describe('Searching the register', () => {
  test('finds animals by any of the searchable fields', async ({
    api,
    panel,
  }) => {
    const byName = await api.createAnimal(
      buildAnimal({ name: unique('Reksio') }),
    )
    const byChip = await api.createAnimal(
      buildAnimal({ transponderCode: '616093900012345' }),
    )
    const byColor = await api.createAnimal(
      buildAnimal({ color: 'Szylkretowy' }),
    )
    const byBreed = await api.createAnimal(buildAnimal({ breed: 'Jamnik' }))
    const byMarks = await api.createAnimal(
      buildAnimal({ distinguishingMarks: 'Brak ogona' }),
    )
    const byEvent = await api.createAnimal(buildAnimal())
    await api.addEvent(byEvent.id, {
      type: 'weighing',
      occurredOn: daysAgo(3),
      description: 'Waga dwanascie kilo',
    })
    const everyone = [byName, byChip, byColor, byBreed, byMarks, byEvent]

    await panel.goto()
    await panel.expectAnimals(everyone.map((animal) => animal.name!))

    const cases = [
      { field: 'name', term: byName.name!, match: byName },
      { field: 'signature', term: byChip.signature, match: byChip },
      { field: 'chip number', term: '616093900012345', match: byChip },
      { field: 'colour', term: 'Szylkretowy', match: byColor },
      { field: 'breed', term: 'Jamnik', match: byBreed },
      { field: 'distinguishing marks', term: 'Brak ogona', match: byMarks },
      { field: 'event description', term: 'dwanascie kilo', match: byEvent },
      { field: 'a fragment, ignoring case', term: 'szylkret', match: byColor },
    ]
    for (const { field, term, match } of cases) {
      await test.step(`by ${field}: "${term}"`, async () => {
        await panel.search(term)
        await panel.expectAnimals([match.name!])
      })
    }

    await test.step('no match shows the empty state', async () => {
      await panel.search(unique('nieistniejace'))
      await panel.expectEmpty()
    })

    await test.step('clearing the box brings everything back', async () => {
      await panel.search('')
      await panel.expectAnimals(everyone.map((animal) => animal.name!))
    })
  })

  test('requires every word to match, in any field', async ({ api, panel }) => {
    const [blackLabrador, blackCat] = await api.createAnimals([
      buildAnimal({ color: 'Czarny', breed: 'Labrador' }),
      buildAnimal({ color: 'Czarny', breed: 'Dachowiec', species: 'cat' }),
    ])
    await panel.goto()

    await panel.search('czarny')
    await panel.expectAnimals([blackLabrador.name!, blackCat.name!])

    await panel.search('czarny labrador')
    await panel.expectAnimals([blackLabrador.name!])
  })

  test('keeps the query in the address so a search can be shared', async ({
    api,
    panel,
    page,
  }) => {
    const [wanted] = await api.createAnimals([buildAnimal(), buildAnimal()])

    await panel.goto({ query: wanted.name! })

    await expect(panel.searchInput).toHaveValue(wanted.name!)
    await panel.expectAnimals([wanted.name!])

    await test.step('and survives a reload', async () => {
      await page.reload()
      await expect(panel.searchInput).toHaveValue(wanted.name!)
      await panel.expectAnimals([wanted.name!])
    })
  })

  test('explains how search works until the hint is dismissed', async ({
    panel,
    page,
  }) => {
    await panel.goto()
    await page.evaluate(
      (key) => localStorage.removeItem(key),
      SEARCH_INFO_DISMISSED_KEY,
    )
    await page.reload()
    await panel.expectLoaded()

    await test.step('focusing the search box opens the hint', async () => {
      await panel.searchInput.focus()
      await expect(panel.searchInfoPopover).toBeVisible()
      for (const field of [
        'Oznaczenie',
        'Numer chipa',
        'Imię',
        'Umaszczenie',
        'Rasa',
        'Znaki Szczególne',
        'Wydarzenia',
      ]) {
        await expect(
          panel.searchInfoPopover.getByText(field, { exact: true }),
        ).toBeVisible()
      }
    })

    await test.step('"Nie pokazuj ponownie" closes it for good', async () => {
      await panel.dismissSearchInfoButton.click()
      await expect(panel.searchInfoPopover).toBeHidden()

      await page.reload()
      await panel.expectLoaded()
      await panel.searchInput.focus()
      await panel.searchInput.fill('a')
      await expect(panel.searchInfoPopover).toBeHidden()
    })

    await test.step('the info button still opens it on demand', async () => {
      await panel.searchInfoButton.click()
      await expect(panel.searchInfoPopover).toBeVisible()
    })
  })
})

test.describe('Filtering the register', () => {
  test('by species', async ({ api, panel, page }) => {
    const [dog, cat] = await api.createAnimals([
      buildAnimal({ species: 'dog' }),
      buildAnimal({ species: 'cat' }),
    ])
    await panel.goto()

    await panel.filterBySpecies('Pies')
    await panel.expectAnimals([dog.name!])
    await expect(page).toHaveURL(/[?&]species=1(&|$)/)

    await panel.filterBySpecies('Kot')
    await panel.expectAnimals([cat.name!])
    await expect(page).toHaveURL(/[?&]species=2(&|$)/)

    await panel.filterBySpecies('Wszystkie gatunki')
    await panel.expectAnimals([dog.name!, cat.name!])
    await expect(page).not.toHaveURL(/[?&]species=/)
  })

  test('by shelter status', async ({ api, panel }) => {
    const [resident, adopted] = await api.createAnimals([
      buildAnimal(),
      buildAnimal(),
    ])
    await api.addEvent(adopted.id, {
      type: 'adoption',
      occurredOn: daysAgo(1),
      description: 'Adopcja',
    })
    await panel.goto()

    await expect(panel.row(resident.name!).cell('Status')).toHaveText(
      SHELTER_STATUS_LABEL.inShelter,
    )
    await expect(panel.row(adopted.name!).cell('Status')).toHaveText(
      SHELTER_STATUS_LABEL.outOfShelter,
    )

    await panel.filterByStatus('Poza schroniskiem')
    await panel.expectAnimals([adopted.name!])

    await panel.filterByStatus('W schronisku')
    await panel.expectAnimals([resident.name!])

    await panel.filterByStatus('Wszystkie statusy')
    await panel.expectAnimals([resident.name!, adopted.name!])
  })

  test('filters combine with each other and with search', async ({
    api,
    panel,
  }) => {
    const [dog, cat, adoptedCat] = await api.createAnimals([
      buildAnimal({ species: 'dog', color: 'Rudy' }),
      buildAnimal({ species: 'cat', color: 'Rudy' }),
      buildAnimal({ species: 'cat', color: 'Rudy' }),
    ])
    await api.createAnimal(buildAnimal({ species: 'cat', color: 'Szary' }))
    await api.addEvent(adoptedCat.id, {
      type: 'adoption',
      occurredOn: daysAgo(1),
      description: 'Adopcja',
    })
    await panel.goto()

    await panel.search('rudy')
    await panel.expectAnimals([dog.name!, cat.name!, adoptedCat.name!])

    await panel.filterBySpecies('Kot')
    await panel.expectAnimals([cat.name!, adoptedCat.name!])

    await panel.filterByStatus('Poza schroniskiem')
    await panel.expectAnimals([adoptedCat.name!])
  })

  test('are restored from a shared address', async ({ api, panel }) => {
    const [, adoptedCat] = await api.createAnimals([
      buildAnimal({ species: 'dog' }),
      buildAnimal({ species: 'cat' }),
      buildAnimal({ species: 'cat' }),
    ])
    await api.addEvent(adoptedCat.id, {
      type: 'adoption',
      occurredOn: daysAgo(1),
      description: 'Adopcja',
    })

    await panel.goto({ species: 2, isInShelter: false })

    await expect(panel.speciesFilter).toHaveText('Kot')
    await expect(panel.statusFilter).toHaveText('Poza schroniskiem')
    await panel.expectAnimals([adoptedCat.name!])
  })
})

test.describe('Paging through the register', () => {
  const TOTAL = 25

  test.beforeEach(async ({ api }) => {
    await api.createAnimals(buildAnimals(TOTAL, 'Strona'))
  })

  test('splits a long register into pages of 20', async ({ panel, page }) => {
    await panel.goto()

    await panel.expectPage(1, 2)
    await expect(panel.rows).toHaveCount(20)
    await expect(panel.firstPageButton).toBeDisabled()
    await expect(panel.previousPageButton).toBeDisabled()

    await test.step('next page shows the remainder', async () => {
      await panel.nextPageButton.click()
      await panel.expectPage(2, 2)
      await expect(panel.rows).toHaveCount(TOTAL - 20)
      await expect(page).toHaveURL(/[?&]page=2(&|$)/)
      await expect(panel.nextPageButton).toBeDisabled()
      await expect(panel.lastPageButton).toBeDisabled()
    })

    await test.step('previous page goes back', async () => {
      await panel.previousPageButton.click()
      await panel.expectPage(1, 2)
      await expect(panel.rows).toHaveCount(20)
    })
  })

  test('jumps to the last and the first page', async ({ panel }) => {
    await panel.goto()
    await panel.setPageSize(10)
    await panel.expectPage(1, 3)

    await panel.lastPageButton.click()
    await panel.expectPage(3, 3)
    await expect(panel.rows).toHaveCount(TOTAL - 20)

    await panel.firstPageButton.click()
    await panel.expectPage(1, 3)
    await expect(panel.rows).toHaveCount(10)
  })

  test('lets the user choose how many rows a page holds', async ({
    panel,
    page,
  }) => {
    await panel.goto()

    await panel.setPageSize(10)
    await panel.expectPage(1, 3)
    await expect(panel.rows).toHaveCount(10)
    await expect(page).toHaveURL(/[?&]pageSize=10(&|$)/)

    await panel.setPageSize(50)
    await panel.expectPage(1, 1)
    await expect(panel.rows).toHaveCount(TOTAL)
  })

  test('shows no animal twice and misses none across pages', async ({
    panel,
  }) => {
    await panel.goto()
    await panel.setPageSize(10)

    const seen: Array<string> = []
    for (let current = 1; current <= 3; current++) {
      await panel.expectPage(current, 3)
      seen.push(...(await panel.columnValues('Imię')))
      if (current < 3) await panel.nextPageButton.click()
    }

    expect(seen).toHaveLength(TOTAL)
    expect(new Set(seen).size).toBe(TOTAL)
  })

  test('returns to the first page when the result set changes', async ({
    api,
    panel,
    page,
  }) => {
    const wanted = await api.createAnimal(buildAnimal({ species: 'cat' }))
    await panel.goto({ page: 2 })
    await panel.expectPage(2, 2)

    await panel.filterBySpecies('Pies')

    await panel.expectPage(1, 2)
    await expect(page).toHaveURL(/[?&]page=1(&|$)/)

    await test.step('searching resets the page too', async () => {
      await panel.filterBySpecies('Wszystkie gatunki')
      await panel.nextPageButton.click()
      await panel.expectPage(2, 2)
      await panel.search(wanted.name!)
      await panel.expectPage(1, 1)
      await panel.expectAnimals([wanted.name!])
    })
  })

  test('restores page and page size from a shared address', async ({
    panel,
  }) => {
    await panel.goto({ page: 3, pageSize: 10 })

    await panel.expectPage(3, 3)
    await expect(panel.pageSizeSelect).toHaveText('10')
    await expect(panel.rows).toHaveCount(TOTAL - 20)
  })
})

test.describe('Register photos', () => {
  test('shows the photo marked as main, not simply the first one', async ({
    api,
    panel,
    page,
  }) => {
    const animal = await api.createAnimal(
      buildAnimal({
        photos: [
          pngImage('first.png', { color: COLORS.red }),
          pngImage('main.png', { color: COLORS.blue }),
        ],
        mainPhotoIndex: 1,
      }),
    )
    const stored = await api.getAnimal(animal.id)
    const mainPhoto = mainPhotoOf(stored)

    await panel.goto()

    expect(mainPhoto.fileName).toContain('main')
    await expect(panel.row(animal.name!).photo).toHaveAttribute(
      'src',
      mainPhoto.url,
    )
    await expect(page.locator('table img')).toHaveCount(1)
  })
})
