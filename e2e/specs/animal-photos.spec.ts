import { PHOTO_ALERTS } from '../pages/animal-form.page.ts'
import { PHOTO_PLACEHOLDER_URL } from '../pages/animal-details.page.ts'
import { PanelPage } from '../pages/panel.page.ts'
import { buildAnimal, unique } from '../support/data.ts'
import { COLORS, MEGABYTE, pngImage, withSize } from '../support/files.ts'
import { expect, test } from '../support/fixtures.ts'
import type { Locator } from '@playwright/test'

/**
 * Animal photos: managing them in the create and edit forms and viewing
 * them in the gallery of the animal card. Uploaded files are generated in
 * memory; the backend converts them to WebP and stores them in Azurite.
 */

/** Resolves once the browser has actually decoded the image. */
async function expectImageLoaded(image: Locator) {
  await expect
    .poll(() =>
      image.evaluate(
        (element: HTMLImageElement) =>
          element.complete && element.naturalWidth > 0,
      ),
    )
    .toBe(true)
}

test.describe('Photos while adding an animal', () => {
  test.beforeEach(async ({ animalForm }) => {
    await animalForm.gotoCreate()
  })

  test('uploaded photos get thumbnails, the first one becomes the main photo', async ({
    animalForm,
  }) => {
    const { photos } = animalForm
    await expect(photos.emptyState).toBeVisible()
    await expect(photos.thumbnails).toHaveCount(0)

    await photos.upload([
      pngImage('one.png', { color: COLORS.red }),
      pngImage('two.png', { color: COLORS.blue }),
    ])

    await expect(photos.emptyState).toBeHidden()
    await expect(photos.thumbnails).toHaveCount(2)
    await expect(photos.counter).toHaveText('1 / 2')
    await expectImageLoaded(photos.preview)
    expect(await photos.mainPosition()).toBe(1)

    await test.step('more photos can be added later', async () => {
      await photos.upload([pngImage('three.png', { color: COLORS.yellow })])
      await expect(photos.thumbnails).toHaveCount(3)
      await expect(photos.counter).toHaveText('1 / 3')
      expect(await photos.mainPosition()).toBe(1)
    })
  })

  test('any photo can be previewed and made the main one', async ({
    animalForm,
  }) => {
    const { photos } = animalForm
    await photos.upload([
      pngImage('one.png', { color: COLORS.red }),
      pngImage('two.png', { color: COLORS.blue }),
    ])

    await photos.select(2)
    await expect(photos.counter).toHaveText('2 / 2')
    expect(await photos.mainPosition()).toBe(1)

    await photos.setAsMainButton.click()

    expect(await photos.mainPosition()).toBe(2)
  })

  test('a photo can be rotated before saving', async ({ animalForm }) => {
    const { photos } = animalForm
    await photos.upload([pngImage('wide.png', { width: 60, height: 20 })])
    expect(await photos.previewSize()).toEqual({ width: 60, height: 20 })

    await photos.rotateButton.click()

    await expect
      .poll(() => photos.previewSize())
      .toEqual({ width: 20, height: 60 })
    await expect(photos.thumbnails).toHaveCount(1)
    expect(await photos.mainPosition()).toBe(1)
  })

  test('removing photos keeps a main photo until none are left', async ({
    animalForm,
  }) => {
    const { photos } = animalForm
    await photos.upload([
      pngImage('one.png', { color: COLORS.red }),
      pngImage('two.png', { color: COLORS.blue }),
      pngImage('three.png', { color: COLORS.yellow }),
    ])

    await test.step('removing a regular photo keeps the main one', async () => {
      await photos.select(3)
      await photos.removeButton.click()
      await expect(photos.thumbnails).toHaveCount(2)
      await expect(photos.counter).toHaveText('2 / 2')
      expect(await photos.mainPosition()).toBe(1)
    })

    await test.step('removing the main photo promotes the next one', async () => {
      await photos.select(1)
      await photos.removeButton.click()
      await expect(photos.thumbnails).toHaveCount(1)
      expect(await photos.mainPosition()).toBe(1)
    })

    await test.step('removing the last photo empties the gallery', async () => {
      await photos.removeButton.click()
      await expect(photos.thumbnails).toHaveCount(0)
      await expect(photos.emptyState).toBeVisible()
      await expect(photos.counter).toBeHidden()
    })
  })

  test('at most 10 photos can be attached', async ({ animalForm }) => {
    const { photos } = animalForm
    const batch = (count: number, prefix: string) =>
      Array.from({ length: count }, (_, index) =>
        pngImage(`${prefix}-${index + 1}.png`),
      )

    expect(await photos.uploadExpectingAlert(batch(11, 'too-many'))).toBe(
      PHOTO_ALERTS.tooMany,
    )
    await expect(photos.thumbnails).toHaveCount(0)

    await test.step('the limit counts photos already attached', async () => {
      await photos.upload(batch(10, 'ok'))
      await expect(photos.thumbnails).toHaveCount(10)
      expect(await photos.uploadExpectingAlert(batch(1, 'eleventh'))).toBe(
        PHOTO_ALERTS.tooMany,
      )
      await expect(photos.thumbnails).toHaveCount(10)
    })
  })

  test('photos larger than 10 MB are refused', async ({ animalForm }) => {
    const { photos } = animalForm
    const oversized = withSize(pngImage('huge.png'), 10 * MEGABYTE + 1)

    expect(await photos.uploadExpectingAlert([oversized])).toMatch(
      PHOTO_ALERTS.tooLarge,
    )
    await expect(photos.thumbnails).toHaveCount(0)
    await expect(photos.emptyState).toBeVisible()
  })

  test('photos are saved with the animal and the chosen main photo is used', async ({
    animalForm,
    panel,
    animalDetails,
    api,
    page,
  }) => {
    const name = unique('Fotogeniczny')
    await animalForm.fill({ name, species: 'dog' })
    await animalForm.generateSignature()
    await animalForm.photos.upload([
      pngImage('first.png', { color: COLORS.red }),
      pngImage('chosen.png', { color: COLORS.blue }),
    ])
    await animalForm.photos.select(2)
    await animalForm.photos.setAsMainButton.click()
    await animalForm.submitCreate()

    await expect(page).toHaveURL(new RegExp(`${PanelPage.path}`))
    const { items } = await api.listAnimals(name)
    const stored = await api.getAnimal(items[0].id)
    const mainPhoto = stored.photos.find(
      (photo) => photo.id === stored.mainPhotoId,
    )
    expect(stored.photos).toHaveLength(2)
    expect(mainPhoto?.fileName).toContain('chosen')

    await test.step('the register shows the main photo', async () => {
      await panel.search(name)
      await expect(panel.row(name).photo).toHaveAttribute('src', mainPhoto!.url)
      await expectImageLoaded(panel.row(name).photo)
    })

    await test.step('the card shows it too, next to the full gallery', async () => {
      await panel.openDetails(name)
      await expect(animalDetails.mainPhoto).toHaveAttribute(
        'src',
        mainPhoto!.url,
      )
      await expect(animalDetails.galleryThumbnails).toHaveCount(2)
    })
  })
})

