import { test, expect } from '../fixtures'
import { createAnimal, navigateToAnimalByName } from '../handlers/animal.handler'
import { ANIMALS } from '../config'

test('delete animal - confirm in dialog', async ({
  authenticatedPage: page,
}) => {
  await createAnimal(page, ANIMALS.deleteConfirm)
  await navigateToAnimalByName(page, ANIMALS.deleteConfirm.name!)

  await page.getByTestId('delete-animal-btn').click()
  await expect(page.getByTestId('delete-dialog-title')).toBeVisible()

  await page.getByTestId('confirm-delete-animal-btn').click()
  await page.waitForURL(/localhost:3000\/?(\?.*)?$/)

  await expect(page).toHaveURL(/localhost:3000\/?(\?.*)?$/)
})

test('delete animal - cancel dialog does not delete', async ({
  authenticatedPage: page,
}) => {
  await createAnimal(page, ANIMALS.deleteCancel)
  await navigateToAnimalByName(page, ANIMALS.deleteCancel.name!)

  const currentUrl = page.url()

  await page.getByTestId('delete-animal-btn').click()
  await page.getByTestId('cancel-delete-animal-btn').click()

  await expect(page).toHaveURL(currentUrl)
  await expect(page.getByTestId('delete-animal-btn')).toBeVisible()

  // cleanup
  await page.getByTestId('delete-animal-btn').click()
  await page.getByTestId('confirm-delete-animal-btn').click()
  await page.waitForURL(/localhost:3000\/?(\?.*)?$/)
})
