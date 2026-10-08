import { expect } from '@playwright/test'
import { TIMEOUTS } from '../config/env.ts'
import { SEX_LABEL, SPECIES_LABEL } from '../support/domain.ts'
import { FormFieldLocator, chooseOption } from './components.ts'
import type { Locator, Page } from '@playwright/test'
import type { SexKey, SpeciesKey } from '../support/domain.ts'
import type { UploadFile } from '../support/files.ts'

/** Values the animal form accepts; every key is optional so tests fill only what they care about. */
export type AnimalFormValues = {
  name?: string
  transponderCode?: string
  species?: SpeciesKey
  breed?: string
  distinguishingMarks?: string
  signature?: string
  sex?: SexKey
  color?: string
  /** ISO date, `YYYY-MM-DD`. */
  birthDate?: string
}

export const SIGNATURE_PATTERN = /^\d{4}\/\d{4}$/

export const ANIMAL_FORM_ERRORS = {
  speciesRequired: 'Gatunek jest wymagany',
  signatureRequired: 'Oznaczenie jest wymagane',
  signatureFormat:
    'Oznaczenie musi mieć format RRRR/NNNN, gdzie R to rok, a N to numer.',
  signatureTaken:
    'Oznaczenie jest już zajęte, wygeneruj nowe lub wpisz ręcznie i spróbuj ponownie.',
  breedTooLong: 'Rasa nie może mieć więcej niż 100 znaków',
  marksTooLong: 'Znaki szczególne nie mogą mieć więcej niż 100 znaków',
  birthDateInFuture: 'Data urodzenia nie może być z przyszłości',
} as const

export const PHOTO_ALERTS = {
  tooMany: 'Możesz dodać maksymalnie 10 zdjęć.',
  tooLarge: /przekraczają one limit 10MB/,
} as const

/**
 * The animal form. `/create` and `/animal/:id/edit` render the same fields
 * and the same photo manager, so one page object serves both; only the
 * submit button differs.
 */
export class AnimalFormPage {
  static readonly createPath = '/create'
  static editPath = (animalId: string) => `/animal/${animalId}/edit`

  readonly name: Locator
  readonly transponderCode: Locator
  readonly breed: Locator
  readonly distinguishingMarks: Locator
  readonly signature: Locator
  readonly color: Locator
  readonly birthDate: Locator
  readonly speciesSelect: Locator
  readonly sexSelect: Locator

  readonly speciesField: FormFieldLocator
  readonly signatureField: FormFieldLocator
  readonly breedField: FormFieldLocator
  readonly marksField: FormFieldLocator
  readonly birthDateField: FormFieldLocator

  readonly generateSignatureButton: Locator
  readonly signatureInfoButton: Locator
  readonly signatureInfoPopover: Locator

  readonly createButton: Locator
  readonly saveButton: Locator
  readonly cancelButton: Locator
  readonly genericError: Locator

  readonly photos: PhotoManager

  constructor(readonly page: Page) {
    const form = page.locator('form')

    // Placeholders are the reliable handle: some ids in the form are reused.
    this.name = form.getByPlaceholder('Wpisz imię zwierzaka')
    this.transponderCode = form.getByPlaceholder('Wpisz numer chipa')
    this.breed = form.getByPlaceholder('Wpisz rasę zwierzaka')
    this.distinguishingMarks = form.getByPlaceholder(
      /^Wpisz znaki szczególne zwierzaka/,
    )
    this.signature = form.getByPlaceholder('2026/0001')
    this.color = form.getByPlaceholder('Wpisz umaszczenie')

    this.speciesField = new FormFieldLocator(form, 'Gatunek')
    this.signatureField = new FormFieldLocator(form, 'Oznaczenie')
    this.breedField = new FormFieldLocator(form, 'Rasa')
    this.marksField = new FormFieldLocator(form, 'Znaki szczególne')
    this.birthDateField = new FormFieldLocator(form, 'Data urodzenia')

    this.birthDate = this.birthDateField.input
    this.speciesSelect = this.speciesField.select
    this.sexSelect = new FormFieldLocator(form, 'Płeć').select

    this.generateSignatureButton = form.getByRole('button', {
      name: 'Generuj unikalne oznaczenie',
    })
    this.signatureInfoButton = this.signatureField.root.getByRole('button', {
      name: 'Dodatkowe informacje',
    })
    this.signatureInfoPopover = page
      .locator('[data-slot="popover-content"]')
      .filter({ hasText: 'Unikalne oznaczenie zwierzaka' })

    this.createButton = form.getByRole('button', { name: 'Dodaj zwierzaka' })
    this.saveButton = form.getByRole('button', { name: 'Zapisz zmiany' })
    this.cancelButton = form.getByRole('button', { name: 'Anuluj' })
    this.genericError = form.getByText('Wystąpił nieoczekiwany błąd.', {
      exact: false,
    })

    this.photos = new PhotoManager(page, form)
  }