test.describe('Photos while editing an animal', () => {
  test('existing photos are shown with the current main photo marked', async ({
    api,
    animalForm,
  }) => {
    const animal = await api.createAnimal(
      buildAnimal({
        photos: [
          pngImage('one.png', { color: COLORS.red }),
          pngImage('two.png', { color: COLORS.blue }),
        ],
        mainPhotoIndex: 1,
      }),
    )

    const stored = await api.getAnimal(animal.id)
    const mainPhoto = stored.photos.find(
      (photo) => photo.id === stored.mainPhotoId,
    )

    await animalForm.gotoEdit(animal.id)

    const { photos } = animalForm
    await expect(photos.thumbnails).toHaveCount(2)
    expect(mainPhoto?.fileName).toContain('two')
    expect(await photos.mainPosition()).toBe(
      await photos.positionOf(mainPhoto!.url),
    )
    await expectImageLoaded(photos.preview)

    await test.step('stored photos cannot be rotated, only new uploads', async () => {
      await expect(photos.rotateButton).toBeHidden()
      await photos.upload([pngImage('new.png', { color: COLORS.yellow })])
      await expect(photos.thumbnails).toHaveCount(3)
      await photos.select(3)
      await expect(photos.rotateButton).toBeVisible()
    })
  })

  test('a new photo can be added and made the main one', async ({
    api,
    animalForm,
    animalDetails,
  }) => {
    const animal = await api.createAnimal(
      buildAnimal({ photos: [pngImage('old.png', { color: COLORS.red })] }),
    )
    await animalForm.gotoEdit(animal.id)
    const { photos } = animalForm
    await expect(animalForm.saveButton).toBeDisabled()

    await photos.upload([pngImage('fresh.png', { color: COLORS.blue })])
    await photos.select(2)
    await photos.setAsMainButton.click()
    expect(await photos.mainPosition()).toBe(2)
    await animalForm.submitSave()

    await animalDetails.expectOpen(animal.id)
    const stored = await api.getAnimal(animal.id)
    const mainPhoto = stored.photos.find(
      (photo) => photo.id === stored.mainPhotoId,
    )
    expect(stored.photos).toHaveLength(2)
    expect(mainPhoto?.fileName).toContain('fresh')
    await expect(animalDetails.mainPhoto).toHaveAttribute('src', mainPhoto!.url)
    await expect(animalDetails.galleryThumbnails).toHaveCount(2)
  })

  test('another stored photo can become the main one', async ({
    api,
    animalForm,
    animalDetails,
  }) => {
    const animal = await api.createAnimal(
      buildAnimal({
        photos: [
          pngImage('one.png', { color: COLORS.red }),
          pngImage('two.png', { color: COLORS.blue }),
        ],
      }),
    )
    const before = await api.getAnimal(animal.id)
    const second = before.photos.find((photo) => photo.fileName.includes('two'))
    expect(before.mainPhotoId).not.toBe(second?.id)
    await animalForm.gotoEdit(animal.id)

    await animalForm.photos.select(
      await animalForm.photos.positionOf(second!.url),
    )
    await animalForm.photos.setAsMainButton.click()
    await animalForm.submitSave()

    await animalDetails.expectOpen(animal.id)
    const stored = await api.getAnimal(animal.id)
    expect(
      stored.photos.find((photo) => photo.id === stored.mainPhotoId)?.fileName,
    ).toContain('two')
  })

  test('a stored photo can be removed', async ({
    api,
    animalForm,
    animalDetails,
  }) => {
    const animal = await api.createAnimal(
      buildAnimal({
        photos: [
          pngImage('keep.png', { color: COLORS.red }),
          pngImage('drop.png', { color: COLORS.blue }),
        ],
      }),
    )
    const before = await api.getAnimal(animal.id)
    const dropped = before.photos.find((photo) =>
      photo.fileName.includes('drop'),
    )
    await animalForm.gotoEdit(animal.id)

    await animalForm.photos.select(
      await animalForm.photos.positionOf(dropped!.url),
    )
    await animalForm.photos.removeButton.click()
    await expect(animalForm.photos.thumbnails).toHaveCount(1)
    await animalForm.submitSave()

    await animalDetails.expectOpen(animal.id)
    const stored = await api.getAnimal(animal.id)
    expect(stored.photos.map((photo) => photo.fileName)).toEqual([
      expect.stringContaining('keep'),
    ])
    await expect(animalDetails.galleryThumbnails).toHaveCount(0)
  })

  test('removing every photo leaves the animal without one', async ({
    api,
    animalForm,
    animalDetails,
  }) => {
    const animal = await api.createAnimal(
      buildAnimal({ photos: [pngImage('only.png')] }),
    )
    await animalForm.gotoEdit(animal.id)

    await animalForm.photos.removeButton.click()
    await expect(animalForm.photos.emptyState).toBeVisible()
    await animalForm.submitSave()

    await animalDetails.expectOpen(animal.id)
    expect((await api.getAnimal(animal.id)).photos).toHaveLength(0)
    await expect(animalDetails.mainPhoto).toHaveAttribute(
      'src',
      PHOTO_PLACEHOLDER_URL,
    )
  })
})

