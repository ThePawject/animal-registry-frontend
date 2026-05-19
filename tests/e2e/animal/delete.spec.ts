import { test, expect } from '../fixtures'
import { createAnimal, navigateToAnimalByName } from '../handlers/animal.handler'

test('delete animal - confirm in dialog', async ({
  authenticatedPage: page,
}) => {
  await createAnimal(page, { name: 'DoUsunięcia E2E', species: 'Pies' })
  await navigateToAnimalByName(page, 'DoUsunięcia E2E')

  await page.getByTestId('delete-animal-btn').click()
  await expect(page.getByTestId('delete-dialog-title')).toBeVisible()

  await page.getByTestId('confirm-delete-animal-btn').click()
  await page.waitForURL(/localhost:3000\/?(\?.*)?$/, { timeout: 10000 })

  await expect(page).toHaveURL(/localhost:3000\/?(\?.*)?$/)
})

test('delete animal - cancel dialog does not delete', async ({
  authenticatedPage: page,
}) => {
  await createAnimal(page, { name: 'NieUsuwaj E2E', species: 'Pies' })
  await navigateToAnimalByName(page, 'NieUsuwaj E2E')

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
