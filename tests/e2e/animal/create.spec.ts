import { test, expect } from '../fixtures'
import {
  navigateToCreateAnimal,
  fillAnimalForm,
  submitAnimalForm,
  createAnimal,
  navigateToAnimalByName,
  deleteCurrentAnimal,
} from '../handlers/animal.handler'

test('create animal - minimum required fields (species + signature)', async ({
  authenticatedPage: page,
}) => {
  await navigateToCreateAnimal(page)
  await fillAnimalForm(page, { species: 'Pies' })
  await submitAnimalForm(page)

  await expect(page).toHaveURL(/localhost:3000\/?(\?.*)?$/)
})

test('create animal - all fields filled', async ({
  authenticatedPage: page,
}) => {
  await navigateToCreateAnimal(page)
  await fillAnimalForm(page, {
    name: 'Burek E2E',
    species: 'Pies',
    sex: 'Samiec',
    breed: 'Mieszaniec',
    color: 'Brązowy',
    distinguishingMarks: 'Biała łapa',
    birthDate: '2022-03-15',
  })
  await submitAnimalForm(page)

  await expect(page).toHaveURL(/localhost:3000\/?(\?.*)?$/)
})

test('created animal appears in the list', async ({
  authenticatedPage: page,
}) => {
  await createAnimal(page, { name: 'Filemon E2E', species: 'Kot', sex: 'Samiec' })

  await page.waitForLoadState('networkidle')
  await expect(page.getByTestId('animals-table')).toContainText('Filemon E2E')

  // cleanup
  await navigateToAnimalByName(page, 'Filemon E2E')
  await deleteCurrentAnimal(page)
})
