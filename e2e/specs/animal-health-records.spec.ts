import { HEALTH_COLUMN, RECORD_ERRORS } from '../pages/animal-records.page.ts'
import {
  asTableDate,
  buildAnimal,
  daysAgo,
  tomorrow,
  unique,
} from '../support/data.ts'
import {
  MEGABYTE,
  PDF_MAGIC,
  pdfDocument,
  pngImage,
  textFile,
  withSize,
} from '../support/files.ts'
import { expect, test, toLocalBlobUrl } from '../support/fixtures.ts'
import type { ApiClient, SeededAnimal } from '../support/api-client.ts'

/**
 * Health records ("karty zdrowia") of an animal at
 * `/animal/:id/medical-records`: adding records with an optional document,
 * editing them inline (including the attachment), deleting and sorting.
 */

test.describe('Health records', () => {
  let animal: SeededAnimal

  test.beforeEach(async ({ api, healthRecords }) => {
    animal = await api.createAnimal(buildAnimal())
    await healthRecords.goto(animal.id)
  })

  test('a new animal has no health records yet', async ({ healthRecords }) => {
    await healthRecords.expectEmpty()
    await expect(healthRecords.addForm).toBeHidden()
  })

  test('a record can be added without a document', async ({
    healthRecords,
    api,
    user,
  }) => {
    const record = {
      occurredOn: daysAgo(3),
      description: unique('Badanie kontrolne'),
    }

    await healthRecords.openAddForm()
    await expect(healthRecords.dateField.input).toHaveValue(daysAgo(0))
    await healthRecords.fillAddForm(record)
    await healthRecords.saveButton.click()

    await expect(healthRecords.addForm).toBeHidden()
    const row = healthRecords.row(record.description)
    await expect(row.cell(HEALTH_COLUMN.date)).toHaveText(
      asTableDate(record.occurredOn),
    )
    await expect(row.cell(HEALTH_COLUMN.description)).toHaveText(
      record.description,
    )
    await expect(row.cell(HEALTH_COLUMN.performedBy)).toHaveText(user.email)
    await expect(row.cell(HEALTH_COLUMN.document)).toHaveText('Brak')

    const stored = await api.getAnimal(animal.id)
    expect(stored.healthRecords).toHaveLength(1)
    expect(stored.healthRecords[0]).toMatchObject({
      description: record.description,
      document: null,
    })
  })

  // The form offers a "Wykonane przez" field, but the API has no such input
  // and always records the signed-in user, so whatever is typed is dropped.
  test.fixme('the "Wykonane przez" value entered in the form is saved', async ({
    healthRecords,
  }) => {
    const description = unique('Zabieg')
    await healthRecords.addRecord({
      occurredOn: daysAgo(1),
      description,
      performedBy: 'lek. wet. Anna Nowak',
    })

    await expect(
      healthRecords.row(description).cell(HEALTH_COLUMN.performedBy),
    ).toHaveText('lek. wet. Anna Nowak')
  })

  test('a record can carry a document that opens from the list', async ({
    healthRecords,
    api,
    blobStorage,
  }) => {
    const description = unique('Wyniki badan krwi')
    const document = pdfDocument('wyniki-krwi.pdf')

    await healthRecords.openAddForm()
    await healthRecords.fillAddForm({
      occurredOn: daysAgo(2),
      description,
      document,
    })
    await expect(healthRecords.documentField.root).toContainText(document.name)
    await healthRecords.saveButton.click()

    const row = healthRecords.row(description)
    const cell = healthRecords.documentCell(row)
    await expect(cell.fileName).toHaveText(document.name)

    const stored = (await api.getAnimal(animal.id)).healthRecords[0]
    expect(stored.document?.fileName).toBe(document.name)

    await test.step('clicking the file name opens the stored document', async () => {
      const openedUrl = await healthRecords.openDocument(row)
      expect(openedUrl).toBe(stored.document?.url)

      const response = await blobStorage.get(toLocalBlobUrl(openedUrl))
      expect(response.status()).toBe(200)
      expect((await response.body()).equals(document.buffer)).toBe(true)
    })
  })

  test('images are accepted as documents too', async ({ healthRecords }) => {
    const description = unique('Zdjecie RTG')

    await healthRecords.addRecord({
      occurredOn: daysAgo(1),
      description,
      document: pngImage('rtg.png'),
    })

    await expect(
      healthRecords.documentCell(healthRecords.row(description)).fileName,
    ).toHaveText('rtg.png')
  })

  test('a chosen document can be dropped before saving', async ({
    healthRecords,
  }) => {
    const description = unique('Bez zalacznika')
    await healthRecords.openAddForm()
    await healthRecords.fillAddForm({
      occurredOn: daysAgo(1),
      description,
      document: pdfDocument('pomylka.pdf'),
    })
    await expect(healthRecords.documentField.root).toContainText('pomylka.pdf')

    await healthRecords.clearDocumentButton.click()

    await expect(healthRecords.documentField.root).not.toContainText(
      'pomylka.pdf',
    )
    await healthRecords.saveButton.click()
    await expect(
      healthRecords.row(description).cell(HEALTH_COLUMN.document),
    ).toHaveText('Brak')
  })

  test('the add form validates description, date and document', async ({
    healthRecords,
    api,
  }) => {
    await healthRecords.openAddForm()

    await test.step('description is required', async () => {
      await healthRecords.saveButton.click()
      await expect(healthRecords.descriptionField.error).toHaveText(
        RECORD_ERRORS.descriptionRequired,
      )
    })

    await test.step('the date cannot be in the future', async () => {
      await healthRecords.dateField.input.fill(tomorrow())
      await expect(healthRecords.dateField.error).toHaveText(
        RECORD_ERRORS.healthDateInFuture,
      )
      await healthRecords.dateField.input.fill(daysAgo(1))
      await expect(healthRecords.dateField.error).toBeHidden()
    })

    await test.step('unsupported file types are refused', async () => {
      await healthRecords.fillAddForm({ document: textFile('notatki.txt') })
      await expect(healthRecords.documentField.error).toHaveText(
        RECORD_ERRORS.documentTypeNotAllowed,
      )
    })

    await test.step('documents over 10 MB are refused', async () => {
      await healthRecords.fillAddForm({
        document: withSize(pdfDocument('skan.pdf'), 10 * MEGABYTE + 1),
      })
      await expect(healthRecords.documentField.error).toHaveText(
        RECORD_ERRORS.documentTooLarge,
      )
    })

    await test.step('nothing was saved', async () => {
      await healthRecords.fillAddForm({ description: 'Opis jest, plik zly' })
      await healthRecords.saveButton.click()
      await expect(healthRecords.addForm).toBeVisible()
      expect((await api.getAnimal(animal.id)).healthRecords).toHaveLength(0)
    })
  })

  test('the add form can be cancelled', async ({ healthRecords }) => {
    await healthRecords.openAddForm()
    await healthRecords.fillAddForm({ description: 'Do wyrzucenia' })

    await healthRecords.cancelButton.click()

    await expect(healthRecords.addForm).toBeHidden()
    await healthRecords.expectEmpty()

    await healthRecords.openAddForm()
    await expect(healthRecords.descriptionField.input).toHaveValue('')
  })
})

