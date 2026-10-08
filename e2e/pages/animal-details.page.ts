import { expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

export type DetailLabel =
  | 'Gatunek'
  | 'Płeć'
  | 'Sygnatura'
  | 'Umaszczenie'
  | 'Rasa'
  | 'Znaki szczególne'
  | 'Data urodzenia'
  | 'Data dodania'

export const PHOTO_PLACEHOLDER_URL = /placehold\.co/

export class AnimalDetailsPage {
  static path = (animalId: string) => `/animal/${animalId}`

  readonly heading: Locator
  readonly statusBadge: Locator
  readonly mainPhoto: Locator

  readonly editLink: Locator
  readonly eventsLink: Locator
  readonly medicalLink: Locator
  readonly downloadReportButton: Locator
  readonly deleteButton: Locator

  readonly gallery: Locator
  readonly galleryPreview: Locator
  readonly galleryThumbnails: Locator

  readonly deleteDialog: Locator
  readonly confirmDeleteButton: Locator
  readonly cancelDeleteButton: Locator

  private readonly summary: Locator

  constructor(readonly page: Page) {
    this.summary = page
      .locator('[data-slot="card"]')
      .filter({ has: page.getByText('Sygnatura', { exact: true }) })
    this.heading = this.summary.getByRole('heading', { level: 2 })
    this.statusBadge = this.summary.locator('[data-slot="badge"]')
    this.mainPhoto = this.summary.locator('img')

    this.editLink = page.getByRole('link', { name: 'Edytuj dane' })
    this.eventsLink = page.getByRole('link', { name: 'Wydarzenia' })
    this.medicalLink = page.getByRole('link', { name: 'Medyczne' })
    this.downloadReportButton = page.getByRole('button', {
      name: 'Pobierz raport',
    })
    this.deleteButton = page.getByRole('button', { name: 'Usuń', exact: true })

    this.gallery = page
      .locator('[data-slot="card"]')
      .filter({ hasText: 'Galeria Zdjęć' })
    this.galleryPreview = this.gallery.getByAltText(/ podgląd$/)
    this.galleryThumbnails = this.gallery
      .getByRole('button')
      .filter({ has: page.getByAltText(/ zdjęcie \d+$/) })

    this.deleteDialog = page
      .getByRole('dialog')
      .filter({ hasText: 'Potwierdzenie usunięcia' })
    this.confirmDeleteButton = this.deleteDialog.getByRole('button', {
      name: 'Usuń',
    })
    this.cancelDeleteButton = this.deleteDialog.getByRole('button', {
      name: 'Anuluj',
    })
  }

  async goto(animalId: string) {
    await this.page.goto(AnimalDetailsPage.path(animalId))
    await this.expectOpen()
  }

  async expectOpen(animalId?: string) {
    if (animalId) {
      await expect(this.page).toHaveURL(
        new RegExp(`${AnimalDetailsPage.path(animalId)}/?$`),
      )
    }
    await expect(this.editLink).toBeVisible()
  }

  detail(label: DetailLabel) {
    return this.summary
      .getByText(label, { exact: true })
      .locator('xpath=following-sibling::span')
  }

  async expectDetails(details: Partial<Record<DetailLabel, string | RegExp>>) {
    for (const [label, value] of Object.entries(details)) {
      await expect(this.detail(label as DetailLabel)).toHaveText(value)
    }
  }

  async openDeleteDialog() {
    await this.deleteButton.click()
    await expect(this.deleteDialog).toBeVisible()
  }
}

export class Breadcrumbs {
  readonly root: Locator

  constructor(page: Page) {
    this.root = page.getByRole('navigation', { name: 'breadcrumb' })
  }

  async expectTrail(labels: Array<string>) {
    await expect(this.root.locator('[data-slot="breadcrumb-item"]')).toHaveText(
      labels,
    )
  }

  link(label: string) {
    return this.root.getByRole('link', { name: label, exact: true })
  }
}
