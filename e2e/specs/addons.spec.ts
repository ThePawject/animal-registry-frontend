import { expect, test } from '../support/fixtures.ts'

test.describe('Addons of a shelter admin', () => {
  test.use({ admin: true })

  test('are all switched off in a new shelter', async ({ addons }) => {
    await addons.goto()

    await expect(addons.card('Szczepienia')).toContainText('Wyłączony')
    await expect(addons.card('Pochodzenie zwierzęcia')).toContainText(
      'Wyłączony',
    )
    await expect(addons.navLink('Dodatki')).toBeVisible()
    await expect(addons.navLink('Szczepienia')).toBeHidden()
  })

  test('can be switched on and off from the addon page', async ({ addons }) => {
    await addons.goto()
    await addons.card('Szczepienia').click()
    await expect(addons.statusBadge).toHaveText('Wyłączony')

    await test.step('switching on adds the addon to the navbar', async () => {
      await addons.enable()
      await expect(addons.navLink('Szczepienia')).toBeVisible()
    })

    await test.step('the list shows the new state', async () => {
      await addons.navLink('Dodatki').click()
      await expect(addons.card('Szczepienia')).toContainText('Włączony')
      await expect(addons.card('Pochodzenie zwierzęcia')).toContainText(
        'Wyłączony',
      )
    })

    await test.step('switching off removes it again', async () => {
      await addons.card('Szczepienia').click()
      await addons.disable()
      await expect(addons.navLink('Szczepienia')).toBeHidden()
    })
  })

  test('a disabled addon explains how to switch it on', async ({
    addons,
    animalDetails,
    api,
    page,
  }) => {
    const animal = await api.createAnimal({ species: 'dog', name: 'Burek' })

    await page.goto(`/animal/${animal.id}/vaccinations`)

    await expect(page.getByText('nie jest włączony')).toBeVisible()
    await page.getByRole('link', { name: 'Zobacz, jak go włączyć' }).click()
    await expect(addons.toggleButton).toHaveText('Włącz dodatek')
    await expect(animalDetails.page).toHaveURL(/\/addons\/animal-vaccinations$/)
  })
})

test.describe('Addons of a regular employee', () => {
  test('can be read but not switched', async ({ addons }) => {
    await addons.gotoDetail('animal-vaccinations')

    await expect(addons.statusBadge).toHaveText('Wyłączony')
    await expect(addons.adminOnlyNotice).toBeVisible()
    await expect(addons.toggleButton).toBeHidden()
  })
})