  async gotoCreate() {
    await this.page.goto(AnimalFormPage.createPath)
    await expect(this.createButton).toBeVisible()
  }

  async gotoEdit(animalId: string) {
    await this.page.goto(AnimalFormPage.editPath(animalId))
    await expect(this.saveButton).toBeVisible()
  }

  /** Fills the given fields, leaving the others untouched. */
  async fill(values: AnimalFormValues) {
    if (values.name !== undefined) await this.name.fill(values.name)
    if (values.transponderCode !== undefined) {
      await this.transponderCode.fill(values.transponderCode)
    }
    if (values.species) await this.selectSpecies(values.species)
    if (values.breed !== undefined) await this.breed.fill(values.breed)
    if (values.distinguishingMarks !== undefined) {
      await this.distinguishingMarks.fill(values.distinguishingMarks)
    }
    if (values.signature !== undefined) {
      await this.signature.fill(values.signature)
    }
    if (values.sex) await this.selectSex(values.sex)
    if (values.color !== undefined) await this.color.fill(values.color)
    if (values.birthDate !== undefined) {
      await this.birthDate.fill(values.birthDate)
    }
  }

  async selectSpecies(species: SpeciesKey) {
    await chooseOption(this.speciesSelect, SPECIES_LABEL[species])
  }

  async selectSex(sex: SexKey) {
    await chooseOption(this.sexSelect, SEX_LABEL[sex])
  }

  /**
   * Asks the backend for the next free signature and returns what the form
   * now shows. Requires a species to be selected first.
   */
  async generateSignature() {
    const previous = await this.signature.inputValue()
    await this.generateSignatureButton.click()
    await expect(this.signature).toHaveValue(SIGNATURE_PATTERN)
    // On the edit form the field already holds a valid signature, so also
    // wait for the request to finish before reading the result.
    await expect(this.generateSignatureButton).toBeEnabled()
    const generated = await this.signature.inputValue()
    return { previous, generated }
  }

  async submitCreate() {
    await this.createButton.click()
  }

  async submitSave() {
    await this.saveButton.click()
  }

  /** Asserts the form currently shows these values. */
  async expectValues(values: AnimalFormValues) {
    if (values.name !== undefined) {
      await expect(this.name).toHaveValue(values.name)
    }
    if (values.transponderCode !== undefined) {
      await expect(this.transponderCode).toHaveValue(values.transponderCode)
    }
    if (values.species) {
      await expect(this.speciesSelect).toHaveText(SPECIES_LABEL[values.species])
    }
    if (values.breed !== undefined) {
      await expect(this.breed).toHaveValue(values.breed)
    }
    if (values.distinguishingMarks !== undefined) {
      await expect(this.distinguishingMarks).toHaveValue(
        values.distinguishingMarks,
      )
    }
    if (values.signature !== undefined) {
      await expect(this.signature).toHaveValue(values.signature)
    }
    if (values.sex) {
      await expect(this.sexSelect).toHaveText(SEX_LABEL[values.sex])
    }
    if (values.color !== undefined) {
      await expect(this.color).toHaveValue(values.color)
    }
    if (values.birthDate !== undefined) {
      await expect(this.birthDate).toHaveValue(values.birthDate)
    }
  }
}