test.describe('Editing and deleting health records', () => {
  let animal: SeededAnimal
  const plain = { occurredOn: daysAgo(6), description: 'Karta bez dokumentu' }
  const withDocument = {
    occurredOn: daysAgo(3),
    description: 'Karta z dokumentem',
    document: pdfDocument('wypis.pdf'),
  }

  test.beforeEach(async ({ api, healthRecords }) => {
    animal = await api.createAnimal(buildAnimal())
    await api.addHealthRecord(animal.id, plain)
    await api.addHealthRecord(animal.id, withDocument)
    await healthRecords.goto(animal.id)
  })

  /** The record as the backend has it, looked up by its description. */
  const storedRecord = async (api: ApiClient, description: string) => {
    const { healthRecords } = await api.getAnimal(animal.id)
    const record = healthRecords.find(
      (candidate) => candidate.description === description,
    )
    if (!record) throw new Error(`No stored health record "${description}"`)
    return record
  }

  const storedDescriptions = async (api: ApiClient) =>
    (await api.getAnimal(animal.id)).healthRecords.map(
      (record) => record.description,
    )

  test('date and description are edited in place', async ({
    healthRecords,
    api,
  }) => {
    const description = unique('Poprawiony opis')
    const editor = await healthRecords.edit(plain.description)
    await expect(editor.dateInput).toHaveValue(plain.occurredOn)
    await expect(editor.descriptionInput).toHaveValue(plain.description)

    await editor.dateInput.fill(daysAgo(7))
    await editor.descriptionInput.fill(description)
    await healthRecords.saveEdit()

    const row = healthRecords.row(description)
    await expect(row.cell(HEALTH_COLUMN.date)).toHaveText(
      asTableDate(daysAgo(7)),
    )
    await expect(healthRecords.rows).toHaveCount(2)
    expect((await storedDescriptions(api)).sort()).toEqual(
      [description, withDocument.description].sort(),
    )
  })

  test('cancelling an edit leaves the record untouched', async ({
    healthRecords,
    api,
  }) => {
    const editor = await healthRecords.edit(plain.description)
    await editor.descriptionInput.fill('Zmiana, ktorej nie bedzie')

    await healthRecords.cancelEdit()

    await expect(healthRecords.row(plain.description).root).toBeVisible()
    expect(await storedDescriptions(api)).toContain(plain.description)
  })

  test('a document can be attached to an existing record', async ({
    healthRecords,
    api,
  }) => {
    const editor = await healthRecords.edit(plain.description)
    const cell = healthRecords.documentCell(editor)
    await expect(cell.choosePrompt).toBeVisible()

    await cell.upload(pdfDocument('dolaczony.pdf'))
    await expect(cell.fileName).toHaveText('dolaczony.pdf')
    await healthRecords.saveEdit()

    await expect(
      healthRecords.documentCell(healthRecords.row(plain.description)).fileName,
    ).toHaveText('dolaczony.pdf')
    expect((await storedRecord(api, plain.description)).document).toMatchObject(
      {
        fileName: 'dolaczony.pdf',
      },
    )
  })

  test('the document of a record can be replaced', async ({
    healthRecords,
    api,
  }) => {
    const editor = await healthRecords.edit(withDocument.description)
    const cell = healthRecords.documentCell(editor)
    await expect(cell.fileName).toHaveText('wypis.pdf')
    await expect(cell.replaceButton).toBeVisible()

    await cell.upload(pdfDocument('nowy-wypis.pdf'))
    await expect(cell.fileName).toHaveText('nowy-wypis.pdf')
    await healthRecords.saveEdit()

    await expect(
      healthRecords.documentCell(healthRecords.row(withDocument.description))
        .fileName,
    ).toHaveText('nowy-wypis.pdf')
    expect(
      (await storedRecord(api, withDocument.description)).document?.fileName,
    ).toBe('nowy-wypis.pdf')
  })

  test('the document of a record can be removed', async ({
    healthRecords,
    api,
  }) => {
    const editor = await healthRecords.edit(withDocument.description)
    const cell = healthRecords.documentCell(editor)

    await cell.removeButton.click()
    await expect(cell.choosePrompt).toBeVisible()
    await healthRecords.saveEdit()

    await expect(
      healthRecords.row(withDocument.description).cell(HEALTH_COLUMN.document),
    ).toHaveText('Brak')
    expect(
      (await storedRecord(api, withDocument.description)).document,
    ).toBeNull()
  })

  test('removing a document is undone by cancelling the edit', async ({
    healthRecords,
    api,
  }) => {
    const editor = await healthRecords.edit(withDocument.description)
    await healthRecords.documentCell(editor).removeButton.click()

    await healthRecords.cancelEdit()

    await expect(
      healthRecords.documentCell(healthRecords.row(withDocument.description))
        .fileName,
    ).toHaveText('wypis.pdf')
    expect(
      (await storedRecord(api, withDocument.description)).document?.fileName,
    ).toBe('wypis.pdf')
  })

  test('an edit refuses unsupported and oversized documents', async ({
    healthRecords,
  }) => {
    const editor = await healthRecords.edit(plain.description)
    const cell = healthRecords.documentCell(editor)

    await cell.upload(textFile('notatki.txt'))
    await expect(cell.error).toContainText(RECORD_ERRORS.documentTypeNotAllowed)
    await expect(cell.choosePrompt).toBeVisible()

    await cell.upload(withSize(pdfDocument('skan.pdf'), 10 * MEGABYTE + 1))
    await expect(cell.error).toHaveText(RECORD_ERRORS.documentTooLarge)

    await test.step('a valid file clears the error', async () => {
      await cell.upload(pdfDocument('dobry.pdf'))
      await expect(cell.error).toBeHidden()
      await expect(cell.fileName).toHaveText('dobry.pdf')
    })
  })

  test('an edit cannot move the record into the future', async ({
    healthRecords,
  }) => {
    const editor = await healthRecords.edit(plain.description)

    await editor.dateInput.fill(tomorrow())

    await expect(
      healthRecords.inlineError(RECORD_ERRORS.healthDateInFuture),
    ).toBeVisible()
    await editor.saveButton.click()
    await expect(editor.saveButton).toBeVisible()
  })

  test('deleting asks for confirmation and can be cancelled', async ({
    healthRecords,
    api,
  }) => {
    await healthRecords.requestDelete(plain.description)
    await expect(healthRecords.deleteDialog).toContainText(
      'Czy na pewno chcesz usunąć tę kartę zdrowia?',
    )

    await healthRecords.cancelDeleteButton.click()

    await expect(healthRecords.deleteDialog).toBeHidden()
    await expect(healthRecords.rows).toHaveCount(2)
    expect((await api.getAnimal(animal.id)).healthRecords).toHaveLength(2)
  })

  test('a confirmed delete removes only that record', async ({
    healthRecords,
    api,
  }) => {
    await healthRecords.requestDelete(withDocument.description)
    await healthRecords.confirmDelete()

    await expect(healthRecords.row(withDocument.description).root).toHaveCount(
      0,
    )
    await expect(healthRecords.row(plain.description).root).toBeVisible()
    await expect
      .poll(async () => (await api.getAnimal(animal.id)).healthRecords.length)
      .toBe(1)
  })

  test('records sort by date and by document', async ({ healthRecords }) => {
    await test.step('default: newest first', async () => {
      await healthRecords.expectSortedBy('Data', 'descending')
      expect(
        await healthRecords.columnValues(HEALTH_COLUMN.description),
      ).toEqual([withDocument.description, plain.description])
    })

    await test.step('by date, oldest first', async () => {
      await healthRecords.sortBy('Data', 'ascending')
      expect(
        await healthRecords.columnValues(HEALTH_COLUMN.description),
      ).toEqual([plain.description, withDocument.description])
    })

    await test.step('by document: records without one come first', async () => {
      await healthRecords.sortBy('Dokument', 'ascending')
      expect(await healthRecords.columnValues(HEALTH_COLUMN.document)).toEqual([
        'Brak',
        'wypis.pdf',
      ])
      await healthRecords.sortBy('Dokument', 'descending')
      expect(await healthRecords.columnValues(HEALTH_COLUMN.document)).toEqual([
        'wypis.pdf',
        'Brak',
      ])
    })
  })
})

test.describe('Stored documents', () => {
  test('are kept byte for byte', async ({ api, blobStorage }) => {
    const animal = await api.createAnimal(buildAnimal())
    const document = pdfDocument('oryginal.pdf', unique('tresc'))
    await api.addHealthRecord(animal.id, {
      occurredOn: daysAgo(1),
      description: 'Dokument do porownania',
      document,
    })

    const [record] = (await api.getAnimal(animal.id)).healthRecords
    const response = await blobStorage.get(toLocalBlobUrl(record.document!.url))

    const body = await response.body()
    expect(body.subarray(0, PDF_MAGIC.length).toString('latin1')).toBe(
      PDF_MAGIC,
    )
    expect(body.equals(document.buffer)).toBe(true)
  })
})