test.describe('Photo gallery on the animal card', () => {
  test('an animal without photos gets a placeholder', async ({
    api,
    animalDetails,
  }) => {
    const animal = await api.createAnimal(buildAnimal())

    await animalDetails.goto(animal.id)

    await expect(animalDetails.mainPhoto).toHaveAttribute(
      'src',
      PHOTO_PLACEHOLDER_URL,
    )
    await expect(animalDetails.galleryPreview).toHaveAttribute(
      'src',
      PHOTO_PLACEHOLDER_URL,
    )
    await expect(animalDetails.galleryThumbnails).toHaveCount(0)
  })

  test('thumbnails switch the large preview', async ({
    api,
    animalDetails,
  }) => {
    const animal = await api.createAnimal(
      buildAnimal({
        photos: [
          pngImage('one.png', { color: COLORS.red }),
          pngImage('two.png', { color: COLORS.blue }),
          pngImage('three.png', { color: COLORS.yellow }),
        ],
      }),
    )
    const { photos } = await api.getAnimal(animal.id)

    await animalDetails.goto(animal.id)

    await expect(animalDetails.galleryThumbnails).toHaveCount(3)
    await expect(animalDetails.galleryPreview).toHaveAttribute(
      'src',
      photos[0].url,
    )
    await expectImageLoaded(animalDetails.galleryPreview)

    await animalDetails.galleryThumbnails.nth(2).click()

    await expect(animalDetails.galleryPreview).toHaveAttribute(
      'src',
      photos[2].url,
    )
    await expectImageLoaded(animalDetails.galleryPreview)
    await expect(animalDetails.galleryThumbnails.nth(2)).toHaveClass(
      /border-emerald-500/,
    )
  })

  test('shows all ten photos of a fully documented animal', async ({
    api,
    animalDetails,
  }) => {
    const animal = await api.createAnimal(
      buildAnimal({
        photos: Array.from({ length: 10 }, (_, index) =>
          pngImage(`photo-${index + 1}.png`),
        ),
      }),
    )
    const { photos } = await api.getAnimal(animal.id)

    await animalDetails.goto(animal.id)

    await expect(animalDetails.galleryThumbnails).toHaveCount(10)

    await animalDetails.galleryThumbnails.nth(9).click()
    await expect(animalDetails.galleryPreview).toHaveAttribute(
      'src',
      photos[9].url,
    )
  })
})