/** The photo column of the animal form: thumbnails, preview and actions. */
export class PhotoManager {
  readonly thumbnails: Locator
  readonly mainThumbnail: Locator
  readonly selectedThumbnail: Locator
  readonly preview: Locator
  readonly emptyState: Locator
  readonly counter: Locator

  readonly addButton: Locator
  readonly setAsMainButton: Locator
  readonly rotateButton: Locator
  readonly removeButton: Locator

  private readonly fileInput: Locator

  constructor(
    private readonly page: Page,
    form: Locator,
  ) {
    this.thumbnails = form
      .getByRole('button')
      .filter({ has: page.getByAltText(/^Miniatura \d+$/) })
    // The main photo is marked with a yellow star overlay.
    this.mainThumbnail = this.thumbnails.filter({
      has: page.locator('svg.text-yellow-400'),
    })
    this.selectedThumbnail = form.locator('button.outline-emerald-600')
    this.preview = form.getByAltText('Główne zdjęcie')
    this.emptyState = form.getByText('Brak zdjęcia', { exact: true })
    this.counter = form.getByText(/^\d+ \/ \d+$/)

    this.addButton = form.getByRole('button', { name: 'Dodaj zdjęcia' })
    this.setAsMainButton = form.getByRole('button', {
      name: 'Ustaw jako główne',
    })
    this.rotateButton = form.getByRole('button', { name: 'Obróć w prawo' })
    this.removeButton = form.getByRole('button', { name: 'Usuń zdjęcie' })

    this.fileInput = form.locator('input[type="file"]')
  }

  thumbnail(position: number) {
    return this.thumbnails.nth(position - 1)
  }

  /** Adds photos through the hidden file input behind "Dodaj zdjęcia". */
  async upload(files: Array<UploadFile>) {
    await this.fileInput.setInputFiles(files)
  }

  /**
   * Uploads files the app is expected to refuse and returns the text of the
   * browser alert it raises.
   */
  async uploadExpectingAlert(files: Array<UploadFile>) {
    let message: string | undefined
    // An open alert blocks the page, so it has to be answered from the
    // event handler rather than after the upload call returns.
    this.page.once('dialog', (dialog) => {
      message = dialog.message()
      void dialog.accept()
    })
    await this.fileInput.setInputFiles(files)
    await expect
      .poll(() => message, {
        message: 'the app should refuse the upload with an alert',
        timeout: TIMEOUTS.ui,
      })
      .toBeDefined()
    return message!
  }

  async select(position: number) {
    await this.thumbnail(position).click()
    await expect(this.thumbnail(position)).toHaveClass(/outline-emerald-600/)
  }

  /** 1-based position of the thumbnail showing the stored photo `url`. */
  async positionOf(url: string) {
    const sources = await this.thumbnails
      .locator('img')
      .evaluateAll((images) => images.map((image) => image.getAttribute('src')))
    const index = sources.indexOf(url)
    expect(index, `a thumbnail for ${url}`).toBeGreaterThanOrEqual(0)
    return index + 1
  }

  /** 1-based position of the thumbnail carrying the "main photo" star. */
  async mainPosition() {
    await expect(this.mainThumbnail).toHaveCount(1)
    const alt = await this.mainThumbnail.locator('img').getAttribute('alt')
    return Number(alt?.replace('Miniatura ', ''))
  }

  /** Rendered size of the large preview, to observe a rotation. */
  async previewSize() {
    await expect
      .poll(() =>
        this.preview.evaluate(
          (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
        ),
      )
      .toBe(true)
    return this.preview.evaluate((image: HTMLImageElement) => ({
      width: image.naturalWidth,
      height: image.naturalHeight,
    }))
  }
}
